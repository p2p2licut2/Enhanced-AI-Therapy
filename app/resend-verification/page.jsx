'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResendVerificationPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { status } = useSession();
  const router = useRouter();
  
  // Preia email-ul din URL dacă există
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);
  
  // Redirecționează utilizatorii autentificați către pagina principală
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Te rugăm să introduci adresa de email');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Aici vom implementa endpoint-ul în pasul următor
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'A apărut o eroare la trimiterea email-ului');
      }
      
      // Setăm succes pentru a afișa mesajul de confirmare
      setSuccess(true);
      setEmail('');
      
    } catch (error) {
      console.error('Eroare la retrimiterea email-ului:', error);
      setError(error.message || 'A apărut o eroare la trimiterea email-ului');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Retrimite email de verificare</h2>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-fit mb-4">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email trimis cu succes!
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Am trimis un nou email de verificare la adresa ta. Te rugăm să verifici căsuța de email și să urmezi instrucțiunile pentru a-ți activa contul.
              </p>
              
              <Link 
                href="/login" 
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
              >
                Înapoi la autentificare
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Introduceți adresa de email folosită la înregistrare pentru a primi un nou link de verificare.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Adresa de email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 auth-input"
                    placeholder="nume@exemplu.com"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full auth-button"
                  >
                    {isLoading ? 'Se procesează...' : 'Trimite email de verificare'}
                  </button>
                </div>
              </form>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Înapoi la autentificare
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}