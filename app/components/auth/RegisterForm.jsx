'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
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
  const [formErrors, setFormErrors] = useState({});
  
  const { register, isLoading, error } = useAuth();

  const validatePassword = (value) => {
    const validation = {
      length: value.length >= 10,
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasDigit: /\d/.test(value),
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

  const validateForm = () => {
    const errors = {};
    
    if (!firstName.trim()) errors.firstName = 'Prenumele este obligatoriu';
    if (!lastName.trim()) errors.lastName = 'Numele este obligatoriu';
    
    if (!email.trim()) {
      errors.email = 'Email-ul este obligatoriu';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Adresa de email este invalidă';
    }
    
    if (!password) {
      errors.password = 'Parola este obligatorie';
    } else if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Parolele nu coincid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await register({
      firstName,
      lastName,
      email,
      password,
    });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-center text-primary-dark mb-6">
          Creează un cont nou
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label 
                htmlFor="firstName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prenume
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`auth-input ${formErrors.firstName ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="lastName" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nume
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`auth-input ${formErrors.lastName ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
              )}
            </div>
          </div>
          
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adresa de email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`auth-input ${formErrors.email ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Parolă
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              className={`auth-input ${formErrors.password ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {formErrors.password ? (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            ) : (
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
            )}
          </div>
          
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmă parola
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`auth-input ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'Se procesează...' : 'Creează cont'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Ai deja un cont?{' '}
          <Link href="/login" className="auth-link">
            Autentifică-te
          </Link>
        </p>
      </div>
      
      <div className="text-xs text-center text-gray-500 mt-6">
        Prin crearea contului, ești de acord cu{' '}
        <Link href="/terms" className="underline">
          Termenii și Condițiile
        </Link>{' '}
        și{' '}
        <Link href="/privacy" className="underline">
          Politica de Confidențialitate
        </Link>
      </div>
    </div>
  );
}