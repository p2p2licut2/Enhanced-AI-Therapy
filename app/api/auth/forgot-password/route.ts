import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';
import { RateLimiter } from '@/app/lib/auth/rate-limiter';
import { createPasswordResetToken } from '@/app/lib/auth/utils';
import crypto from 'crypto';

// Schema de validare pentru solicitarea resetării parolei
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalid'),
});

export async function POST(request: NextRequest) {
  try {
    // Extragem informații despre client pentru logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Parsăm și validăm datele
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'FORGOT_PASSWORD_VALIDATION_FAILED',
        details: JSON.stringify(result.error.format()),
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { 
          error: 'Adresa de email este invalidă', 
          issues: result.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    try {
      // Verificăm limitarea ratei pentru prevenirea abuzurilor
      const rateLimit = await RateLimiter.checkLimit({
        email,
        ipAddress,
        action: 'FORGOT_PASSWORD',
        maxAttempts: 3, // Maxim 3 încercări
        windowHours: 1, // În 1 oră
      });
      
      if (!rateLimit.allowed) {
        // Logăm tentativa limitată
        await AuditService.log({
          action: 'FORGOT_PASSWORD_RATE_LIMITED',
          details: `Email: ${email}, IP: ${ipAddress}`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { 
            error: RateLimiter.formatLimitMessage(rateLimit.nextAttemptAt),
            rateLimited: true,
            nextAttemptAt: rateLimit.nextAttemptAt
          },
          { status: 429 }
        );
      }

      // Verificăm dacă utilizatorul există
      // Adăugăm un delay aleatoriu pentru a preveni timing attacks
      const randomDelay = crypto.randomInt(100, 300);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      
      // Logăm tentativa, indiferent dacă utilizatorul există sau nu
      await AuditService.log({
        userId: user?.id,
        action: 'FORGOT_PASSWORD_REQUEST',
        details: `Email: ${email}`,
        ipAddress,
        userAgent,
      });
      
      if (!user) {
        // Nu dezvăluim dacă utilizatorul există sau nu
        // Dar nu continuăm procesul dacă nu există
        return NextResponse.json({ 
          success: true,
          message: 'Dacă există un cont cu acest email, vei primi un email cu instrucțiuni pentru resetarea parolei.'
        });
      }
      
      // Ștergem orice token vechi de resetare a parolei
      await prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'PASSWORD_RESET',
        },
      });
      
      // Generăm un nou token pentru resetarea parolei
      const resetToken = await createPasswordResetToken(user.id);
      
      // Trimitem email-ul de resetare
      const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      await emailService.sendPasswordResetEmail(
        user.email,
        userName,
        resetToken.token
      );
      
      return NextResponse.json({ 
        success: true,
        message: 'Dacă există un cont cu acest email, vei primi un email cu instrucțiuni pentru resetarea parolei.'
      });
      
    } catch (error) {
      console.error('Eroare la procesarea solicitării de resetare parolă:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'FORGOT_PASSWORD_ERROR',
        details: `Email: ${email}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress,
        userAgent,
      });
      
      // Nu dezvăluim erori specifice utilizatorului
      return NextResponse.json(
        { 
          success: true,
          message: 'Dacă există un cont cu acest email, vei primi un email cu instrucțiuni pentru resetarea parolei.' 
        }
      );
    }
    
  } catch (error) {
    console.error('Eroare la procesarea cererii:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la procesarea cererii' },
      { status: 500 }
    );
  }
}