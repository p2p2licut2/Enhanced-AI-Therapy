'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ResendVerificationPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Afișează un loading state în timpul verificării sesiunii
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Te rugăm să introduci adresa de email');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Verificăm dacă este o eroare de rate limiting
        if (response.status === 429 && data.rateLimited) {
          throw new Error(data.error || `Prea multe încercări. Încearcă din nou mai târziu.`);
        }
        
        throw new Error(data.error || 'A apărut o eroare la trimiterea email-ului');
      }
      
      // Setăm succes pentru a afișa mesajul de confirmare
      setSuccess(true);
      setEmail('');
      
    } catch (error) {
      console.error('Eroare la retrimiterea email-ului:', error);
      setError(error instanceof Error ? error.message : 'A apărut o eroare la trimiterea email-ului');
    } finally {
      setIsLoading(false);
    }
  };
  
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
            Retrimite email de verificare
          </h2>
        </div>
        
        <div className="bg-white p-6 shadow-md rounded-lg">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email trimis cu succes!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Am trimis un nou email de verificare la adresa ta. Te rugăm să verifici căsuța de email și să urmezi instrucțiunile pentru a-ți activa contul.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-left">
                <p className="text-sm text-blue-700">
                  Dacă nu găsești email-ul în Inbox, verifică și folderul Spam sau Junk.
                </p>
              </div>
              
              <Link 
                href="/auth/login" 
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Înapoi la autentificare
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="nume@exemplu.com"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {isLoading ? 'Se procesează...' : 'Trimite email de verificare'}
                  </button>
                </div>
                
                <div className="text-center mt-4">
                  <Link 
                    href="/auth/login" 
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    Înapoi la autentificare
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}