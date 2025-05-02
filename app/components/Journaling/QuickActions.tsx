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
    startConversationFromJournal,
    setIsJournalModalOpen
  } = useApp();
  
  // Get the journal
  const journal = journals.find(j => j.id === journalId);
  
  if (!journal) {
    return null;
  }
  
  // Handle start conversation with therapist
  const handleStartConversation = (therapistId: TherapistId) => {
    // Start conversation
    startConversationFromJournal(journalId, therapistId);
    
    // Close modal
    setIsJournalModalOpen(false);
  };
  
  return (
    <div className={styles.quickActionsContainer}>
      <h3 className={styles.sectionTitle}>Discută despre acest jurnal</h3>
      <p className={styles.sectionDescription}>
        Începe o conversație cu un terapeut pentru a explora mai profund gândurile tale din acest jurnal.
      </p>
      
      <div className={styles.therapistButtonsContainer}>
        <button 
          className={`${styles.therapistButton} ${styles.therapistMaria}`}
          onClick={() => handleStartConversation('maria')}
        >
          <div className={styles.buttonContent}>
            <div className={styles.therapistAvatar}>
              <img src="/maria-avatar.png" alt="Maria" className={styles.avatarImage} />
            </div>
            <div className={styles.therapistInfo}>
              <span className={styles.therapistName}>Discută cu Maria</span>
              <span className={styles.therapistDescription}>Abordare empatică și calmă</span>
            </div>
          </div>
        </button>
        
        <button 
          className={`${styles.therapistButton} ${styles.therapistAlin}`}
          onClick={() => handleStartConversation('alin')}
        >
          <div className={styles.buttonContent}>
            <div className={styles.therapistAvatar}>
              <img src="/alin-avatar.png" alt="Alin" className={styles.avatarImage} />
            </div>
            <div className={styles.therapistInfo}>
              <span className={styles.therapistName}>Discută cu Alin</span>
              <span className={styles.therapistDescription}>Abordare provocatoare pentru dezvoltare</span>
            </div>
          </div>
        </button>
        
        <button 
          className={`${styles.therapistButton} ${styles.therapistAna}`}
          onClick={() => handleStartConversation('ana')}
        >
          <div className={styles.buttonContent}>
            <div className={styles.therapistAvatar}>
              <img src="/ana-avatar.png" alt="Ana" className={styles.avatarImage} />
            </div>
            <div className={styles.therapistInfo}>
              <span className={styles.therapistName}>Discută cu Ana</span>
              <span className={styles.therapistDescription}>Ghid pentru descoperire personală</span>
            </div>
          </div>
        </button>
        
        <button 
          className={`${styles.therapistButton} ${styles.therapistTeodora}`}
          onClick={() => handleStartConversation('teodora')}
        >
          <div className={styles.buttonContent}>
            <div className={styles.therapistAvatar}>
              <img src="/teodora-avatar.png" alt="Teodora" className={styles.avatarImage} />
            </div>
            <div className={styles.therapistInfo}>
              <span className={styles.therapistName}>Discută cu Teodora</span>
              <span className={styles.therapistDescription}>Abordare imparțială și directă</span>
            </div>
          </div>
        </button>
      </div>
      
      <div className={styles.actionsFooter}>
        <p className={styles.footerNote}>
          Fiecare terapeut are o abordare unică și poate oferi perspective diferite asupra jurnalului tău.
        </p>
      </div>
    </div>
  );
}