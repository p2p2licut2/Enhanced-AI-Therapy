'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    // Obține tipul de eroare din URL
    const error = searchParams.get('error');
    
    // Setează mesajul de eroare corespunzător
    switch (error) {
      case 'OAuthSignin':
        setErrorMessage('A apărut o eroare la inițierea autentificării prin furnizorul extern.');
        break;
      case 'OAuthCallback':
        setErrorMessage('A apărut o eroare în timpul autentificării cu furnizorul extern.');
        break;
      case 'OAuthCreateAccount':
        setErrorMessage('Nu s-a putut crea un cont utilizând furnizorul extern.');
        break;
      case 'EmailCreateAccount':
        setErrorMessage('Nu s-a putut crea un cont utilizând emailul furnizat.');
        break;
      case 'Callback':
        setErrorMessage('A apărut o eroare în timpul procesului de autentificare.');
        break;
      case 'EmailSignin':
        setErrorMessage('A apărut o eroare la trimiterea emailului de autentificare.');
        break;
      case 'CredentialsSignin':
        setErrorMessage('Autentificare eșuată. Verificați adresa de email și parola.');
        break;
      case 'SessionRequired':
        setErrorMessage('Trebuie să fii autentificat pentru a accesa această pagină.');
        break;
      case 'AccountNotLinked':
        setErrorMessage('Această adresă de email este deja asociată cu un alt cont.');
        break;
      case 'VerificationRequired':
        setErrorMessage('Trebuie să îți verifici adresa de email înainte de a te autentifica.');
        break;
      case 'Configuration':
        setErrorMessage('A apărut o eroare în configurarea serviciului de autentificare.');
        break;
      default:
        setErrorMessage('A apărut o eroare neașteptată. Te rugăm să încerci din nou.');
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Eroare de autentificare
          </h2>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <p className="text-gray-700 mb-4">
              {errorMessage}
            </p>
            
            <div className="mt-6 flex justify-center space-x-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
              >
                Înapoi la Login
              </Link>
              
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Pagina principală
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}