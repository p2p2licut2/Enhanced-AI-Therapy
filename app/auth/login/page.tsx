'use client';

import LoginForm from '@/app/components/auth/LoginForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Bine ai revenit!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Conectează-te pentru a continua conversațiile cu terapeutul tău
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center text-sm text-gray-500">
          <p>
            Nu ai încă un cont?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary-dark">
              Înregistrează-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}