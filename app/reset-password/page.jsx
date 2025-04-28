'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecial: false,
    message: '',
  });
  
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  
  // Redirecționează utilizatorii autentificați către pagina principală
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Verificăm token-ul când se încarcă pagina
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setIsVerifying(false);
      setError('Link-ul de resetare este invalid. Te rugăm să soliciți un nou link.');
      return;
    }
    
    setToken(tokenParam);
    
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenParam }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Token-ul este invalid sau a expirat');
        }
        
        setIsTokenValid(true);
      } catch (error) {
        console.error('Eroare la verificarea token-ului:', error);
        setError('Link-ul de resetare este invalid sau a expirat. Te rugăm să soliciți un nou link.');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, [searchParams, router]);
  
  // Validarea parolei
  const validatePassword = (value) => {
    const validation = {
      length: value.length >= 10,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasDigit: /[0-9]/.test(value),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
    
    validation.isValid = 
      validation.length && 
      validation.hasUppercase && 
      validation.hasLowercase && 
      validation.hasDigit && 
      validation.hasSpecial;
      
    let message = '';
    if (!validation.isValid) {
      if (!validation.length) message = 'Parola trebuie să aibă cel puțin 10 caractere';
      else if (!validation.hasUppercase) message = 'Parola trebuie să conțină cel puțin o literă mare';
      else if (!validation.hasLowercase) message = 'Parola trebuie să conțină cel puțin o literă mică';
      else if (!validation.hasDigit) message = 'Parola trebuie să conțină cel puțin o cifră';
      else if (!validation.hasSpecial) message = 'Parola trebuie să conțină cel puțin un caracter special';
    }
    
    setPasswordValidation({...validation, message});
    return validation.isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validăm parolele
    if (!validatePassword(password)) {
      setError(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'A apărut o eroare la resetarea parolei');
      }
      
      // Setăm succes pentru a afișa mesajul de confirmare
      setSuccess(true);
      
      // După câteva secunde, redirecționăm către pagina de login
      setTimeout(() => {
        router.push('/login');
      }, 5000);
      
    } catch (error) {
      console.error('Eroare la resetarea parolei:', error);
      if (error.message.includes('parola anterioară')) {
        setError('Noua parolă nu poate fi identică cu cea anterioară. Te rugăm să alegi o parolă diferită.');
      } else {
        setError('A apărut o eroare la resetarea parolei. Te rugăm să încerci din nou.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Dacă încă se verifică sesiunea, afișăm un indicator de încărcare
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block">
            <Image 
              src="/logo.png" 
              alt="Terapie AI Logo" 
              width={80} 
              height={80}
              className="mx-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Resetează parola
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Setează o nouă parolă pentru contul tău
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          {isVerifying ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Verificăm link-ul de resetare...</p>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="rounded-full bg-green-100 p-3 mx-auto w-fit mb-4">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Parolă resetată cu succes!
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Parola ta a fost actualizată. Acum te poți autentifica cu noua parolă.
              </p>
              
              <div className="animate-pulse">
                <p className="text-sm text-gray-500 mb-4">
                  Vei fi redirecționat către pagina de autentificare în câteva secunde...
                </p>
              </div>
              
              <Link 
                href="/login" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Mergi la autentificare
              </Link>
            </div>
          ) : isTokenValid ? (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
                  <p>{error}</p>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Parolă nouă
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-600 mb-1">Parola trebuie să conțină:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className={`text-xs flex items-center ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordValidation.length ? '✓' : '○'}</span> Minim 10 caractere
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordValidation.hasUppercase ? '✓' : '○'}</span> O literă mare
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordValidation.hasLowercase ? '✓' : '○'}</span> O literă mică
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasDigit ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordValidation.hasDigit ? '✓' : '○'}</span> O cifră
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-1">{passwordValidation.hasSpecial ? '✓' : '○'}</span> Un caracter special
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmă parola nouă
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {isLoading ? 'Se procesează...' : 'Resetează parola'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="rounded-full bg-red-100 p-3 mx-auto w-fit mb-4">
                <svg className="h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Link invalid sau expirat
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                {error || 'Link-ul de resetare a parolei este invalid sau a expirat.'}
              </p>
              
              <Link 
                href="/forgot-password" 
                className="mb-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Solicită un nou link
              </Link>
              
              <Link 
                href="/login" 
                className="text-sm text-primary hover:text-primary-dark"
              >
                Înapoi la autentificare
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}