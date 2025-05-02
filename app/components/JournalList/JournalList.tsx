// app/components/JournalList/JournalList.tsx
'use client';

import React, { useState } from 'react';
import styles from './JournalList.module.css';

interface Journal {
  id: string;
  title: string;
  content: string;
  type: 'gratitude' | 'reflection';
  createdAt: number;
  wordCount: number;
}

interface JournalListProps {
  onClose: () => void;
  onOpenJournal: (id: string) => void;
}

// Mock data for journals (would be fetched from a database in a real app)
const mockJournals: Journal[] = [
  {
    id: '1',
    title: 'Jurnal de Recunoștință - 1 Mai 2025',
    content: 'Astăzi sunt recunoscător pentru familia mea care mă susține în tot ceea ce fac...',
    type: 'gratitude',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    wordCount: 153
  },
  {
    id: '2',
    title: 'Reflecții despre progresul personal',
    content: 'În ultimele săptămâni am observat cum m-am dezvoltat în mai multe aspecte...',
    type: 'reflection',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    wordCount: 246
  },
  {
    id: '3',
    title: 'Jurnal de Recunoștință - 25 Aprilie 2025',
    content: 'Sunt recunoscător pentru oportunitatea de a lucra la un proiect care îmi place...',
    type: 'gratitude',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
    wordCount: 178
  },
  {
    id: '4',
    title: 'Momentele importante ale săptămânii',
    content: 'Săptămâna aceasta a fost plină de provocări dar și de realizări...',
    type: 'reflection',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10, // 10 days ago
    wordCount: 312
  }
];

export default function JournalList({ onClose, onOpenJournal }: JournalListProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'gratitude' | 'reflection'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Filter journals based on active filter and search query
  const filteredJournals = mockJournals
    .filter(journal => {
      // Filter by type
      if (activeFilter !== 'all' && journal.type !== activeFilter) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        return journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               journal.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt); // Sort by date, newest first

  return (
    <div className={styles.journalListContainer}>
      <div className={styles.journalListHeader}>
        <div className={styles.headerTitle}>Jurnalele Mele</div>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Închide lista de jurnale"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className={styles.journalControls}>
        <div className={styles.searchContainer}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută în jurnale..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Toate
          </button>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'gratitude' ? styles.active : ''}`}
            onClick={() => setActiveFilter('gratitude')}
          >
            Recunoștință
          </button>
          <button 
            className={`${styles.filterButton} ${activeFilter === 'reflection' ? styles.active : ''}`}
            onClick={() => setActiveFilter('reflection')}
          >
            Reflecție
          </button>
        </div>
      </div>

      <div className={styles.journalListContent}>
        {filteredJournals.length > 0 ? (
          <div className={styles.journalGrid}>
            {filteredJournals.map((journal) => (
              <div 
                key={journal.id} 
                className={styles.journalCard}
                onClick={() => onOpenJournal(journal.id)}
              >
                <div className={styles.journalCardHeader}>
                  <div 
                    className={`${styles.journalTypeBadge} ${journal.type === 'gratitude' ? styles.gratitudeBadge : styles.reflectionBadge}`}
                  >
                    {journal.type === 'gratitude' ? 'Recunoștință' : 'Reflecție'}
                  </div>
                  <div className={styles.journalDate}>{formatDate(journal.createdAt)}</div>
                </div>
                <h3 className={styles.journalCardTitle}>{journal.title}</h3>
                <p className={styles.journalCardExcerpt}>
                  {journal.content.substring(0, 120)}
                  {journal.content.length > 120 ? '...' : ''}
                </p>
                <div className={styles.journalCardFooter}>
                  <div className={styles.wordCount}>{journal.wordCount} cuvinte</div>
                  <div className={styles.readMore}>Citește</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className={styles.emptyStateTitle}>Niciun jurnal găsit</h3>
            <p className={styles.emptyStateDescription}>
              {searchQuery 
                ? 'Nu am găsit jurnale care să corespundă căutării tale. Încearcă alte cuvinte cheie.' 
                : 'Începe să scrii jurnale de recunoștință sau reflecție pentru a le vedea aici.'}
            </p>
          </div>
        )}
      </div>

      <div className={styles.journalListFooter}>
        <button className={styles.newJournalButton} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.plusIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Jurnal nou
        </button>
      </div>
    </div>
  );
}