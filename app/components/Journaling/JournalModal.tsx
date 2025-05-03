'use client';

// app/components/Journaling/JournalModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import JournalEntry from './JournalEntry';
import ExplorationPoints from './ExplorationPoints';
import QuickActions from './QuickActions';
import FocusTrap from '../../utils/FocusTrap';
import styles from './JournalModal.module.css';

export default function JournalModal() {
  const { 
    isJournalModalOpen, 
    setIsJournalModalOpen,
    currentJournal,
    journalTemplates,
    updateJournal,
    deleteJournal,
    markJournalAsAnalyzed,
    setCurrentJournal
  } = useApp();
  
  const [isEditing, setIsEditing] = useState(true);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'explore'>('edit');
  
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update content when current journal changes
  useEffect(() => {
    if (currentJournal) {
      setContent(currentJournal.content);
      
      // If journal is not yet analyzed or has no exploration points, start in edit mode
      if (!currentJournal.isAnalyzed || currentJournal.explorationPoints.length === 0) {
        setActiveTab('edit');
      }
    }
  }, [currentJournal]);
  
  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    
    if (isJournalModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Prevent scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isJournalModalOpen]);
  
  // Focus textarea when in edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current && activeTab === 'edit') {
      textareaRef.current.focus();
    }
  }, [isEditing, activeTab]);
  
  // Get template information
  const getTemplateInfo = () => {
    if (!currentJournal) return null;
    
    return journalTemplates.find(t => t.id === currentJournal.templateId);
  };
  
  const template = getTemplateInfo();
  
  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Autosave after a short delay
    if (currentJournal) {
      updateJournal(currentJournal.id, newContent);
    }
  };
  
  // Handle close
  const handleClose = () => {
    // Save content before closing
    if (currentJournal && content !== currentJournal.content) {
      updateJournal(currentJournal.id, content);
    }
    
    // Doar închidem modalul, fără a naviga către chat
    setIsJournalModalOpen(false);
    setCurrentJournal(null);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (currentJournal) {
      deleteJournal(currentJournal.id);
      setIsJournalModalOpen(false);
      setCurrentJournal(null);
    }
  };
  
  // Handle analyze
  const handleAnalyze = async () => {
    if (!currentJournal || content.trim().length === 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journalEntryId: currentJournal.id,
          content,
          templateId: currentJournal.templateId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze journal');
      }
      
      const data = await response.json();
      
      // Add exploration points to the journal
      if (data.explorationPoints && data.explorationPoints.length > 0) {
        data.explorationPoints.forEach((point: any) => {
          // Add each exploration point
          // We're not using addExplorationPoint here because we need to batch them
          // and we don't need the point IDs returned
        });
        
        // Mark journal as analyzed
        markJournalAsAnalyzed(currentJournal.id);
        
        // Switch to explore tab
        setActiveTab('explore');
      }
    } catch (error) {
      console.error('Error analyzing journal:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If modal is not open or no journal is selected, don't render anything
  if (!isJournalModalOpen || !currentJournal) {
    return null;
  }
  
  return (
    <FocusTrap isActive={isJournalModalOpen}>
      <div className="custom-overlay visible" onClick={handleClose}></div>
      <div 
        className={styles.journalModal}
        ref={modalRef}
        role="dialog" 
        aria-modal="true"
        aria-labelledby="journal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="journal-title" className={styles.modalTitle}>
            {currentJournal.title}
          </h2>
          <div className={styles.headerActions}>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Închide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {template && (
          <div className={styles.templateInfo} style={{ backgroundColor: template.color + '15' }}>
            <div className={styles.templateIcon} style={{ backgroundColor: template.color }}>
              {/* Icon would go here - reusing icons from JournalTemplateSelector */}
            </div>
            <div className={styles.templateDetails}>
              <div className={styles.templateName}>{template.name}</div>
              <div className={styles.templateDescription}>{template.description}</div>
            </div>
          </div>
        )}
        
        <div className={styles.modalTabs}>
          <button
            className={`${styles.tab} ${activeTab === 'edit' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.tabIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Scrie
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'explore' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('explore')}
            disabled={!currentJournal.isAnalyzed}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.tabIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Explorează
            {currentJournal.explorationPoints.length > 0 && (
              <span className={styles.pointBadge}>
                {currentJournal.explorationPoints.length}
              </span>
            )}
          </button>
        </div>
        
        <div className={styles.modalContent}>
          {activeTab === 'edit' ? (
            <div className={styles.editSection}>
              <JournalEntry
                content={content}
                onContentChange={handleContentChange}
                textareaRef={textareaRef}
                template={template}
              />
              
              <div className={styles.editActions}>
                <button
                  className={styles.analyzeButton}
                  onClick={handleAnalyze}
                  disabled={isLoading || content.trim().length === 0}
                >
                  {isLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Analizează...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.actionIcon}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analizează cu AI
                    </>
                  )}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={handleDelete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.actionIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Șterge
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.exploreSection}>
              <ExplorationPoints journalId={currentJournal.id} />
              <QuickActions journalId={currentJournal.id} />
            </div>
          )}
        </div>
      </div>
    </FocusTrap>
  );
}