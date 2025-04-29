'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
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
    
    const processUnsubscribe = async () => {
      try {
        // În implementarea completă, aici ar trebui să faci un API call
        // Exemplu:
        // const response = await fetch('/api/unsubscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email: emailParam, type: typeParam })
        // });
        // 
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.error || 'Eroare la procesarea cererii');
        
        // Simulăm procesul pentru acest exemplu
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Setăm starea de success
        setStatus('success');
        setMessage(`Ai fost dezabonat cu succes de la ${typeParam === 'verification' ? 'email-urile de verificare' : 
                   typeParam === 'security' ? 'notificările de securitate' : 
                   'toate email-urile'}.`);
      } catch (error) {
        console.error('Eroare la procesarea dezabonării:', error);
        setStatus('error');
        setMessage('A apărut o eroare la procesarea cererii de dezabonare.');
      }
    };
    
    processUnsubscribe();
  }, [searchParams]);

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
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Dezabonare email
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
              <div className="rounded-full bg-green-100 p-3 mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dezabonare reușită</h3>
              <p className="text-center text-gray-700 mb-4">{message}</p>
              
              <p className="text-sm text-gray-600 mb-2">
                Adresa ta de email: <strong>{email}</strong>
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4 w-full">
                <p className="text-sm text-blue-700">
                  În conformitate cu GDPR, preferințele tale au fost actualizate. Poți oricând să te reabonezi prin setările contului tău.
                </p>
              </div>
              
              <div className="flex space-x-4 mt-4">
                <Link 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
              <p className="text-center text-gray-700 mb-6">{message}</p>
              
              <div className="w-full">
                <Link 
                  href="/" 
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Înapoi la pagina principală
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              Dacă ai întrebări privind datele tale personale, te rugăm să ne contactezi la <a href="mailto:gdpr@terapie-ai.ro" className="text-primary hover:underline">gdpr@terapie-ai.ro</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}