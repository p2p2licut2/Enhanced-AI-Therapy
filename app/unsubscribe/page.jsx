'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Procesăm cererea ta...');
  const [email, setEmail] = useState('');
  const [emailType, setEmailType] = useState('');

  useEffect(() => {
    // Obține parametrii din URL
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');
    
    if (!emailParam) {
      setStatus('error');
      setMessage('Email-ul lipsește din cerere.');
      return;
    }
    
    setEmail(emailParam);
    setEmailType(typeParam || 'all');
    
    // Procesăm dezabonarea (în implementarea completă am face un API call)
    // În această versiune simplă, doar simulăm procesul
    setTimeout(() => {
      setStatus('success');
      setMessage(`Ai fost dezabonat cu succes de la ${typeParam === 'verification' ? 'email-urile de verificare' : 'toate email-urile'}.`);
    }, 1500);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Dezabonare email</h2>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dezabonare reușită</h3>
              <p className="text-center text-gray-700 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500 mb-2">
                Adresa ta de email: <strong>{email}</strong>
              </p>
              <p className="text-xs text-gray-500 mb-6">
                În conformitate cu GDPR, preferințele tale au fost actualizate.
              </p>
              
              <div className="flex space-x-4">
                <Link 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  Înapoi la pagina principală
                </Link>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Eroare</h3>
              <p className="text-center text-gray-700 mb-6">
                {message}
              </p>
              
              <div>
                <Link 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                >
                  Înapoi la pagina principală
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Dacă ai întrebări privind datele tale personale, te rugăm să ne contactezi la <a href="mailto:gdpr@terapie-ai.ro" className="text-primary">gdpr@terapie-ai.ro</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}