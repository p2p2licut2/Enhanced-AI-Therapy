import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createEmailVerificationToken } from '@/app/lib/auth/utils';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';
import { RateLimiter } from '@/app/lib/auth/rate-limiter';
import { prisma } from '@/lib/db';

// Schema de validare pentru retrimiterea email-ului de verificare
const resendSchema = z.object({
  email: z.string().email('Email invalid'),
});

export async function POST(request) {
  try {
    // Extragem informații despre client pentru logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Parsăm și validăm datele
    const body = await request.json();
    const result = resendSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'RESEND_VERIFICATION_VALIDATION_FAILED',
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
      // Verificăm limitarea ratei
      const rateLimit = await RateLimiter.checkLimit({
        email,
        ipAddress,
        action: 'RESEND_VERIFICATION',
        maxAttempts: 5, // Maxim 5 încercări
        windowHours: 24, // În 24 de ore
      });
      
      if (!rateLimit.allowed) {
        // Logăm tentativa limitată
        await AuditService.log({
          action: 'RESEND_VERIFICATION_RATE_LIMITED',
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
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      
      if (!user) {
        // Logăm tentativa pentru un email care nu există
        await AuditService.log({
          action: 'RESEND_VERIFICATION_NONEXISTENT_EMAIL',
          details: `Email: ${email}`,
          ipAddress,
          userAgent,
        });
        
        // Nu dezvăluim dacă email-ul există sau nu (pentru securitate)
        return NextResponse.json({ 
          success: true,
          message: 'Dacă există un cont cu acest email, un nou email de verificare a fost trimis.',
        });
      }
      
      // Verificăm dacă email-ul a fost deja verificat
      if (user.emailVerified) {
        // Logăm tentativa pentru un email deja verificat
        await AuditService.log({
          userId: user.id,
          action: 'RESEND_VERIFICATION_ALREADY_VERIFIED',
          details: `Email: ${email}`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json({ 
          success: true,
          message: 'Acest email a fost deja verificat. Te poți autentifica cu contul tău.',
        });
      }
      
      // Ștergem orice token vechi de verificare
      await prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'EMAIL_VERIFICATION',
        },
      });
      
      // Generăm un nou token de verificare
      const verificationToken = await createEmailVerificationToken(user.id);
      
      // Trimitem email-ul de verificare
      await emailService.sendVerificationEmail(
        user.email,
        user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        verificationToken.token
      );
      
      // Logăm retrimiterea cu succes
      await AuditService.log({
        userId: user.id,
        action: 'RESEND_VERIFICATION_SUCCESS',
        details: `Email: ${email}`,
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Un nou email de verificare a fost trimis. Te rugăm să verifici căsuța de email.',
      });
      
    } catch (error) {
      console.error('Eroare la retrimiterea verificării:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'RESEND_VERIFICATION_ERROR',
        details: `Email: ${email}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la retrimiterea email-ului. Încearcă din nou.' },
        { status: 500 }
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