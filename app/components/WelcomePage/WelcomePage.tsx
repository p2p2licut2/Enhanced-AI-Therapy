'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId } from '@/app/types';
import styles from './WelcomePage.module.css';

// Terapeuți
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

// Tipuri de jurnale
const journalTypes = [
  {
    id: 'reflective',
    name: 'Jurnal Reflexiv',
    description: 'Explorează gânduri, emoții și autoreflecții',
    icon: '📝',
    color: 'var(--color-support-light)',
    borderColor: 'var(--color-support)'
  },
  {
    id: 'gratitude',
    name: 'Jurnal de Recunoștință',
    description: 'Concentrează-te pe lucrurile pentru care ești recunoscător',
    icon: '✨',
    color: 'var(--color-focus-light)',
    borderColor: 'var(--color-focus)'
  }
];

// Tipuri de exerciții
const exerciseTypes = [
  {
    id: 'breathing',
    name: 'Respirație',
    description: 'Exerciții de respirație pentru reducerea anxietății',
    icon: '🫁',
    duration: '3-5 minute'
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Tehnici de conștientizare a momentului prezent',
    icon: '🧘',
    duration: '5-10 minute'
  },
  {
    id: 'grounding',
    name: 'Grounding',
    description: 'Exerciții de conectare cu momentul prezent pentru anxietate',
    icon: '🌱',
    duration: '2-5 minute'
  },
  {
    id: 'reflection',
    name: 'Reflecție Ghidată',
    description: 'Întrebări pentru explorarea gândurilor și emoțiilor',
    icon: '💭',
    duration: '10-15 minute'
  }
];

