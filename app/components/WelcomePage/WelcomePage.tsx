// app/components/WelcomePage/WelcomePage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId, JournalTemplateId } from '@/app/types';
import MoodTracker from '../MoodTracker/MoodTracker';
import TherapeuticExercise from '../TherapeuticExercises/TherapeuticExercise';
import JournalTemplateSelector from '../Journaling/JournalTemplateSelector';
import RecentJournals from '../Journaling/RecentJournals';
import styles from './WelcomePage.module.css';

// Define therapists data - matches what's in TherapistSelector
const therapists = [
  {
    id: 'maria' as TherapistId,
    name: 'Maria',
    description: 'Terapeutul tău zilnic, ascultă și îndrumă',
    avatarSrc: '/maria-avatar.png',
    specialty: 'Terapie cognitiv-comportamentală',
  },
  {
    id: 'alin' as TherapistId,
    name: 'Alin',
    description: 'Dragoste dură cu intenții pozitive',
    avatarSrc: '/alin-avatar.png',
    specialty: 'Coaching motivațional',
  },
  {
    id: 'ana' as TherapistId,
    name: 'Ana',
    description: 'Înțelegerea sinelui',
    avatarSrc: '/ana-avatar.png',
    specialty: 'Descoperire personală',
  },
  {
    id: 'teodora' as TherapistId,
    name: 'Teodora',
    description: 'Te ajută să te schimbi pe tine, nu pe ceilalți',
    avatarSrc: '/teodora-avatar.png',
    specialty: 'Responsabilitate personală',
  },
];

// Journal types nu mai sunt necesare aici deoarece le luăm din AppContext prin JournalTemplateSelector

// Exercise types
const exerciseTypes = [
  {
    id: 'breathing',
    title: 'Exerciții de Respirație',
    description: 'Tehnici de respirație pentru reducerea anxietății',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.exerciseIcon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 8h-15m15 0a1 1 0 011 1v11a1 1 0 01-1 1h-15a1 1 0 01-1-1V9a1 1 0 011-1m15 0a1 1 0 001-1V4a1 1 0 00-1-1h-15a1 1 0 00-1 1v4a1 1 0 001 1m0 0h15" />
      </svg>
    ),
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness',
    description: 'Meditație și practici de conștientizare',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.exerciseIcon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'grounding',
    title: 'Exerciții de Grounding',
    description: 'Tehnici pentru a te conecta cu prezentul',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.exerciseIcon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'cognitive',
    title: 'Restructurare Cognitivă',
    description: 'Identifică și modifică gândurile negative',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.exerciseIcon}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
];

