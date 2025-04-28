'use client';

import LoginForm from '@/app/components/auth/LoginForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  
  // Redirecționează către pagina principală dacă utilizatorul este deja autentificat
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  // Afișează un loading state în timpul verificării sesiunii
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 relative mb-4">
            <Image
              src="/logo.png"
              alt="Terapie AI Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Bine ai revenit!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Conectează-te pentru a continua conversațiile cu terapeutul tău
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
}