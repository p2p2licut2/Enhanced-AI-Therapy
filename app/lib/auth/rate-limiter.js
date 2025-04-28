import { prisma } from '@/lib/db';

/**
 * Clasa pentru a gestiona limitarea ratei de trimitere email-uri și alte acțiuni
 */
export class RateLimiter {
  /**
   * Verifică dacă un utilizator sau adresă IP a depășit limita de email-uri trimise
   * @param {Object} options - Opțiunile pentru verificare
   * @param {string} options.email - Email-ul pentru verificare
   * @param {string} options.ipAddress - Adresa IP pentru verificare
   * @param {string} options.action - Tipul de acțiune (e.g. 'EMAIL_VERIFICATION')
   * @param {number} options.maxAttempts - Numărul maxim de încercări permise (default: 5)
   * @param {number} options.windowHours - Fereastra de timp în ore (default: 24)
   * @returns {Promise<{allowed: boolean, remainingAttempts: number, nextAttemptAt: Date|null}>}
   */
  static async checkLimit({ email, ipAddress, action, maxAttempts = 5, windowHours = 24 }) {
    const windowMs = windowHours * 60 * 60 * 1000;
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    
    // În primul rând, verificăm utilizatorul după email (dacă este furnizat)
    if (email) {
      // Identificăm utilizatorul
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });
      
      if (user) {
        // Numărăm acțiunile recente pentru acest utilizator
        const recentAttempts = await prisma.auditLog.count({
          where: {
            userId: user.id,
            action,
            timestamp: { gte: windowStart },
          },
        });
        
        if (recentAttempts >= maxAttempts) {
          // Găsim timpul celui mai vechi log care va ieși din fereastră
          const oldestLog = await prisma.auditLog.findFirst({
            where: {
              userId: user.id,
              action,
              timestamp: { gte: windowStart },
            },
            orderBy: { timestamp: 'asc' },
          });
          
          if (oldestLog) {
            const nextAttemptAt = new Date(oldestLog.timestamp.getTime() + windowMs);
            return {
              allowed: false,
              remainingAttempts: 0,
              nextAttemptAt,
            };
          }
        }
        
        return {
          allowed: true,
          remainingAttempts: maxAttempts - recentAttempts,
          nextAttemptAt: null,
        };
      }
    }
    
    // Dacă nu am găsit utilizatorul sau nu s-a furnizat email, verificăm după IP
    if (ipAddress) {
      const recentAttempts = await prisma.auditLog.count({
        where: {
          ipAddress,
          action,
          timestamp: { gte: windowStart },
        },
      });
      
      if (recentAttempts >= maxAttempts) {
        // Găsim timpul celui mai vechi log care va ieși din fereastră
        const oldestLog = await prisma.auditLog.findFirst({
          where: {
            ipAddress,
            action,
            timestamp: { gte: windowStart },
          },
          orderBy: { timestamp: 'asc' },
        });
        
        if (oldestLog) {
          const nextAttemptAt = new Date(oldestLog.timestamp.getTime() + windowMs);
          return {
            allowed: false,
            remainingAttempts: 0,
            nextAttemptAt,
          };
        }
      }
      
      return {
        allowed: true,
        remainingAttempts: maxAttempts - recentAttempts,
        nextAttemptAt: null,
      };
    }
    
    // Dacă ajungem aici, nu avem suficiente informații pentru a limita
    return {
      allowed: true,
      remainingAttempts: maxAttempts,
      nextAttemptAt: null,
    };
  }
  
  /**
   * Formatează un mesaj de eroare pentru limita de încercări
   * @param {Date} nextAttemptAt - Când se poate face următoarea încercare
   * @returns {string} - Mesajul formatat
   */
  static formatLimitMessage(nextAttemptAt) {
    if (!nextAttemptAt) {
      return 'Ai depășit numărul maxim de încercări. Te rugăm să încerci mai târziu.';
    }
    
    const now = new Date();
    const diffMs = nextAttemptAt.getTime() - now.getTime();
    
    // Convertim diferența în unități de timp
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffHours > 0) {
      return `Ai depășit numărul maxim de încercări. Te rugăm să încerci din nou în ${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}.`;
    } else if (diffMinutes > 0) {
      return `Ai depășit numărul maxim de încercări. Te rugăm să încerci din nou în ${diffMinutes} ${diffMinutes === 1 ? 'minut' : 'minute'}.`;
    } else {
      return 'Ai depășit numărul maxim de încercări. Te rugăm să încerci din nou în câteva momente.';
    }
  }
}