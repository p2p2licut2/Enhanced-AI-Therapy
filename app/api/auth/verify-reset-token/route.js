import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';
import crypto from 'crypto';

// Schema de validare pentru verificarea token-ului
const verifyTokenSchema = z.object({
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
    const result = verifyTokenSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'VERIFY_RESET_TOKEN_VALIDATION_FAILED',
        details: JSON.stringify(result.error.format()),
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'Token-ul lipsește sau este invalid' },
        { status: 400 }
      );
    }
    
    const { token } = result.data;
    
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
          user: true, // Include utilizatorul asociat pentru logare
        },
      });
      
      if (!resetToken) {
        // Logăm tentativa de folosire a unui token invalid
        await AuditService.log({
          action: 'VERIFY_RESET_TOKEN_INVALID',
          details: `Token: ${token.slice(0, 6)}...`,
          ipAddress,
          userAgent,
        });
        
        return NextResponse.json(
          { error: 'Token-ul de resetare este invalid sau a expirat' },
          { status: 400 }
        );
      }
      
      // Logăm verificarea reușită
      await AuditService.log({
        userId: resetToken.userId,
        action: 'VERIFY_RESET_TOKEN_SUCCESS',
        details: `Email: ${resetToken.user.email}`,
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json({
        success: true,
        message: 'Token-ul este valid',
        userId: resetToken.userId,
      });
      
    } catch (error) {
      console.error('Eroare la verificarea token-ului de resetare:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'VERIFY_RESET_TOKEN_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la verificarea token-ului' },
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