import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, createEmailVerificationToken } from '@/app/lib/auth/utils';
import { AuditService } from '@/app/lib/services/audit-service';
import { prisma } from '@/lib/db';

// Schema de validare pentru datele de înregistrare
const registerSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z
    .string()
    .min(8, 'Parola trebuie să aibă cel puțin 8 caractere')
    .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
    .regex(/[a-z]/, 'Parola trebuie să conțină cel puțin o literă mică')
    .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră')
    .regex(/[^A-Za-z0-9]/, 'Parola trebuie să conțină cel puțin un caracter special'),
  firstName: z.string().min(1, 'Prenumele este obligatoriu'),
  lastName: z.string().min(1, 'Numele este obligatoriu'),
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
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'REGISTER_VALIDATION_FAILED',
        details: JSON.stringify(result.error.format()),
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'Datele furnizate sunt invalide', issues: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email, password, firstName, lastName } = result.data;
    
    try {
      // Verificăm dacă utilizatorul există deja
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      
      if (existingUser) {
        // Logăm tentativa de înregistrare cu email existent
        await AuditService.log({
          action: 'REGISTER_DUPLICATE_EMAIL',
          details: `Email: ${email}`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'USER_ALREADY_EXISTS' },
          { status: 400 }
        );
      }
      
      // Creăm utilizatorul
      const user = await createUser({
        email,
        password,
        firstName,
        lastName,
      });
      
      // Generăm tokenul de verificare email
      const verificationToken = await createEmailVerificationToken(user.id);
      
      // Logăm înregistrarea reușită
      await AuditService.log({
        userId: user.id,
        action: 'REGISTER_SUCCESS',
        details: `Email: ${email}`,
        ipAddress,
        userAgent,
      });
      
      // Aici ar trebui să trimitem email-ul de verificare
      // Implementarea trimiterii email-ului va fi adăugată în pașii următori

      // Returnăm succes fără a include date sensibile
      return NextResponse.json({ 
        success: true,
        message: 'Utilizator înregistrat cu succes. Verificați email-ul pentru confirmarea contului.'
      });
      
    } catch (error) {
      console.error('Eroare la înregistrare:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'REGISTER_ERROR',
        details: `Email: ${email}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la înregistrare. Încercați din nou.' },
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