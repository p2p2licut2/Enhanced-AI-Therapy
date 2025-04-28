'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

/**
 * Componentă pentru afișarea unui banner de notificare pentru utilizatorii neconfirmați
 */
export default function EmailVerificationBanner() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Nu afișăm nimic dacă utilizatorul nu este autentificat sau se încarcă sesiunea
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }
  
  // Nu afișăm nimic dacă email-ul este deja verificat
  if (session.user.emailVerified) {
    return null;
  }
  
  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        // Resetăm starea de succes după câteva secunde
        setTimeout(() => {
          if (document.hasFocus()) {
            setSuccess(false);
          }
        }, 5000);
      } else {
        setError(data.error || 'A apărut o eroare la trimiterea email-ului.');
        
        // Dacă este o limitare de rată, oferim timp estimat
        if (data.rateLimited && data.nextAttemptAt) {
          // Formatăm data pentru afișare
          const nextAttempt = new Date(data.nextAttemptAt);
          setError(
            `Ai depășit numărul maxim de încercări. Încearcă din nou după ${nextAttempt.toLocaleTimeString()}.`
          );
        }
      }
    } catch (err) {
      setError('A apărut o eroare la trimiterea email-ului. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return isVisible ? (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Adresa de email nu a fost verificată
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  Pentru a avea acces la toate funcționalitățile, te rugăm să îți verifici adresa de email. 
                  Am trimis un link de verificare la adresa <strong>{session.user.email}</strong>.
                </p>
                
                {success && (
                  <p className="mt-2 text-green-600 font-medium">
                    Email-ul de verificare a fost retrimis cu succes!
                  </p>
                )}
                
                {error && (
                  <p className="mt-2 text-red-600">
                    {error}
                  </p>
                )}
                
                <div className="mt-3">
                  <button
                    onClick={handleResendEmail}
                    disabled={isLoading || success}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                      isLoading || success
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {isLoading ? 'Se trimite...' : 'Retrimite email de verificare'}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="ml-3 flex-shrink-0 bg-yellow-50 text-yellow-500 hover:text-yellow-600 focus:outline-none"
            >
              <span className="sr-only">Închide</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}