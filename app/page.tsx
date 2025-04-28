'use client';

import { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Chat from './components/Chat';
import Header from './components/Header';
import LeftMenu from './components/LeftMenu';
import TherapistSelector from './components/TherapistSelector';
import InstallPrompt from './components/InstallPrompt';
import WelcomePage from './components/WelcomePage';
import { useApp } from './contexts/AppContext';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EmailVerificationBanner from './components/auth/EmailVerificationBanner';

// Wrapper component that uses the AppContext
function AppContent() {
  const { showWelcomePage } = useApp();
  const { status } = useSession();
  
  // Set scrolling behavior based on current view
  useEffect(() => {
    if (showWelcomePage) {
      // Enable scrolling for welcome page
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    } else {
      // Use your existing overflow handling for chat interface
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    
    return () => {
      // Cleanup
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showWelcomePage]);

  // Redirecționare către autentificare dacă utilizatorul nu este autentificat
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-heading mb-4">Bine ai venit la Terapie AI</h1>
          <p className="mb-8 text-text">
            Pentru a accesa aplicația, te rugăm să te autentifici sau să îți creezi un cont nou.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link 
              href="/auth/login" 
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              Autentificare
            </Link>
            <Link 
              href="/auth/register" 
              className="px-6 py-3 bg-accent text-text rounded-md hover:opacity-90 transition-colors"
            >
              Creare cont
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Afișare loading în timp ce se verifică sesiunea
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
      {showWelcomePage ? (
        <div className="welcome-page-container">
          <WelcomePage />
        </div>
      ) : (
<main className="flex min-h-screen overflow-hidden p-0 m-0">
          <LeftMenu />
          <TherapistSelector />
          <div className="app-container">
            <Header />
            <EmailVerificationBanner />
            <Chat />
          </div>
          <InstallPrompt />
        </main>
      )}
    </>
  );
}

// Main page component
export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Ensure components only render on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set viewport height
  useEffect(() => {
    // Function to set the value of --vh to 1% of the viewport height
    function setVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Initial call to set the height
    setVH();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}