export default function WelcomePage() {
  const { createNewConversation, setShowWelcomePage } = useApp();
  
  // State pentru interacțiuni
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistId | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [calmMode, setCalmMode] = useState(false);
  const [panelHeight, setPanelHeight] = useState<number>(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Setăm animarea inițială
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Actualizează înălțimea panoului sub-opțiuni
  useEffect(() => {
    if (activePanel === 'conversation') {
      setPanelHeight(310); // Înălțime pentru terapeuți
    } else if (activePanel === 'journaling') {
      setPanelHeight(230); // Înălțime pentru jurnale
    } else if (activePanel === 'exercises') {
      setPanelHeight(360); // Înălțime pentru exerciții
    } else {
      setPanelHeight(0);
    }
  }, [activePanel]);

  // Gestionează click pe panouri
  const handlePanelClick = (panelId: string) => {
    if (activePanel === panelId) {
      setActivePanel(null);
    } else {
      setActivePanel(panelId);
      setHoveredCard(null);
    }
  };

  // Gestionează selecția terapeutului
  const handleSelectTherapist = (therapistId: TherapistId) => {
    setSelectedTherapist(therapistId);
    
    // Mică întârziere pentru efect vizual
    setTimeout(() => {
      createNewConversation(therapistId);
      setShowWelcomePage(false);
    }, 300);
  };

  // Gestionează selecția jurnalului
  const handleSelectJournal = (journalType: string) => {
    // În viitor: implementare creare jurnal
    console.log(`Jurnal de tip ${journalType} selectat`);
    
    // Pentru demo: simulăm acțiunea
    setHoveredCard(journalType);
    setTimeout(() => {
      alert(`Ai selectat jurnalul de tip: ${journalType}`);
    }, 300);
  };

  // Gestionează selecția exercițiului
  const handleSelectExercise = (exerciseType: string) => {
    // În viitor: implementare exercițiu
    console.log(`Exercițiu de tip ${exerciseType} selectat`);
    
    // Pentru demo: simulăm acțiunea
    setHoveredCard(exerciseType);
    setTimeout(() => {
      alert(`Ai selectat exercițiul de tip: ${exerciseType}`);
    }, 300);
  };

  // Gestionează accesarea jurnalelor anterioare
  const handlePreviousJournals = () => {
    alert('Accesare jurnale anterioare (funcționalitate viitoare)');
  };

  // Toggle pentru modul calm
  const toggleCalmMode = () => {
    setCalmMode(prev => !prev);
  };

  return (
    <div className={`${styles.container} ${calmMode ? styles.calmMode : ''}`}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Terapie AI</h1>
        <p className={styles.subtitle}>
          Spațiul tău personal pentru sănătate mintală și dezvoltare emoțională
        </p>
        
        {/* Calm mode toggle */}
        <button 
          className={`${styles.calmModeButton} ${calmMode ? styles.calmModeActive : ''}`}
          onClick={toggleCalmMode}
          aria-label={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span>{calmMode ? "Mod normal" : "Mod calm"}</span>
        </button>
      </header>

      {/* Secțiunea principală */}
      <main className={styles.mainContent}>
        <div className={`${styles.cardsContainer} ${animationComplete ? styles.animationComplete : ''}`}>
          {/* Card Conversație */}
          <div 
            className={`${styles.card} ${styles.conversationCard} ${activePanel === 'conversation' ? styles.activeCard : ''} ${hoveredCard === 'conversation' ? styles.hoveredCard : ''}`}
            onClick={() => handlePanelClick('conversation')}
            onMouseEnter={() => !activePanel && setHoveredCard('conversation')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              '--card-color': 'var(--color-primary-light)', 
              '--card-border-color': 'var(--color-primary)' 
            } as React.CSSProperties}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
                <path d="M8 9H16M8 13H14M21 12C21 16.9706 16.9706 21 12 21C10.5534 21 9.18437 20.6992 7.96036 20.1669C7.82174 20.1116 7.75243 20.084 7.68786 20.0731C7.62333 20.0622 7.56176 20.0647 7.49859 20.0708C7.43543 20.0769 7.37251 20.0954 7.24668 20.1325L4.06413 21.382C3.59659 21.5381 3.36282 21.6161 3.17573 21.5937C3.00999 21.574 2.85867 21.4997 2.75319 21.3828C2.63287 21.2496 2.59475 21.0455 2.51852 20.6372C2.46288 20.3255 2.43506 20.1696 2.42652 20.0166C2.41826 19.8701 2.42616 19.724 2.45004 19.58C2.4753 19.4289 2.5221 19.2866 2.61569 19.0022L3.86605 15.821C3.9031 15.6953 3.92163 15.6324 3.92777 15.5692C3.93385 15.5061 3.93626 15.4445 3.92536 15.3799C3.91447 15.3154 3.88684 15.246 3.83157 15.1074C3.29934 13.8834 3 12.479 3 11C3 6.02944 7.02944 2 12 2C16.9706 2 21 6.02944 21 11V12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Conversație Terapeutică</h2>
            <p className={styles.cardDescription}>
              Conectează-te cu un terapeut virtual pentru sprijin emoțional și insight personal
            </p>
            <div className={styles.cardAction}>
              {activePanel === 'conversation' ? 'Selectează un terapeut' : 'Click pentru a începe'}
            </div>
          </div>

          {/* Card Journaling */}
          <div 
            className={`${styles.card} ${styles.journalingCard} ${activePanel === 'journaling' ? styles.activeCard : ''} ${hoveredCard === 'journaling' ? styles.hoveredCard : ''}`}
            onClick={() => handlePanelClick('journaling')}
            onMouseEnter={() => !activePanel && setHoveredCard('journaling')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              '--card-color': 'var(--color-focus-light)', 
              '--card-border-color': 'var(--color-focus)' 
            } as React.CSSProperties}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
                <path d="M8 11H12M8 15H16M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Journaling</h2>
            <p className={styles.cardDescription}>
              Explorează-ți gândurile și emoțiile prin tehnici de jurnal ghidat
            </p>
            <div className={styles.cardAction}>
              {activePanel === 'journaling' ? 'Alege tipul de jurnal' : 'Click pentru opțiuni de journaling'}
            </div>
          </div>

          {/* Card Exerciții */}
          <div 
            className={`${styles.card} ${styles.exercisesCard} ${activePanel === 'exercises' ? styles.activeCard : ''} ${hoveredCard === 'exercises' ? styles.hoveredCard : ''}`}
            onClick={() => handlePanelClick('exercises')}
            onMouseEnter={() => !activePanel && setHoveredCard('exercises')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              '--card-color': 'var(--color-calm-light)', 
              '--card-border-color': 'var(--color-calm)' 
            } as React.CSSProperties}
          >
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.cardTitle}>Exerciții Terapeutice</h2>
            <p className={styles.cardDescription}>
              Exerciții de mindfulness, respirație și alte practici pentru echilibru emoțional
            </p>
            <div className={styles.cardAction}>
              {activePanel === 'exercises' ? 'Alege un exercițiu' : 'Click pentru exerciții terapeutice'}
            </div>
          </div>
        </div>

        {/* Panou opțiuni extinse - se extinde când un card este activ */}
        <div 
          className={`${styles.expandedPanel} ${activePanel ? styles.activePanel : ''} ${calmMode ? styles.calmPanel : ''}`}
          style={{ height: panelHeight }}
        >
          {/* Conținut pentru conversație */}
          {activePanel === 'conversation' && (
            <div className={styles.panelContent}>
              <h3 className={styles.panelTitle}>Selectează un terapeut:</h3>
              <div className={styles.therapistGrid}>
                {therapists.map(therapist => (
                  <div 
                    key={therapist.id}
                    className={`${styles.therapistCard} ${selectedTherapist === therapist.id ? styles.selectedCard : ''}`}
                    onClick={() => handleSelectTherapist(therapist.id)}
                  >
                    <div className={styles.therapistAvatar}>
                      <Image 
                        src={therapist.avatarSrc} 
                        alt={therapist.name} 
                        width={64} 
                        height={64} 
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className={styles.therapistInfo}>
                      <h4 className={styles.therapistName}>{therapist.name}</h4>
                      <div className={styles.therapistSpecialty}>{therapist.specialty}</div>
                      <p className={styles.therapistDescription}>{therapist.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Conținut pentru journaling */}
          {activePanel === 'journaling' && (
            <div className={styles.panelContent}>
              <h3 className={styles.panelTitle}>Alege tipul de jurnal:</h3>
              <div className={styles.journalGrid}>
                {journalTypes.map(journal => (
                  <div 
                    key={journal.id}
                    className={`${styles.journalCard} ${hoveredCard === journal.id ? styles.hoveredOption : ''}`}
                    onClick={() => handleSelectJournal(journal.id)}
                    style={{ 
                      backgroundColor: journal.color, 
                      borderLeft: `4px solid ${journal.borderColor}` 
                    }}
                  >
                    <div className={styles.journalIcon}>{journal.icon}</div>
                    <div className={styles.journalInfo}>
                      <h4 className={styles.journalName}>{journal.name}</h4>
                      <p className={styles.journalDescription}>{journal.description}</p>
                    </div>
                  </div>
                ))}
                
                <div 
                  className={`${styles.journalCard} ${styles.previousJournalsCard}`}
                  onClick={handlePreviousJournals}
                >
                  <div className={styles.journalIcon}>📚</div>
                  <div className={styles.journalInfo}>
                    <h4 className={styles.journalName}>Jurnale Anterioare</h4>
                    <p className={styles.journalDescription}>Accesează și revizuiește jurnalele tale anterioare</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Conținut pentru exerciții */}
          {activePanel === 'exercises' && (
            <div className={styles.panelContent}>
              <h3 className={styles.panelTitle}>Alege un exercițiu terapeutic:</h3>
              <div className={styles.exercisesGrid}>
                {exerciseTypes.map(exercise => (
                  <div 
                    key={exercise.id}
                    className={`${styles.exerciseCard} ${hoveredCard === exercise.id ? styles.hoveredOption : ''}`}
                    onClick={() => handleSelectExercise(exercise.id)}
                  >
                    <div className={styles.exerciseIcon}>{exercise.icon}</div>
                    <div className={styles.exerciseInfo}>
                      <h4 className={styles.exerciseName}>{exercise.name}</h4>
                      <p className={styles.exerciseDescription}>{exercise.description}</p>
                      <div className={styles.exerciseDuration}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.durationIcon}>
                          <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {exercise.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          {calmMode 
            ? "Terapie AI este un spațiu sigur pentru explorarea emoțiilor și dezvoltare personală." 
            : "Terapie AI este un instrument de suport, nu un înlocuitor pentru terapia profesională."}
        </p>
        <p className={styles.footerVersion}>v1.0.0</p>
      </footer>
    </div>
  );
}
