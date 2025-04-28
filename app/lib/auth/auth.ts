import { NextAuthOptions, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // Folosim adapterul Prisma pentru integrare cu baza de date
  adapter: PrismaAdapter(prisma),
  
  // Configurăm sesiunile să folosească JWT pentru securitate
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 zile
  },
  
  // Pagini personalizate pentru autentificare
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/register' // La prima autentificare
  },
  
  // Providers pentru autentificare
  providers: [
    CredentialsProvider({
      name: 'Email și parolă',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Căutăm utilizatorul după email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });
          
          // Verificăm dacă utilizatorul există și parola este corectă
          if (!user || !user.password) {
            return null;
          }
          
          // Verificăm dacă contul este blocat
          if (user.lockedUntil && new Date() < user.lockedUntil) {
            throw new Error('ACCOUNT_LOCKED');
          }
          
          // Comparăm parola introdusă cu cea din baza de date
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            // Incrementăm contorul de încercări eșuate
            await prisma.user.update({
              where: { id: user.id },
              data: { 
                failedLoginAttempts: { increment: 1 },
                // Blocăm contul după 5 încercări eșuate
                lockedUntil: user.failedLoginAttempts >= 4 
                  ? new Date(Date.now() + 15 * 60 * 1000) // 15 minute
                  : null
              }
            });
            return null;
          }
          
          // Resetăm contorul de încercări eșuate la autentificare reușită
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLogin: new Date()
            }
          });
          
          // Verificăm dacă emailul este confirmat
          if (!user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED');
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    }),
    // Aici se pot adăuga alți provideri (OAuth, etc.)
  ],
  
  // Callbacks pentru personalizarea fluxului de autentificare
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Adăugăm date adiționale la token
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        // Adăugăm date adiționale la sesiune
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified ? true : false;
      }
      return session;
    },
  },
  
  // Secret pentru semnarea JWT
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug doar în dezvoltare
  debug: process.env.NODE_ENV === 'development',
};

// Helper pentru obținerea sesiunii în componente server
export const getAuthSession = () => getServerSession(authOptions);