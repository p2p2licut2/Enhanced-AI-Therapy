'use client';

// app/components/Journaling/JournalingSection.tsx
import React from 'react';
import { useApp } from '@/app/contexts/AppContext';
import JournalTemplateSelector from './JournalTemplateSelector';
import JournalEntry from './JournalEntry';
import RecentJournals from './RecentJournals';
import styles from './JournalingSection.module.css';

export default function JournalingSection() {
  const { 
    journals,
    createNewJournal,
    recentJournals,
    isJournalModalOpen,
    setCurrentJournal
  } = useApp();

  return (
    <div className={styles.journalingSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Journaling</h2>
        <p className={styles.sectionDescription}>
          Scrie-ți gândurile și reflecțiile pentru o mai bună înțelegere de sine
        </p>
      </div>

      <div className={styles.templateSelectorContainer}>
        <h3 className={styles.subSectionTitle}>Alege un template</h3>
        <JournalTemplateSelector onSelectTemplate={createNewJournal} />
      </div>

      {recentJournals.length > 0 && (
        <div className={styles.recentJournalsContainer}>
          <h3 className={styles.subSectionTitle}>Jurnalele tale recente</h3>
          <RecentJournals 
            journals={recentJournals.slice(0, 3)} 
            onJournalSelect={(journalId) => setCurrentJournal(journalId)}
          />
          
          {recentJournals.length > 3 && (
            <button 
              className={styles.viewAllButton}
              onClick={() => {
                // Implementation to view all journals
                console.log('View all journals clicked');
              }}
            >
              Vezi toate jurnalele ({recentJournals.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}