'use client';

// app/components/Journaling/ExplorationPoints.tsx
import React, { useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import TherapistSelector from './TherapistSelector';
import styles from './ExplorationPoints.module.css';
import { TherapistId } from '@/app/types';

interface ExplorationPointsProps {
  journalId: string;
}

export default function ExplorationPoints({ journalId }: ExplorationPointsProps) {
  const [showTherapistSelector, setShowTherapistSelector] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<string | null>(null);

  const { 
    journals,
    startConversationFromPoint
  } = useApp();
  
  // Get the journal and exploration points
  const journal = journals.find(j => j.id === journalId);
  
  if (!journal) {
    return (
      <div className={styles.noPointsContainer}>
        <p>Jurnalul nu a fost găsit</p>
      </div>
    );
  }
  
  const { explorationPoints } = journal;
  
  // If no exploration points, show empty state
  if (explorationPoints.length === 0) {
    return (
      <div className={styles.noPointsContainer}>
        <h3 className={styles.noPointsTitle}>Niciun punct de explorare</h3>
        <p className={styles.noPointsDescription}>
          Analizează jurnalul tău pentru a descoperi puncte de explorare.
        </p>
      </div>
    );
  }

  // Handle therapist selection for a specific point
  const handleSelectTherapist = (pointId: string, therapistId: TherapistId) => {
    // Start conversation
    startConversationFromPoint(journalId, pointId, therapistId);
    
    // Close selector
    setShowTherapistSelector(null);
  };
  
  // Handle click on exploration point
  const handlePointClick = (pointId: string) => {
    const point = explorationPoints.find(p => p.id === pointId);
    
    if (!point) return;
    
    // If already explored, show summary
    if (point.isExplored && point.summary) {
      setShowSummary(pointId);
    } else {
      // If not explored, show therapist selector
      setShowTherapistSelector(pointId);
    }
  };
  
  // Handle close summary
  const handleCloseSummary = () => {
    setShowSummary(null);
  };
  
  // Get point status class
  const getPointStatusClass = (isExplored: boolean) => {
    return isExplored ? styles.pointExplored : styles.pointNotExplored;
  };
  
  return (
    <div className={styles.explorationPointsContainer}>
      <h3 className={styles.sectionTitle}>Puncte de explorare</h3>
      <p className={styles.sectionDescription}>
        {explorationPoints.some(p => p.isExplored)
          ? 'Selectează un punct pentru a vedea rezumatul sau pentru a iniția o nouă conversație.'
          : 'Selectează un punct pentru a iniția o conversație cu un terapeut.'}
      </p>
      
      <div className={styles.pointsList}>
        {explorationPoints.map((point) => (
          <div 
            key={point.id}
            className={`${styles.pointCard} ${getPointStatusClass(point.isExplored)}`}
            onClick={() => handlePointClick(point.id)}
          >
            <div className={styles.pointContent}>
              {point.content}
            </div>
            <div className={styles.pointStatus}>
              {point.isExplored ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={styles.statusIcon}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Explorat</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={styles.statusIcon}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span>Explorează</span>
                </>
              )}
            </div>
            
            {/* Therapist selector popup */}
            {showTherapistSelector === point.id && (
              <div className={styles.therapistSelectorPopup}>
                <div className={styles.popupHeader}>
                  <h4 className={styles.popupTitle}>Alege terapeutul</h4>
                  <button 
                    className={styles.closePopupButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTherapistSelector(null);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className={styles.popupContent}>
                  <TherapistSelector
                    onSelect={(therapistId) => handleSelectTherapist(point.id, therapistId)}
                  />
                </div>
              </div>
            )}
            
            {/* Summary popup */}
            {showSummary === point.id && point.summary && (
              <div className={styles.summaryPopup}>
                <div className={styles.popupHeader}>
                  <h4 className={styles.popupTitle}>Rezumat conversație</h4>
                  <button 
                    className={styles.closePopupButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseSummary();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className={styles.popupContent}>
                  <p className={styles.summaryText}>{point.summary}</p>
                  
                  {point.conversationId && (
                    <button 
                      className={styles.viewConversationButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Load conversation
                        if (point.conversationId) {
                          // useApp hook's loadConversation
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Vezi conversația completă
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}