// app/components/JournalEntry/JournalEntry.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './JournalEntry.module.css';

interface JournalEntryProps {
  type: 'gratitude' | 'reflection';
  onClose: () => void;
  onSave: (content: string, title: string) => void;
}

interface Prompt {
  text: string;
  hint: string;
}

// Prompts for different journal types
const PROMPTS: Record<string, Prompt[]> = {
  gratitude: [
    { 
      text: 'Pentru ce ești recunoscător astăzi?', 
      hint: 'Reflectează asupra lucrurilor mici și mari care ți-au adus bucurie sau confort' 
    },
    { 
      text: 'Cine sunt persoanele care ți-au făcut ziua mai bună?', 
      hint: 'Gândește-te la oamenii care te susțin, te inspiră sau te-au ajutat recent' 
    },
    { 
      text: 'Ce abilitate sau calitate personală apreciezi la tine?', 
      hint: 'Recunoaște și sărbătorește punctele tale forte' 
    }
  ],
  reflection: [
    { 
      text: 'Cum te-ai simțit astăzi și de ce?', 
      hint: 'Explorează emoțiile tale și situațiile care le-au declanșat' 
    },
    { 
      text: 'Ce ai învățat astăzi despre tine sau despre viață?', 
      hint: 'Fiecare experiență poate fi o lecție valoroasă' 
    },
    { 
      text: 'Care a fost cel mai semnificativ moment al zilei tale?', 
      hint: 'Poate fi o conversație, o realizare sau un moment de claritate' 
    }
  ]
};

export default function JournalEntry({ type, onClose, onSave }: JournalEntryProps) {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get current prompt based on type and index
  const currentPrompt = PROMPTS[type][currentPromptIndex];

  // Auto-focus the textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Generate a default title if none is provided
  useEffect(() => {
    if (!title) {
      const date = new Date();
      const formattedDate = `${date.getDate()} ${date.toLocaleString('ro-RO', { month: 'long' })} ${date.getFullYear()}`;
      
      if (type === 'gratitude') {
        setTitle(`Jurnal de Recunoștință - ${formattedDate}`);
      } else {
        setTitle(`Jurnal de Reflecție - ${formattedDate}`);
      }
    }
  }, [title, type]);

  // Handle changing to next prompt
  const handleNextPrompt = () => {
    if (currentPromptIndex < PROMPTS[type].length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      setShowPrompt(false);
    }
  };

  // Handle saving the journal entry
  const handleSave = () => {
    if (content.trim()) {
      setIsSaving(true);
      
      // Simulate saving delay (would connect to backend in real app)
      setTimeout(() => {
        onSave(content, title);
        setIsSaving(false);
        onClose();
      }, 800);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.journalEntryContainer}>
      <div className={styles.journalHeader}>
        <div className={styles.journalTypeLabel}>
          {type === 'gratitude' ? 'Jurnal de Recunoștință' : 'Jurnal de Reflecție'}
        </div>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Închide jurnalul"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className={styles.journalContent}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.journalTitle}
          placeholder="Titlul jurnalului tău"
        />

        {showPrompt && (
          <div className={styles.promptContainer}>
            <p className={styles.promptText}>{currentPrompt.text}</p>
            <p className={styles.promptHint}>{currentPrompt.hint}</p>
            <button 
              className={styles.nextPromptButton}
              onClick={handleNextPrompt}
            >
              {currentPromptIndex < PROMPTS[type].length - 1 ? 'Următoarea întrebare' : 'Ascunde întrebarea'}
            </button>
          </div>
        )}

        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            className={styles.journalTextarea}
            placeholder="Scrie gândurile tale aici..."
            rows={10}
          />
        </div>
      </div>

      <div className={styles.journalFooter}>
        <div className={styles.wordCount}>
          {content.trim().split(/\s+/).filter(Boolean).length} cuvinte
        </div>
        <div className={styles.journalActions}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
          >
            Anulează
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
          >
            {isSaving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>
    </div>
  );
}