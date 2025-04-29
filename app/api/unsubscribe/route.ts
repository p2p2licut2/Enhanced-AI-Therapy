import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuditService } from '@/app/lib/services/audit-service';

// Schema de validare pentru dezabonare
const unsubscribeSchema = z.object({
  email: z.string().email('Email invalid'),
  type: z.enum(['all', 'verification', 'security', 'marketing']).optional().default('all'),
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
    const result = unsubscribeSchema.safeParse(body);
    
    if (!result.success) {
      // Logăm încercarea eșuată
      await AuditService.log({
        action: 'UNSUBSCRIBE_VALIDATION_FAILED',
        details: JSON.stringify(result.error.format()),
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'Datele furnizate sunt invalide', issues: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email, type } = result.data;
    
    try {
      // Căutăm utilizatorul după email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { userPreferences: true },
      });
      
      if (!user) {
        // Nu dezvăluim dacă utilizatorul există sau nu (pentru securitate)
        // Logging
        await AuditService.log({
          action: 'UNSUBSCRIBE_NONEXISTENT_EMAIL',
          details: `Email: ${email}, Type: ${type}`,
          ipAddress,
          userAgent,
        });
        
        // Returnăm succes pentru a nu dezvălui dacă email-ul există
        return NextResponse.json({ 
          success: true,
          message: 'Dacă există un cont cu acest email, preferințele au fost actualizate.',
        });
      }
      
      // Actualizăm preferințele utilizatorului în funcție de tipul de dezabonare
      const preferencesUpdate: Record<string, any> = {};
      
      if (type === 'all' || type === 'marketing') {
        preferencesUpdate.marketingEmails = false;
      }
      
      if (type === 'all' || type === 'security') {
        preferencesUpdate.securityEmails = false;
      }
      
      if (type === 'all' || type === 'verification') {
        // Pentru email-urile de verificare, nu putem dezactiva complet
        // dar putem seta o preferință pentru frecvența redusă
        preferencesUpdate.essentialEmailsFrequency = 'low';
      }
      
      // Dacă utilizatorul nu are încă preferințe, le creăm
      if (!user.userPreferences) {
        await prisma.userPreference.create({
          data: {
            userId: user.id,
            ...preferencesUpdate,
          },
        });
      } else {
        // Actualizăm preferințele existente
        await prisma.userPreference.update({
          where: { userId: user.id },
          data: preferencesUpdate,
        });
      }
      
      // Logăm dezabonarea reușită
      await AuditService.log({
        userId: user.id,
        action: 'UNSUBSCRIBE_SUCCESS',
        details: `Email: ${email}, Type: ${type}`,
        ipAddress,
        userAgent,
      });
      
      // Returnăm un răspuns de succes
      return NextResponse.json({
        success: true,
        message: `Dezabonare reușită de la ${
          type === 'all' ? 'toate email-urile' : 
          type === 'marketing' ? 'email-urile de marketing' :
          type === 'security' ? 'notificările de securitate' :
          'email-urile de verificare'
        }.`,
      });
      
    } catch (error) {
      console.error('Eroare la procesarea dezabonării:', error);
      
      // Logăm eroarea
      await AuditService.log({
        action: 'UNSUBSCRIBE_ERROR',
        details: `Email: ${email}, Type: ${type}, Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ipAddress,
        userAgent,
      });
      
      return NextResponse.json(
        { error: 'A apărut o eroare la procesarea cererii de dezabonare.' },
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