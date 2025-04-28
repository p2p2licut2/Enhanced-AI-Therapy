'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verificăm token-ul tău...');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Token-ul lipsește sau este invalid.');
          return;
        }
        
        // Trimitem cererea către API pentru a verifica token-ul
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Email-ul tău a fost verificat cu succes! Acum te poți autentifica.');
          // După 3 secunde, redirecționăm către pagina de login
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Token-ul de verificare este invalid sau a expirat.');
        }
      } catch (error) {
        console.error('Eroare la verificarea token-ului:', error);
        setStatus('error');
        setMessage('A apărut o eroare la verificarea token-ului. Te rugăm să încerci din nou.');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verificare Email
          </h2>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            {status === 'loading' && (
              <div className="mx-auto flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-700">{message}</p>
              </div>
            )}
            
            {status === 'success' && (
              <div className="mx-auto flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">{message}</p>
                <p className="text-sm text-gray-500">Vei fi redirecționat către pagina de autentificare...</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mx-auto flex flex-col items-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">{message}</p>
                <div className="mt-4">
                  <Link
                    href="/auth/resend-verification"
                    className="text-primary hover:text-primary-dark"
                  >
                    Trimite un nou email de verificare
                  </Link>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100"
              >
                Înapoi la Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}