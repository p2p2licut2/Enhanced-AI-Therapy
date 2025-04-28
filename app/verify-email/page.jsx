'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
  const { status } = useSession();
  const router = useRouter();
  
  // Redirecționează utilizatorii autentificați către pagina principală
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Verifică-ți adresa de email</h2>
        </div>
        
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-center text-lg font-medium text-gray-900 mb-4">
            Mulțumim pentru înregistrare!
          </h3>
          
          <p className="text-center text-sm text-gray-600 mb-6">
            Am trimis un email de verificare la adresa ta. Te rugăm să verifici căsuța de email și să urmezi instrucțiunile pentru a-ți activa contul.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Dacă nu găsești email-ul, verifică și folderul de Spam sau Junk.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link 
              href="/login" 
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Înapoi la autentificare
            </Link>
            
            <Link 
              href="/resend-verification" 
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Trimite din nou email-ul de verificare
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}