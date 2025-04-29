import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';

// Schema de validare pentru verificarea email-ului
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token-ul este obligatoriu'),
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
    
    console.log('Received verify-email request with token:', body.token ? body.token.substring(0, 6) + '...' : 'missing');
    
    const result = verifyEmailSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      console.error('Token validation failed:', result.error.format());
      
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
      console.log('Looking up token in database:', token.substring(0, 6) + '...');
      
      // Căutăm token-ul în baza de date
      const verificationToken = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: 'EMAIL_VERIFICATION',
        },
        include: {
          user: true,
        },
      });
      
      // Când tokenul nu este găsit, verificăm dacă emailul este deja verificat
      if (!verificationToken) {
        console.error('Token not found in database');
        
        // Încercăm să extragem informații din token (dacă are un format specific)
        const token_parts = token.split('_');
        if (token_parts.length > 1) {
          try {
            // Încercăm să decodificăm partea de email din token
            const potentialEmail = Buffer.from(token_parts[1], 'base64').toString('utf-8');
            if (potentialEmail.includes('@')) {
              const user = await prisma.user.findUnique({
                where: { email: potentialEmail.toLowerCase() },
                select: { id: true, email: true, emailVerified: true },
              });
              
              if (user && user.emailVerified) {
                // Emailul este deja verificat, oferim un mesaj mai clar
                await AuditService.log({
                  userId: user.id,
                  action: 'EMAIL_VERIFICATION_ALREADY_VERIFIED_FROM_TOKEN',
                  details: `Email: ${potentialEmail}`,
                  ipAddress,
                  userAgent,
                });
                
                return NextResponse.json({ 
                  success: true,
                  message: 'Contul tău a fost deja activat anterior.',
                  alreadyVerified: true,
                  email: user.email
                });
              }
            }
          } catch (err) {
            // Ignorăm erorile în această cale de recuperare
            console.warn('Error trying to decode email from token:', err);
          }
        }
        
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
      
      // Verificăm dacă token-ul a expirat
      if (verificationToken.expires < new Date()) {
        console.error('Token has expired. Expiry:', verificationToken.expires);
        
        // Logăm tentativa de folosire a unui token expirat
        await AuditService.log({
          userId: verificationToken.userId,
          action: 'EMAIL_VERIFICATION_EXPIRED_TOKEN',
          details: `Token: ${token.slice(0, 6)}..., Expired: ${verificationToken.expires.toISOString()}`,
          ipAddress,
          userAgent,
        });
        
        // Ștergem token-ul expirat cu gestionarea erorilor
        try {
          await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
          });
          console.log('Expired token deleted');
        } catch (deleteError) {
          console.warn('Could not delete expired token:', deleteError);
        }
        
        return NextResponse.json(
          { error: 'Token-ul de verificare a expirat. Te rugăm să soliciți un token nou.' },
          { status: 400 }
        );
      }
      
      // Verificăm dacă email-ul este deja verificat
      if (verificationToken.user.emailVerified) {
        console.log('Email already verified for user:', verificationToken.user.email);
        
        // Ștergem token-ul care nu mai e necesar
        try {
          await prisma.verificationToken.delete({
            where: { id: verificationToken.id },
          });
          console.log('Token for already verified email deleted');
        } catch (deleteError) {
          console.warn('Could not delete token for already verified email:', deleteError);
        }
        
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
          alreadyVerified: true,
          email: verificationToken.user.email
        });
      }
      
      console.log('Updating user emailVerified status for:', verificationToken.user.email);
      
      // Folosim o tranzacție pentru a asigura că ambele operațiuni sunt finalizate împreună
      await prisma.$transaction(async (tx) => {
        // Actualizăm starea utilizatorului
        await tx.user.update({
          where: { id: verificationToken.userId },
          data: { emailVerified: new Date() },
        });
        
        // Ștergem token-ul folosit
        await tx.verificationToken.delete({
          where: { id: verificationToken.id },
        });
      });
      
      console.log('User verified and token deleted successfully');
      
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
        email: verificationToken.user.email
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