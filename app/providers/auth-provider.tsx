'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider pentru autentificare care împachetează aplicația
 * Permite utilizarea hook-urilor de autentificare (useSession, signIn, signOut) în componente client
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}