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
 */
export async function createEmailVerificationToken(userId: string) {
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore

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
 */
export async function createPasswordResetToken(userId: string) {
  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 oră

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