'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Hook personalizat pentru autentificare în componente client
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  /**
   * Acțiune de login
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok) {
        // Gestionăm diferite tipuri de erori
        if (result?.error === 'EMAIL_NOT_VERIFIED') {
          setError('Email-ul nu a fost verificat. Verificați căsuța de email pentru link-ul de confirmare.');
        } else if (result?.error === 'ACCOUNT_LOCKED') {
          setError('Contul este blocat temporar din cauza prea multor încercări eșuate. Încercați din nou mai târziu.');
        } else {
          setError('Autentificare eșuată. Verificați email-ul și parola.');
        }
        return false;
      }

      // Obținem URL-ul de returnare din query params sau folosim pagina principală
      const returnTo = searchParams.get('returnTo') || '/';
      router.push(returnTo);
      router.refresh();
      return true;
    } catch (err) {
      console.error('Eroare login:', err);
      setError('A apărut o eroare la autentificare. Încercați din nou.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Acțiune de logout
   */
  const logout = async () => {
    try {
      setLoading(true);
      await signOut({ redirect: false });
      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      console.error('Eroare logout:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Înregistrare utilizator nou
   */
  const register = async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'USER_ALREADY_EXISTS') {
          setError('Există deja un cont cu acest email.');
        } else {
          setError(data.error || 'Înregistrare eșuată. Încercați din nou.');
        }
        return false;
      }

      // Redirecționăm către pagina de verificare email
      router.push('/auth/verify-request');
      return true;
    } catch (err) {
      console.error('Eroare înregistrare:', err);
      setError('A apărut o eroare la înregistrare. Încercați din nou.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user,
    isAuthenticated,
    isLoading: isLoading || loading,
    error,
    login,
    logout,
    register,
  };
}