'use client';

import { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Chat from './components/Chat';
import Header from './components/Header';
import LeftMenu from './components/LeftMenu';
import TherapistSelector from './components/TherapistSelector';
import InstallPrompt from './components/InstallPrompt';

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
      <main className="flex min-h-screen overflow-hidden p-0 m-0">
        <LeftMenu />
        <TherapistSelector />
        <div className="app-container">
          <Header />
          <Chat />
        </div>
        <InstallPrompt />
      </main>
    </AppProvider>
  );
}