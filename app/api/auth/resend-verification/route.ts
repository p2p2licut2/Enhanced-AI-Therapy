import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    // Extragem informații despre client pentru logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Parsăm și validăm datele
    const body = await request.json();
    
    console.log('Received resend-verification request with body:', body);
    
    const result = resendSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      console.error('Validation failed:', result.error.format());
      
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
      console.log('Looking up user with email:', email);
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      
      if (!user) {
        // Logăm tentativa pentru un email care nu există
        console.log('User not found for email:', email);
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
        console.log('Email already verified:', email);
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
          emailVerified: true
        });
      }
      
      // Ștergem orice token vechi de verificare
      console.log('Deleting old verification tokens for user:', user.id);
      await prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'EMAIL_VERIFICATION',
        },
      });
      
      // Generăm un nou token de verificare (48 ore valabilitate)
      console.log('Creating new verification token for user:', user.id);
      const verificationToken = await createEmailVerificationToken(user.id, 48);
      console.log('Created verification token:', verificationToken.token.substring(0, 6) + '...');
      console.log('Token expires at:', verificationToken.expires);
      
      // Trimitem email-ul de verificare
      console.log('Sending verification email to:', user.email);
      try {
        const emailResult = await emailService.sendVerificationEmail(
          user.email,
          user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          verificationToken.token
        );
        
        console.log('Email verification send result:', emailResult);
        
        if (!emailResult.success) {
          throw new Error(emailResult.error || 'Failed to send verification email');
        }
        
        // Dacă suntem în development și avem un URL de previzualizare, îl includem în răspuns
        const responseData: any = { 
          success: true,
          message: 'Un nou email de verificare a fost trimis. Te rugăm să verifici căsuța de email.',
        };
        
        if (emailResult.previewUrl) {
          responseData.previewUrl = emailResult.previewUrl;
        }
        
        if (emailResult.devMode) {
          responseData.devMode = true;
          responseData.message += ' (Development mode: email logging only)';
        }
        
        // Logăm retrimiterea cu succes
        await AuditService.log({
          userId: user.id,
          action: 'RESEND_VERIFICATION_SUCCESS',
          details: `Email: ${email}, Token: ${verificationToken.token.substring(0, 6)}..., Expires: ${verificationToken.expires}`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(responseData);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        
        // Logăm eroarea
        await AuditService.log({
          userId: user.id,
          action: 'RESEND_VERIFICATION_EMAIL_ERROR',
          details: `Email: ${email}, Error: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'A apărut o eroare la trimiterea email-ului. Încearcă din nou.' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error processing resend verification request:', error);
      
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
    console.error('General error processing request:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la procesarea cererii' },
      { status: 500 }
    );
  }
}