export default function WelcomePage() {
  const { createNewConversation, setShowWelcomePage, createNewJournal, recentJournals, setCurrentJournal } = useApp();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistId | null>(null);
  const [selectedJournalType, setSelectedJournalType] = useState<string | null>(null);
  const [selectedExerciseType, setSelectedExerciseType] = useState<string | null>(null);
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseType, setExerciseType] = useState<'breathing' | 'mindfulness' | 'grounding'>('breathing');
  const [mood, setMood] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle section activation (show options)
  const handleSectionHover = (section: string) => {
    if (!isAnimating) {
      setActiveSection(section);
    }
  };

  // Handle therapist selection
  const handleSelectTherapist = (therapistId: TherapistId) => {
    setSelectedTherapist(therapistId);
    
    // Slight delay before transitioning to chat
    setTimeout(() => {
      setIsAnimating(true);
      
      // Additional delay for animation to complete
      setTimeout(() => {
        createNewConversation(therapistId);
        setShowWelcomePage(false);
      }, 600); // Match this with animation duration
    }, 200);
  };

  // Handle journal type selection
  const handleSelectJournalType = (journalTypeId: string) => {
    setSelectedJournalType(journalTypeId);
    
    // If the user wants to view past journals
    if (journalTypeId === 'past') {
      // Pentru acum, doar animăm fereastra și apoi creăm un jurnal nou
      setTimeout(() => {
        setIsAnimating(true);
        
        setTimeout(() => {
          // În viitor, aici putem implementa navigarea către o pagină dedicată cu toate jurnalele
          // Pentru moment, creăm un jurnal nou de tip "daily" ca soluție temporară
          console.log('Navigating to all journals view');
          createNewJournal('daily' as JournalTemplateId);
          setIsAnimating(false); // Resetăm animația
        }, 600);
      }, 200);
      return;
    }
    
    // Pentru crearea unui jurnal nou, transmitem ID-ul șablonului la context
    if (['daily', 'gratitude', 'affirmation', 'reflection'].includes(journalTypeId)) {
      setTimeout(() => {
        setIsAnimating(true);
        
        setTimeout(() => {
          // Creăm un jurnal nou cu șablonul selectat
          createNewJournal(journalTypeId as JournalTemplateId);
          setIsAnimating(false); // Resetăm animația
        }, 600);
      }, 200);
    }
  };

  // Handle exercise type selection
  const handleSelectExerciseType = (exerciseTypeId: string) => {
    setSelectedExerciseType(exerciseTypeId);
    // Only show exercise for the types we have implemented
    if (['breathing', 'mindfulness', 'grounding'].includes(exerciseTypeId)) {
      setExerciseType(exerciseTypeId as 'breathing' | 'mindfulness' | 'grounding');
      setShowExercise(true);
    }
  };

  // Handle mood selection
  const handleMoodSelect = (value: number) => {
    setMood(value);
    // Here you would save the mood to the user's profile
    // For now, we'll just update the state
    
    // You could also show a confirmation message or animation
    // to acknowledge the mood has been recorded
  };

  // Set overflow to enable scrolling when component mounts
  useEffect(() => {
    document.body.style.overflow = 'auto';
    
    // Clean up when component unmounts
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={`${styles.welcomePage} ${isAnimating ? styles.fadeOut : ''}`}>
      {/* Header Section with Mood Tracker */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <h1>Terapie AI</h1>
        </div>
        <div className={styles.moodTrackerContainer}>
          <MoodTracker onMoodSelect={handleMoodSelect} selectedMood={mood} />
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <h2 className={styles.heroTitle}>
          Cum te putem ajuta astăzi?
        </h2>
        
        <p className={styles.heroSubtitle}>
          Alege una dintre opțiunile de mai jos pentru a începe
        </p>
      </div>

      {/* Main Options Grid */}
      <div className={styles.optionsGrid}>
        {/* Conversation Option */}
        <div 
          className={`${styles.optionCard} ${activeSection === 'conversation' ? styles.active : ''}`}
          onMouseEnter={() => handleSectionHover('conversation')}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className={styles.optionCardContent}>
            <div className={styles.optionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className={styles.optionTitle}>Conversație</h3>
            <p className={styles.optionDescription}>
              Discută cu un terapeut specializat pentru sprijin și îndrumare
            </p>

            {/* Therapist Options (shown when active) */}
            <div className={`${styles.expandedOptions} ${activeSection === 'conversation' ? styles.show : ''}`}>
              <h4>Alege terapeutul</h4>
              <div className={styles.therapistGrid}>
                {therapists.map((therapist) => (
                  <div
                    key={therapist.id}
                    className={`${styles.therapistCard} ${selectedTherapist === therapist.id ? styles.selected : ''}`}
                    onClick={() => handleSelectTherapist(therapist.id)}
                  >
                    <div className={styles.therapistAvatar}>
                      <Image
                        src={therapist.avatarSrc}
                        alt={therapist.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className={styles.therapistInfo}>
                      <h5 className={styles.therapistName}>{therapist.name}</h5>
                      <div className={styles.therapistSpecialty}>{therapist.specialty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Journaling Option */}
        <div 
          className={`${styles.optionCard} ${activeSection === 'journaling' ? styles.active : ''}`}
          onMouseEnter={() => handleSectionHover('journaling')}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className={styles.optionCardContent}>
            <div className={styles.optionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className={styles.optionTitle}>Journaling</h3>
            <p className={styles.optionDescription}>
              Scrie gândurile și sentimentele tale pentru a îmbunătăți starea de bine
            </p>

            {/* Journal Type Options (shown when active) */}
            <div className={`${styles.expandedOptions} ${activeSection === 'journaling' ? styles.show : ''}`}>
              <h4>Alege tipul de jurnal</h4>
              
              {/* Înlocuim grid-ul existent cu JournalTemplateSelector */}
              <div className={styles.journalSelectorContainer}>
                <JournalTemplateSelector onSelectTemplate={handleSelectJournalType} />
              </div>
              
              {/* Adăugăm secțiunea de jurnale recente */}
              {recentJournals.length > 0 && (
                <div className={styles.recentJournalsSection}>
                  <h4>Jurnalele tale recente</h4>
                  <RecentJournals 
                    journals={recentJournals.slice(0, 3)} 
                    onJournalSelect={(journalId) => {
                      setCurrentJournal(journalId);
                      setShowWelcomePage(false);
                    }} 
                  />
                  
                  {recentJournals.length > 3 && (
                    <button 
                      className={styles.viewAllButton}
                      onClick={() => handleSelectJournalType('past')}
                    >
                      Vezi toate jurnalele ({recentJournals.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercises Option */}
        <div 
          className={`${styles.optionCard} ${activeSection === 'exercises' ? styles.active : ''}`}
          onMouseEnter={() => handleSectionHover('exercises')}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className={styles.optionCardContent}>
            <div className={styles.optionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className={styles.optionTitle}>Exerciții</h3>
            <p className={styles.optionDescription}>
              Practică exerciții pentru a reduce anxietatea și îmbunătăți starea mentală
            </p>

            {/* Exercise Type Options (shown when active) */}
            <div className={`${styles.expandedOptions} ${activeSection === 'exercises' ? styles.show : ''}`}>
              <h4>Alege tipul de exercițiu</h4>
              <div className={styles.exerciseGrid}>
                {exerciseTypes.map((exerciseType) => (
                  <div
                    key={exerciseType.id}
                    className={`${styles.exerciseCard} ${selectedExerciseType === exerciseType.id ? styles.selected : ''} ${['breathing', 'mindfulness', 'grounding'].includes(exerciseType.id) ? '' : styles.comingSoon}`}
                    onClick={() => handleSelectExerciseType(exerciseType.id)}
                  >
                    <div className={styles.exerciseIcon}>
                      {exerciseType.icon}
                    </div>
                    <div className={styles.exerciseInfo}>
                      <h5 className={styles.exerciseTitle}>{exerciseType.title}</h5>
                      <p className={styles.exerciseDescription}>{exerciseType.description}</p>
                    </div>
                    {!['breathing', 'mindfulness', 'grounding'].includes(exerciseType.id) && (
                      <div className={styles.comingSoonBadge}>În curând</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show selected exercise */}
      {showExercise && (
        <div className={styles.exerciseContainer}>
          <TherapeuticExercise 
            type={exerciseType} 
            onClose={() => setShowExercise(false)}
            calmMode={true}
            duration={60} // 60 seconds exercise
          />
        </div>
      )}

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <p>
          Terapie AI este un instrument de suport, nu un înlocuitor pentru ajutor profesional.
          Pentru situații de urgență, contactează un specialist în sănătate mintală.
        </p>
      </div>
    </div>
  );
}