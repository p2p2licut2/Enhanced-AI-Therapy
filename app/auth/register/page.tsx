'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const { register, isLoading, error } = useAuth();

  // Validare parolă complexă
  const validatePassword = (value: string) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (!hasMinLength) return 'Parola trebuie să aibă cel puțin 8 caractere';
    if (!hasUppercase) return 'Parola trebuie să conțină cel puțin o literă mare';
    if (!hasLowercase) return 'Parola trebuie să conțină cel puțin o literă mică';
    if (!hasDigit) return 'Parola trebuie să conțină cel puțin o cifră';
    if (!hasSpecialChar) return 'Parola trebuie să conțină cel puțin un caracter special';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validăm parola
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    // Verificăm dacă parolele coincid
    if (password !== confirmPassword) {
      setPasswordError('Parolele nu coincid');
      return;
    }
    
    setPasswordError(null);
    
    // Înregistrăm utilizatorul
    await register({
      firstName,
      lastName,
      email,
      password,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Creează un cont nou
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sau{' '}
            <Link 
              href="/auth/login"
              className="font-medium text-primary hover:text-primary-dark"
            >
              intră în contul existent
            </Link>
          </p>
        </div>

        {(error || passwordError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Eroare</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error || passwordError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  Prenume
                </label>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                  Nume
                </label>
                <input
                  id="last-name"
                  name="lastName"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresă email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parolă
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Parola trebuie să conțină minim 8 caractere, o literă mare, o literă mică, o cifră și un caracter special.
              </p>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmă parola
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError(null);
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative flex w-full justify-center rounded-md ${
                isLoading ? 'bg-primary-light' : 'bg-primary hover:bg-primary-dark'
              } px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
            >
              {isLoading ? 'Se procesează...' : 'Creează cont'}
            </button>
          </div>
          
          <div className="text-xs text-center text-gray-500">
            Prin crearea contului, ești de acord cu{' '}
            <Link href="/terms" className="underline">
              Termenii și Condițiile
            </Link>{' '}
            și{' '}
            <Link href="/privacy" className="underline">
              Politica de Confidențialitate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}