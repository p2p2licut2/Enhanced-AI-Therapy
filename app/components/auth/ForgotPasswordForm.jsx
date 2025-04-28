'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Te rugăm să introduci adresa de email');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'A apărut o eroare la procesarea cererii');
      }
      
      // Setăm succes pentru a afișa mesajul de confirmare
      setSuccess(true);
      setEmail('');
      
    } catch (error) {
      console.error('Eroare la procesarea solicitării:', error);
      // Pentru securitate, nu dezvăluim dacă email-ul există sau nu
      setError('Dacă adresa de email există în baza noastră de date, vei primi un link de resetare');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="therapy-pattern max-w-md w-full p-6 rounded-lg">
      <div className="modern-card p-8 relative overflow-hidden">
        <div className="therapy-wave"></div>
        
        {success ? (
          <div className="text-center relative z-10">
            <div className="rounded-full bg-green-100 p-3 mx-auto w-fit mb-4">
              <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="modern-header modern-header-sm mb-2">
              Verifică-ți email-ul
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Dacă există un cont asociat cu adresa de email introdusă, vei primi în curând un email cu instrucțiuni pentru resetarea parolei.
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Nu uita să verifici și folderul de Spam sau Junk dacă nu găsești email-ul în Inbox.
            </p>
            
            <Link 
              href="/login" 
              className="modern-button modern-button-primary w-full"
            >
              Înapoi la autentificare
            </Link>
          </div>
        ) : (
          <div className="relative z-10">
            <h2 className="modern-header modern-header-md text-center mb-6">
              Resetează parola
            </h2>
            
            <p className="text-sm text-gray-600 mb-6 text-center">
              Introdu adresa de email asociată contului tău și îți vom trimite un link pentru a-ți reseta parola.
            </p>
            
            {error && (
              <div className="modern-alert modern-alert-error mb-4">
                <p>{error}</p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="modern-input-group">
                <label htmlFor="email" className="modern-label">
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
                  className="modern-input"
                  placeholder="nume@exemplu.com"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="modern-button modern-button-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="modern-spinner mr-2"></div>
                      <span>Se procesează...</span>
                    </div>
                  ) : (
                    'Trimite link de resetare'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/login" className="modern-link text-sm text-primary hover:text-primary-dark">
                Înapoi la autentificare
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}