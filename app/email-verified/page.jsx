'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function EmailVerifiedPage() {
  const router = useRouter();
  
  // Opțional: redirecționează automat către login după un anumit timp
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 10000); // 10 secunde
    
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Email verificat</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-green-100 p-4 mx-auto mb-4">
              <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Felicitări!
            </h3>
            
            <p className="text-center text-gray-700 mb-4">
              Adresa ta de email a fost verificată cu succes. Acum poți folosi toate funcționalitățile aplicației Terapie AI.
            </p>
            
            <div className="animate-pulse bg-blue-50 border-l-4 border-blue-400 p-4 my-4 w-full">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Vei fi redirecționat automat către pagina de autentificare în câteva secunde.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 w-full">
              <Link 
                href="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
              >
                Continuă către autentificare
              </Link>
            </div>
            
            <div className="mt-4 w-full">
              <Link 
                href="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Înapoi la pagina principală
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}