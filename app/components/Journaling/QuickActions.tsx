'use client';

// app/components/Journaling/QuickActions.tsx
import React from 'react';
import { useApp } from '@/app/contexts/AppContext';
import styles from './QuickActions.module.css';
import { TherapistId } from '@/app/types';

interface QuickActionsProps {
  journalId: string;
}

export default function QuickActions({ journalId }: QuickActionsProps) {
  const { 
    journals, 
    setIsJournalModalOpen
  } = useApp();
  
  // Get the journal
  const journal = journals.find(j => j.id === journalId);
  
  if (!journal) {
    return null;
  }
  
  return (
    <div className={styles.quickActionsContainer}>
      <h3 className={styles.sectionTitle}>Acțiuni pentru acest jurnal</h3>
      <p className={styles.sectionDescription}>
        Explorează singur gândurile și emoțiile tale prin journaling regulat.
      </p>
      
      <div className={styles.actionsContainer}>
        <button 
          className={styles.quickActionButton}
          onClick={() => setIsJournalModalOpen(false)}
        >
          <div className={styles.buttonIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className={styles.buttonInfo}>
            <span className={styles.buttonTitle}>Creează un alt jurnal</span>
            <span className={styles.buttonDescription}>Întoarce-te la pagina principală pentru a crea un alt jurnal</span>
          </div>
        </button>
      </div>
      
      <div className={styles.actionsFooter}>
        <p className={styles.footerNote}>
          Practică journaling regulat pentru a-ți îmbunătăți starea de bine și pentru a explora gândurile și emoțiile.
        </p>
      </div>
    </div>
  );
}