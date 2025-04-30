'use client';

import { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Chat from './components/Chat/Chat';
import Header from './components/Header/Header';
import LeftMenu from './components/LeftMenu/LeftMenu';
import TherapistSelector from './components/TherapistSelector/TherapistSelector';
import InstallPrompt from './components/InstallPrompt/InstallPrompt';
import WelcomePage from './components/WelcomePage/WelcomePage';
import { useApp } from './contexts/AppContext';
import styles from './page.module.css';

// Wrapper component that uses the AppContext
function AppContent() {
  const { showWelcomePage } = useApp();
  
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
  
  return (
    <>
      {showWelcomePage ? (
        <div className={styles.welcomePageContainer}>
          <WelcomePage />
        </div>
      ) : (
        <main className={styles.mainContainer}>
          <LeftMenu />
          <TherapistSelector />
          <div className={styles.appContainer}>
            <Header />
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