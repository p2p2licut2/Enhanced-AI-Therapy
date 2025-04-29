'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verificăm token-ul tău...');
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Token-ul lipsește sau este invalid.');
          return;
        }
        
        console.log('Verificăm token-ul:', token.substring(0, 6) + '...');
        
        // Trimitem cererea către API pentru a verifica token-ul
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log('Răspuns verificare email:', data);

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email-ul tău a fost verificat cu succes! Acum te poți autentifica.');
          
          // Setăm dacă email-ul a fost deja verificat
          if (data.alreadyVerified) {
            setIsAlreadyVerified(true);
          }
          
          // Salvăm email-ul dacă este disponibil
          if (data.email) {
            setEmail(data.email);
          }
          
          // După un scurt delay, redirecționăm către pagina de login
          // sau autentificăm direct utilizatorul dacă email-ul este disponibil
          setTimeout(() => {
            if (email) {
              // Încercăm să autentificăm utilizatorul automat
              // (utilizatorul va trebui să-și introducă parola)
              signIn('credentials', { 
                email, 
                callbackUrl: '/' 
              });
            } else {
              router.push('/auth/login');
            }
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
  }, [searchParams, router, email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 relative mb-4">
            <Image
              src="/logo.png"
              alt="Terapie AI Logo"
              fill
              sizes="(max-width: 80px) 100vw"
              priority
              className="object-contain"
            />
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verificare Email
          </h2>
        </div>
        
        <div className="bg-white p-6 shadow-md rounded-lg">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-700">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isAlreadyVerified ? 'Email deja verificat' : 'Verificare reușită!'}
              </h3>
              <p className="text-center text-gray-700 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Vei fi redirecționat către pagina de autentificare...</p>
              
              <Link
                href="/auth/login"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Mergi la autentificare
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verificare eșuată</h3>
              <p className="text-center text-gray-700 mb-6">{message}</p>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <Link
                  href="/auth/resend-verification"
                  className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Retrimite email
                </Link>
                
                <Link
                  href="/auth/login"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Înapoi la login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}