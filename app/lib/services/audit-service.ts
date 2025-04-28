import { prisma } from '@/lib/db';

/**
 * Serviciu pentru înregistrarea evenimentelor de audit importante pentru securitate
 */
export class AuditService {
  /**
   * Înregistrează o acțiune de audit
   */
  static async log(params: {
    userId?: string;
    action: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { userId, action, details, ipAddress, userAgent } = params;

    // Înregistrăm evenimentul în baza de date
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Înregistrează o încercare de autentificare eșuată
   */
  static async logFailedLogin(params: {
    email: string;
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
  }) {
    const { email, ipAddress, userAgent, reason } = params;

    // Căutăm utilizatorul după email pentru a obține ID-ul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    await this.log({
      userId: user?.id,
      action: 'LOGIN_FAILED',
      details: `Email: ${email}, Motiv: ${reason || 'Credențiale incorecte'}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Înregistrează o autentificare reușită
   */
  static async logSuccessfulLogin(params: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { userId, ipAddress, userAgent } = params;

    await this.log({
      userId,
      action: 'LOGIN_SUCCESS',
      ipAddress,
      userAgent,
    });
  }
}