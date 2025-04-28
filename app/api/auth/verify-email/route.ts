import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import { validateToken } from '@/app/lib/auth/utils';

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
      const verificationToken = await validateToken(token, 'EMAIL_VERIFICATION');
      
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
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Email-ul a fost verificat cu succes.',
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
      
      // Verificăm tipul erorii pentru un răspuns mai specific
      if (error instanceof Error && error.message === 'INVALID_TOKEN') {
        return NextResponse.json(
          { error: 'Token-ul de verificare este invalid sau a expirat.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'A apărut o eroare la verificarea email-ului. Încercați din nou.' },
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