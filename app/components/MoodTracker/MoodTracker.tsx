// app/components/MoodTracker/MoodTracker.tsx
'use client';

import React, { useState } from 'react';
import styles from './MoodTracker.module.css';

interface MoodTrackerProps {
  onMoodSelect: (value: number) => void;
  selectedMood: number | null;
}

// Define moods with emojis and descriptions
const moods = [
  { value: 1, emoji: '😢', label: 'Trist' },
  { value: 2, emoji: '😔', label: 'Melancolic' },
  { value: 3, emoji: '😐', label: 'Neutru' },
  { value: 4, emoji: '🙂', label: 'Bine' },
  { value: 5, emoji: '😊', label: 'Fericit' }
];

export default function MoodTracker({ onMoodSelect, selectedMood }: MoodTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredMood, setHoveredMood] = useState<number | null>(null);

  const handleMoodClick = (value: number) => {
    onMoodSelect(value);
    setIsExpanded(false);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Get the selected mood emoji or default text
  const getSelectedMoodEmoji = () => {
    if (selectedMood !== null) {
      const mood = moods.find(m => m.value === selectedMood);
      return mood ? mood.emoji : '🙂';
    }
    return null;
  };

  return (
    <div className={styles.moodTracker}>
      <button 
        className={styles.moodTrackerToggle}
        onClick={toggleExpand}
        aria-label="Înregistrează starea ta emoțională"
        aria-expanded={isExpanded}
      >
        {selectedMood ? (
          <div className={styles.selectedMood}>
            <span className={styles.moodEmoji}>{getSelectedMoodEmoji()}</span>
            <span className={styles.moodText}>Starea ta</span>
          </div>
        ) : (
          <div className={styles.moodPrompt}>
            <span className={styles.moodEmoji}>🙂</span>
            <span className={styles.moodText}>Cum te simți?</span>
          </div>
        )}
      </button>

      {isExpanded && (
        <div className={styles.moodSelector} role="dialog" aria-label="Selectează starea ta emoțională">
          <div className={styles.moodSelectorHeader}>
            <h3>Cum te simți astăzi?</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setIsExpanded(false)}
              aria-label="Închide selectorul de stare"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className={styles.moodSelectorBody}>
            <div className={styles.moodOptions}>
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  className={`${styles.moodOption} ${selectedMood === mood.value ? styles.selected : ''}`}
                  onClick={() => handleMoodClick(mood.value)}
                  onMouseEnter={() => setHoveredMood(mood.value)}
                  onMouseLeave={() => setHoveredMood(null)}
                  aria-label={`Stare: ${mood.label}`}
                  aria-selected={selectedMood === mood.value}
                >
                  <span className={styles.moodEmoji}>{mood.emoji}</span>
                  <span className={styles.moodLabel}>{mood.label}</span>
                </button>
              ))}
            </div>
            
            <div className={styles.moodDescription}>
              {hoveredMood !== null && (
                <p>
                  {hoveredMood === 1 && 'Îmi pare rău că te simți trist. Exercițiile de respirație te-ar putea ajuta.'}
                  {hoveredMood === 2 && 'Este normal să te simți melancolic uneori. Ce te-ar putea ajuta să te simți mai bine?'}
                  {hoveredMood === 3 && 'O stare neutră este un bun punct de plecare pentru reflecție și meditație.'}
                  {hoveredMood === 4 && 'Mă bucur că te simți bine! Ce ai putea face pentru a menține această stare?'}
                  {hoveredMood === 5 && 'Este minunat că te simți fericit! Ce anume a contribuit la această stare?'}
                </p>
              )}
              {hoveredMood === null && selectedMood === null && (
                <p>Alege emoji-ul care reflectă cel mai bine starea ta emoțională actuală.</p>
              )}
              {hoveredMood === null && selectedMood !== null && !isExpanded && (
                <p>Starea ta emoțională a fost înregistrată. Poți actualiza în orice moment.</p>
              )}
            </div>
          </div>
          
          <div className={styles.moodSelectorFooter}>
            <button 
              className={styles.saveButton}
              onClick={() => setIsExpanded(false)}
              disabled={selectedMood === null}
            >
              Salvează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}