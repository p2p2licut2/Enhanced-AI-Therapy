'use client';

import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Verifică-ți adresa de email
          </h2>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <p className="text-gray-700 mb-4">
              Ți-am trimis un email cu un link de confirmare.
              Te rugăm să verifici căsuța ta de email și să urmezi instrucțiunile pentru a-ți activa contul.
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              Dacă nu găsești email-ul în Inbox, verifică și folderul Spam sau Junk.
            </p>
            
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-primary-50 hover:bg-primary-100"
              >
                Înapoi la Login
              </Link>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-gray-500">
            Nu ai primit email-ul?{' '}
            <Link href="/auth/resend-verification" className="font-medium text-primary hover:text-primary-dark">
              Trimite din nou
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}