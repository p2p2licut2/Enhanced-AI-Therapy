import { UserRole } from '@prisma/client';
import NextAuth, { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Extindem tipurile NextAuth pentru a include rolul utilizatorului și alte câmpuri personalizate
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerified: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    emailVerified?: Date | null;
  }
}

// Extindem token-ul JWT pentru a include rolul și id-ul utilizatorului
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}