import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { AuditService } from '@/app/lib/services/audit-service';

// Schema de validare
const checkVerificationSchema = z.object({
  email: z.string().email('Email invalid'),
});

/**
 * API endpoint pentru a verifica dacă un email este deja verificat
 * Această verificare se face direct în baza de date pentru a evita probleme cu sesiunile neactualizate
 */
export async function POST(request: NextRequest) {
  try {
    // Verificăm autorizarea - doar utilizatorul autentificat poate verifica propriul email
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parsăm și validăm datele
    const body = await request.json();
    const result = checkVerificationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Date invalide', issues: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Verificăm dacă email-ul din request este al utilizatorului autentificat
    if (session.user.email?.toLowerCase() !== email.toLowerCase()) {
      // Logăm tentativa de a verifica email-ul altui utilizator
      await AuditService.log({
        userId: session.user.id,
        action: 'UNAUTHORIZED_EMAIL_VERIFICATION_CHECK',
        details: `User ${session.user.email} attempted to check verification for email ${email}`,
      });
      
      return NextResponse.json(
        { error: 'Nu poți verifica starea altui utilizator' },
        { status: 403 }
      );
    }
    
    // Căutăm utilizatorul în baza de date pentru a verifica dacă email-ul este verificat
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, emailVerified: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilizatorul nu a fost găsit' },
        { status: 404 }
      );
    }
    
    // Returnăm starea de verificare a email-ului
    return NextResponse.json({
      isVerified: user.emailVerified !== null,
      verifiedAt: user.emailVerified,
    });
    
  } catch (error) {
    console.error('Eroare la verificarea email-ului:', error);
    return NextResponse.json(
      { error: 'A apărut o eroare la procesarea cererii' },
      { status: 500 }
    );
  }
}