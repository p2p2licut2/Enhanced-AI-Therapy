import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';
import { createEmailVerificationToken } from '@/app/lib/auth/utils';

// Schema de validare pentru verificarea email-ului
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token-ul este obligatoriu'),
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
    const result = verifyEmailSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'EMAIL_VERIFICATION_VALIDATION_FAILED',
        details: JSON.stringify(result.error.format()),
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'Token-ul lipsește sau este invalid.' },
        { status: 400 }
      );
    }
    
    const { token } = result.data;
    
    try {
      // Căutăm token-ul în baza de date
      const verificationToken = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: 'EMAIL_VERIFICATION',
          expires: { gt: new Date() },
        },
        include: {
          user: true,
        },
      });
      
      if (!verificationToken) {
        // Logăm tentativa de folosire a unui token invalid
        await AuditService.log({
          action: 'EMAIL_VERIFICATION_INVALID_TOKEN',
          details: `Token: ${token.slice(0, 6)}...`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'Token-ul de verificare este invalid sau a expirat.' },
          { status: 400 }
        );
      }
      
      // Verificăm dacă email-ul este deja verificat
      if (verificationToken.user.emailVerified) {
        // Ștergem token-ul folosit
        await prisma.verificationToken.delete({
          where: { id: verificationToken.id },
        });
        
        // Logăm tentativa pentru un email deja verificat
        await AuditService.log({
          userId: verificationToken.userId,
          action: 'EMAIL_VERIFICATION_ALREADY_VERIFIED',
          details: `Email: ${verificationToken.user.email}`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json({ 
          success: true,
          message: 'Acest email a fost deja verificat. Te poți autentifica cu contul tău.',
        });
      }
      
      // Actualizăm starea utilizatorului
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      });
      
      // Ștergem token-ul folosit
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      
      // Logăm verificarea reușită
      await AuditService.log({
        userId: verificationToken.userId,
        action: 'EMAIL_VERIFICATION_SUCCESS',
        details: `Email: ${verificationToken.user.email}`,
        ipAddress,
        userAgent,
      });
      
      // Trimitem opțional un email de confirmare/bun venit
      try {
        const userName = verificationToken.user.name || 
                       `${verificationToken.user.firstName || ''} ${verificationToken.user.lastName || ''}`.trim();
         
        // Aici putem adăuga trimiterea unui email de bun venit
        // await emailService.sendWelcomeEmail(verificationToken.user.email, userName);
      } catch (emailError) {
        // Continuăm chiar dacă email-ul de bun venit eșuează
        console.error('Eroare la trimiterea email-ului de bun venit:', emailError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email-ul a fost verificat cu succes. Te poți autentifica cu contul tău.',
      });
      
    } catch (error) {
      console.error('Eroare la verificarea email-ului:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'EMAIL_VERIFICATION_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la verificarea email-ului. Încearcă din nou.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Eroare la procesarea cererii:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la procesarea cererii.' },
      { status: 500 }
    );
  }
}