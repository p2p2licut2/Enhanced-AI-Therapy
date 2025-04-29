import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, createEmailVerificationToken } from '@/app/lib/auth/utils';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';
import { RateLimiter } from '@/app/lib/auth/rate-limiter';
import { prisma } from '@/lib/db';

// Schema de validare pentru datele de înregistrare
const registerSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z
    .string()
    .min(10, 'Parola trebuie să aibă cel puțin 10 caractere')
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
        { 
          error: 'Datele furnizate sunt invalide', 
          issues: result.error.format() 
        },
        { status: 400 }
      );
    }
    
    const { email, password, firstName, lastName } = result.data;
    
    try {
      // Verificăm limitarea ratei pentru prevenirea abuzurilor
      const rateLimit = await RateLimiter.checkLimit({
        email,
        ipAddress,
        action: 'REGISTER',
        maxAttempts: 5, // Maxim 5 încercări de înregistrare
        windowHours: 24, // În 24 de ore
      });
      
      if (!rateLimit.allowed) {
        // Logăm tentativa limitată
        await AuditService.log({
          action: 'REGISTER_RATE_LIMITED',
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
      
      // Trimitem email-ul de verificare
      await emailService.sendVerificationEmail(
        user.email,
        `${firstName} ${lastName}`.trim(),
        verificationToken.token
      );
      
      // Logăm înregistrarea reușită
      await AuditService.log({
        userId: user.id,
        action: 'REGISTER_SUCCESS',
        details: `Email: ${email}`,
        ipAddress,
        userAgent,
      });

      // Returnăm succes fără a include date sensibile
      return NextResponse.json({ 
        success: true,
        message: 'Utilizator înregistrat cu succes. Verificați email-ul pentru confirmarea contului.',
        user: {
          id: user.id,
          email: user.email,
          name: `${firstName} ${lastName}`.trim(),
        }
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
      { error: 'A apărut o eroare la procesarea cererii.' },
      { status: 500 }
    );
  }
}