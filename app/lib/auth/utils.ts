import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

/**
 * Generează o parolă hașată
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compară o parolă cu hash-ul stocat
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generează un token aleatoriu și securizat
 */
export function generateToken(length: number = 40): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Creează un nou utilizator în baza de date
 */
export async function createUser({
  email,
  password,
  firstName,
  lastName,
  role = UserRole.USER,
}: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}) {
  // Verificăm dacă utilizatorul există deja
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('USER_ALREADY_EXISTS');
  }

  // Hașăm parola
  const hashedPassword = await hashPassword(password);

  // Creăm utilizatorul
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      role,
      // Creăm și preferințele utilizatorului
      userPreferences: {
        create: {}
      }
    },
  });

  return user;
}

/**
 * Generează un token de verificare email
 * @param userId ID-ul utilizatorului
 * @param email Adresa de email a utilizatorului (pentru recuperare)
 * @param expiresInHours Perioada de expirare în ore (default: 48 ore)
 */
export async function createEmailVerificationToken(userId: string, expiresInHours: number = 48, email?: string) {
  // Generăm partea aleatorie a tokenului
  const randomPart = crypto.randomBytes(20).toString('hex');
  
  // Dacă avem email, îl includem în token pentru recuperare
  let token = randomPart;
  if (email) {
    // Codificăm emailul și îl adăugăm la token
    const encodedEmail = Buffer.from(email).toString('base64');
    token = `${randomPart}_${encodedEmail}`;
  }
  
  // Calculăm data de expirare
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Ștergem orice token anterior
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: 'EMAIL_VERIFICATION',
    },
  });

  // Creăm noul token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type: 'EMAIL_VERIFICATION',
      expires,
    },
  });

  return verificationToken;
}

/**
 * Generează un token pentru resetarea parolei
 * @param userId ID-ul utilizatorului
 * @param email Adresa de email a utilizatorului (pentru recuperare)
 * @param expiresInHours Perioada de expirare în ore (default: 1 oră)
 */
export async function createPasswordResetToken(userId: string, expiresInHours: number = 1, email?: string) {
  // Generăm partea aleatorie a tokenului
  const randomPart = crypto.randomBytes(20).toString('hex');
  
  // Dacă avem email, îl includem în token pentru recuperare
  let token = randomPart;
  if (email) {
    // Codificăm emailul și îl adăugăm la token
    const encodedEmail = Buffer.from(email).toString('base64');
    token = `${randomPart}_${encodedEmail}`;
  }
  
  const expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  // Ștergem orice token anterior
  await prisma.verificationToken.deleteMany({
    where: {
      userId,
      type: 'PASSWORD_RESET',
    },
  });

  // Creăm noul token
  const resetToken = await prisma.verificationToken.create({
    data: {
      userId,
      token,
      type: 'PASSWORD_RESET',
      expires,
    },
  });

  return resetToken;
}

/**
 * Verifică și validează un token
 */
export async function validateToken(token: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      type,
      expires: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!verificationToken) {
    throw new Error('INVALID_TOKEN');
  }

  return verificationToken;
}