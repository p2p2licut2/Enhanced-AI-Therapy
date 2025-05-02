'use client';

// app/components/Journaling/RecentJournals.tsx
import React from 'react';
import { JournalEntry, JournalTemplateId } from '@/app/types';
import { useApp } from '@/app/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import styles from './RecentJournals.module.css';

interface RecentJournalsProps {
  journals: JournalEntry[];
  onJournalSelect: (journalId: string) => void;
}

export default function RecentJournals({ journals, onJournalSelect }: RecentJournalsProps) {
  const { journalTemplates } = useApp();
  
  // Get template information based on ID
  const getTemplateInfo = (templateId: JournalTemplateId) => {
    return journalTemplates.find(t => t.id === templateId) || {
      name: 'Jurnal',
      icon: 'default',
      color: 'var(--color-primary)'
    };
  };
  
  // Format date to relative time
  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: ro
    });
  };
  
  // Get icon component based on template icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'moon':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
    }
  };
  
  // If no journals, show empty state
  if (journals.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h4 className={styles.emptyTitle}>Nu ai jurnale recente</h4>
        <p className={styles.emptyDescription}>
          Alege un template de mai sus pentru a începe să scrii
        </p>
      </div>
    );
  }
  
  return (
    <div className={styles.recentJournalsContainer}>
      {journals.map((journal) => {
        const template = getTemplateInfo(journal.templateId);
        
        // Get a content preview from journal
        const contentPreview = journal.content
          ? journal.content.substring(0, 100) + (journal.content.length > 100 ? '...' : '')
          : 'Jurnal gol';
          
        return (
          <div 
            key={journal.id}
            className={styles.journalCard}
            onClick={() => onJournalSelect(journal.id)}
            style={{ 
              '--journal-color': template.color
            } as React.CSSProperties}
          >
            <div className={styles.journalCardHeader}>
              <div 
                className={styles.iconContainer}
                style={{ backgroundColor: template.color }}
              >
                {getIconComponent(template.icon)}
              </div>
              <div className={styles.headerInfo}>
                <h4 className={styles.journalTitle}>{journal.title}</h4>
                <div className={styles.journalMeta}>
                  <span className={styles.templateName}>{template.name}</span>
                  <span className={styles.separator}>•</span>
                  <span className={styles.timestamp}>{formatDate(journal.updatedAt)}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.journalCardContent}>
              <p className={styles.contentPreview}>{contentPreview}</p>
            </div>
            
            <div className={styles.journalCardFooter}>
              {journal.explorationPoints.length > 0 && (
                <div className={styles.pointsBadge}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.badgeIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className={styles.badgeText}>
                    {journal.explorationPoints.length} puncte de explorare
                  </span>
                </div>
              )}
              
              {journal.isAnalyzed && (
                <div className={styles.analyzedBadge}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.badgeIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={styles.badgeText}>Analizat</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}