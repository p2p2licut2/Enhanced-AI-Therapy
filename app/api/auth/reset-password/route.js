import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';
import { hashPassword, comparePasswords, validatePasswordComplexity } from '@/app/lib/auth/security';
import crypto from 'crypto';

// Schema de validare pentru resetarea parolei
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token-ul este obligatoriu'),
  password: z
    .string()
    .min(10, 'Parola trebuie să aibă cel puțin 10 caractere')
    .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
    .regex(/[a-z]/, 'Parola trebuie să conțină cel puțin o literă mică')
    .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră')
    .regex(/[^A-Za-z0-9]/, 'Parola trebuie să conțină cel puțin un caracter special'),
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
    const result = resetPasswordSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'RESET_PASSWORD_VALIDATION_FAILED',
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
    
    const { token, password } = result.data;
    
    try {
      // Adăugăm un delay aleatoriu pentru a preveni timing attacks
      const randomDelay = crypto.randomInt(100, 300);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      // Căutăm token-ul în baza de date
      const resetToken = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: 'PASSWORD_RESET',
          expires: { gt: new Date() }, // Token-ul nu a expirat
        },
        include: {
          user: true, // Include utilizatorul asociat
        },
      });
      
      if (!resetToken) {
        // Logăm tentativa de folosire a unui token invalid
        await AuditService.log({
          action: 'RESET_PASSWORD_INVALID_TOKEN',
          details: `Token: ${token.slice(0, 6)}...`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'Token-ul de resetare este invalid sau a expirat' },
          { status: 400 }
        );
      }
      
      const user = resetToken.user;
      
      // Verificăm dacă noua parolă este diferită de cea veche
      if (user.password) {
        const isSamePassword = await comparePasswords(password, user.password);
        if (isSamePassword) {
          await AuditService.log({
            userId: user.id,
            action: 'RESET_PASSWORD_SAME_PASSWORD',
            ipAddress,
            userAgent,
          });
          
          return NextResponse.json(
            { error: 'Noua parolă nu poate fi identică cu parola anterioară' },
            { status: 400 }
          );
        }
      }
      
      // Generăm hash pentru noua parolă
      const hashedPassword = await hashPassword(password);
      
      // Actualizăm parola utilizatorului
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      // Ștergem toate token-urile de resetare pentru acest utilizator
      await prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'PASSWORD_RESET',
        },
      });
      
      // Logăm resetarea reușită
      await AuditService.log({
        userId: user.id,
        action: 'RESET_PASSWORD_SUCCESS',
        details: `Email: ${user.email}`,
        ipAddress,
        userAgent,
      });
      
      // Trimitem email de confirmare
      try {
        const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        await emailService.sendPasswordChangedEmail(
          user.email,
          userName
        );
      } catch (emailError) {
        // Continuăm chiar dacă email-ul de confirmare eșuează
        console.error('Eroare la trimiterea email-ului de confirmare:', emailError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Parola a fost resetată cu succes',
      });
      
    } catch (error) {
      console.error('Eroare la resetarea parolei:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'RESET_PASSWORD_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la resetarea parolei' },
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
}import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import { emailService } from '@/app/lib/services/email-service';
import { hashPassword, comparePasswords, validatePasswordComplexity } from '@/app/lib/auth/security';
import crypto from 'crypto';

// Schema de validare pentru resetarea parolei
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token-ul este obligatoriu'),
  password: z
    .string()
    .min(10, 'Parola trebuie să aibă cel puțin 10 caractere')
    .regex(/[A-Z]/, 'Parola trebuie să conțină cel puțin o literă mare')
    .regex(/[a-z]/, 'Parola trebuie să conțină cel puțin o literă mică')
    .regex(/[0-9]/, 'Parola trebuie să conțină cel puțin o cifră')
    .regex(/[^A-Za-z0-9]/, 'Parola trebuie să conțină cel puțin un caracter special'),
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
    const result = resetPasswordSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'RESET_PASSWORD_VALIDATION_FAILED',
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
    
    const { token, password } = result.data;
    
    try {
      // Adăugăm un delay aleatoriu pentru a preveni timing attacks
      const randomDelay = crypto.randomInt(100, 300);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      // Căutăm token-ul în baza de date
      const resetToken = await prisma.verificationToken.findFirst({
        where: {
          token,
          type: 'PASSWORD_RESET',
          expires: { gt: new Date() }, // Token-ul nu a expirat
        },
        include: {
          user: true, // Include utilizatorul asociat
        },
      });
      
      if (!resetToken) {
        // Logăm tentativa de folosire a unui token invalid
        await AuditService.log({
          action: 'RESET_PASSWORD_INVALID_TOKEN',
          details: `Token: ${token.slice(0, 6)}...`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'Token-ul de resetare este invalid sau a expirat' },
          { status: 400 }
        );
      }
      
      const user = resetToken.user;
      
      // Verificăm dacă noua parolă este diferită de cea veche
      if (user.password) {
        const isSamePassword = await comparePasswords(password, user.password);
        if (isSamePassword) {
          await AuditService.log({
            userId: user.id,
            action: 'RESET_PASSWORD_SAME_PASSWORD',
            ipAddress,
            userAgent,
          });
          
          return NextResponse.json(
            { error: 'Noua parolă nu poate fi identică cu parola anterioară' },
            { status: 400 }
          );
        }
      }
      
      // Generăm hash pentru noua parolă
      const hashedPassword = await hashPassword(password);
      
      // Actualizăm parola utilizatorului
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      // Ștergem toate token-urile de resetare pentru acest utilizator
      await prisma.verificationToken.deleteMany({
        where: {
          userId: user.id,
          type: 'PASSWORD_RESET',
        },
      });
      
      // Logăm resetarea reușită
      await AuditService.log({
        userId: user.id,
        action: 'RESET_PASSWORD_SUCCESS',
        details: `Email: ${user.email}`,
        ipAddress,
        userAgent,
      });
      
      // Trimitem email de confirmare
      try {
        const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
        await emailService.sendPasswordChangedEmail(
          user.email,
          userName
        );
      } catch (emailError) {
        // Continuăm chiar dacă email-ul de confirmare eșuează
        console.error('Eroare la trimiterea email-ului de confirmare:', emailError);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Parola a fost resetată cu succes',
      });
      
    } catch (error) {
      console.error('Eroare la resetarea parolei:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'RESET_PASSWORD_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la resetarea parolei' },
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