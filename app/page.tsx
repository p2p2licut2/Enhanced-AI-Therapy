// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AppProvider } from './contexts/AppContext';
import Chat from './components/Chat/Chat';
import Header from './components/Header/Header';
import LeftMenu from './components/LeftMenu/LeftMenu';
import TherapistSelector from './components/TherapistSelector/TherapistSelector';
import InstallPrompt from './components/InstallPrompt/InstallPrompt';
import WelcomePage from './components/WelcomePage/WelcomePage';
import JournalEntry from './components/JournalEntry/JournalEntry';
import { useApp } from './contexts/AppContext';
import styles from './page.module.css';

// Wrapper component that uses the AppContext
function AppContent() {
  const { showWelcomePage } = useApp();
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [journalType, setJournalType] = useState<'gratitude' | 'reflection'>('gratitude');
  
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

  // Handle journal opening
  const handleOpenJournal = (type: 'gratitude' | 'reflection') => {
    setJournalType(type);
    setShowJournal(true);
  };

  // Handle journal saving
  const handleSaveJournal = (content: string, title: string) => {
    // In a real app, this would save to a database or localStorage
    console.log('Saving journal entry:', { title, content, type: journalType });
    // Here you could implement the actual saving logic
  };
  
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

      {/* Journal Entry Modal - This would be shown when user selects a journal option */}
      {showJournal && (
        <div className={styles.journalModal}>
          <div className={styles.journalOverlay} onClick={() => setShowJournal(false)}></div>
          <div className={styles.journalContainer}>
            <JournalEntry 
              type={journalType} 
              onClose={() => setShowJournal(false)}
              onSave={handleSaveJournal}
            />
          </div>
        </div>
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