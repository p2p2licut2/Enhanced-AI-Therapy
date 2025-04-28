'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verificăm token-ul...');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Token-ul lipsește sau este invalid.');
          return;
        }
        
        // Trimitem cererea către API pentru verificare
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
          setMessage(data.message || 'Email-ul tău a fost verificat cu succes!');
          
          // După 3 secunde, redirecționăm către pagina de succes
          setTimeout(() => {
            router.push('/email-verified');
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
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Verificare Email</h2>
        </div>
        
        <div className="p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-700">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verificare reușită!</h3>
              <p className="text-center text-gray-700 mb-4">{message}</p>
              <p className="text-sm text-gray-500 mb-6">Vei fi redirecționat în câteva secunde...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verificare eșuată</h3>
              <p className="text-center text-gray-700 mb-6">{message}</p>
              
              <div className="flex space-x-4">
                <Link 
                  href="/resend-verification" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  Retrimite email
                </Link>
                
                <Link 
                  href="/login" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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