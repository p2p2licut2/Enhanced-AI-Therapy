'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId } from '@/app/types';
import styles from './TherapistSelector.module.css';

// Define therapists data
const therapists = [
  {
    id: 'maria' as TherapistId,
    name: 'Maria',
    description: 'Terapeutul tău zilnic, ascultă și îndrumă',
    avatarSrc: '/maria-avatar.png',
    personality: 'Empatică și suportivă',
    approach: 'Terapie cognitiv-comportamentală',
    suitable: 'Când ai nevoie de suport emoțional și înțelegere blândă',
    emotionalState: 'calm'
  },
  {
    id: 'alin' as TherapistId,
    name: 'Alin',
    description: 'Dragoste dură cu intenții pozitive',
    avatarSrc: '/alin-avatar.png',
    personality: 'Provocator și direct',
    approach: 'Coaching motivațional',
    suitable: 'Când ai nevoie de motivație și o perspectivă directă',
    emotionalState: 'focus'
  },
  {
    id: 'ana' as TherapistId,
    name: 'Ana',
    description: 'Înțelegerea sinelui',
    avatarSrc: '/ana-avatar.png',
    personality: 'Reflectivă și intuitivă',
    approach: 'Auto-descoperire și mindfulness',
    suitable: 'Când dorești să te înțelegi mai profund pe tine însuți',
    emotionalState: 'support'
  },
  {
    id: 'teodora' as TherapistId,
    name: 'Teodora',
    description: 'Te ajută să te schimbi pe tine, nu pe ceilalți',
    avatarSrc: '/teodora-avatar.png',
    personality: 'Echilibrată și pragmatică',
    approach: 'Terapie centrată pe soluții',
    suitable: 'Când cauți soluții practice la problemele tale',
    emotionalState: 'neutral'
  },
];

export default function TherapistSelector() {
  const { 
    isTherapistSelectorOpen, 
    setIsTherapistSelectorOpen,
    createNewConversation
  } = useApp();

  // State pentru experiență terapeutică îmbunătățită
  const [expandedTherapist, setExpandedTherapist] = useState<TherapistId | null>(null);
  const [calmMode, setCalmMode] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistId | null>(null);
  const [emotionalNeed, setEmotionalNeed] = useState<string>('');

  const handleClose = () => {
    setIsTherapistSelectorOpen(false);
    // Reset statele la închidere
    setExpandedTherapist(null);
    setSelectedTherapist(null);
  };

  const handleSelectTherapist = (therapistId: TherapistId) => {
    setSelectedTherapist(therapistId);
    
    // Adăugăm o mică întârziere înainte de a crea conversația
    // pentru ca utilizatorul să vadă selecția și să se simtă în control
    setTimeout(() => {
      createNewConversation(therapistId);
      setIsTherapistSelectorOpen(false);
      // Reset statele
      setExpandedTherapist(null);
      setSelectedTherapist(null);
    }, calmMode ? 800 : 400);
  };

  const toggleExpandTherapist = (therapistId: TherapistId) => {
    if (expandedTherapist === therapistId) {
      setExpandedTherapist(null);
    } else {
      setExpandedTherapist(therapistId);
    }
  };

  // Toggle calm mode
  const toggleCalmMode = () => {
    setCalmMode(prev => !prev);
  };

  // Sugestii de terapeuți bazate pe starea emoțională
  const getSuggestedTherapist = (): TherapistId | null => {
    if (!emotionalNeed) return null;
    
    const lowerNeed = emotionalNeed.toLowerCase();
    
    if (lowerNeed.includes('anxios') || lowerNeed.includes('frică') || 
        lowerNeed.includes('neliniștit') || lowerNeed.includes('calm')) {
      return 'maria';
    }
    else if (lowerNeed.includes('motivație') || lowerNeed.includes('blocat') || 
             lowerNeed.includes('provocare')) {
      return 'alin';
    }
    else if (lowerNeed.includes('înțelegere') || lowerNeed.includes('sine') || 
             lowerNeed.includes('identitate')) {
      return 'ana';
    }
    else if (lowerNeed.includes('soluție') || lowerNeed.includes('practic') || 
             lowerNeed.includes('schimbare')) {
      return 'teodora';
    }
    
    return null;
  };

  const suggestedTherapist = getSuggestedTherapist();

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`${styles.overlay} ${isTherapistSelectorOpen ? styles.visibleOverlay : ''} ${calmMode ? styles.calmOverlay : ''}`} 
        onClick={handleClose}
      />
      
      {/* Therapist selector panel */}
      <div className={`${styles.sideMenu} ${isTherapistSelectorOpen ? styles.open : ''} ${calmMode ? styles.calmMenu : ''}`}>
        <div className={styles.menuHeader}>
          <span>Alege terapeutul</span>
          <div className={styles.headerControls}>
            {/* Calm Mode Toggle */}
            <button 
              className={`${styles.calmModeToggle} ${calmMode ? styles.calmModeActive : ''}`}
              onClick={toggleCalmMode}
              aria-label={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
              aria-pressed={calmMode}
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
            </button>
            
            <button 
              className={styles.menuClose} 
              onClick={handleClose}
              aria-label="Close therapist selector"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        <div className={styles.introSection}>
          <p className={styles.introText}>
            {calmMode 
              ? "Ia-ți un moment să te gândești ce fel de suport ai nevoie acum. Fiecare terapeut oferă o abordare unică." 
              : "Alege terapeutul potrivit pentru nevoile tale. Fiecare are un stil diferit de abordare."
            }
          </p>
          
          {/* Secțiune nouă pentru stare emoțională */}
          <div className={styles.emotionalNeedSection}>
            <label htmlFor="emotional-need" className={styles.emotionalNeedLabel}>
              Ce simți acum sau ce tip de suport cauți?
            </label>
            <input
              id="emotional-need"
              type="text"
              value={emotionalNeed}
              onChange={(e) => setEmotionalNeed(e.target.value)}
              placeholder={calmMode ? "Ex: Mă simt anxios..." : "Descrie starea ta emoțională..."}
              className={`${styles.emotionalNeedInput} ${calmMode ? styles.calmInput : ''}`}
            />
            
            {suggestedTherapist && (
              <div className={styles.suggestionBanner}>
                <span className={styles.suggestionIcon}>💡</span>
                <span>
                  <strong>{therapists.find(t => t.id === suggestedTherapist)?.name}</strong> ar putea fi potrivit/ă pentru tine.
                </span>
              </div>
            )}
          </div>
          
          <div className={`${styles.therapistGrid} ${calmMode ? styles.calmGrid : ''}`}>
            {therapists.map(therapist => {
              const isExpanded = expandedTherapist === therapist.id;
              const isSelected = selectedTherapist === therapist.id;
              const isSuggested = suggestedTherapist === therapist.id;
              
              return (
                <div 
                  key={therapist.id}
                  className={`${styles.therapistCard} 
                            ${isExpanded ? styles.expanded : ''} 
                            ${isSelected ? styles.selected : ''} 
                            ${isSuggested ? styles.suggested : ''} 
                            ${calmMode ? styles.calmCard : ''}
                            ${styles[therapist.emotionalState]}`}
                >
                  <div 
                    className={styles.therapistHeader}
                    onClick={() => toggleExpandTherapist(therapist.id)}
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
                      <div className={styles.therapistName}>{therapist.name}</div>
                      <div className={styles.therapistDescription}>{therapist.description}</div>
                    </div>
                    <button 
                      className={styles.expandButton}
                      aria-label={isExpanded ? `Minimizează informații despre ${therapist.name}` : `Vezi mai multe despre ${therapist.name}`}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className={`${styles.therapistDetails} ${calmMode ? styles.calmDetails : ''}`}>
                      <div className={styles.therapistDetailItem}>
                        <span className={styles.detailLabel}>Personalitate:</span>
                        <span className={styles.detailValue}>{therapist.personality}</span>
                      </div>
                      <div className={styles.therapistDetailItem}>
                        <span className={styles.detailLabel}>Abordare:</span>
                        <span className={styles.detailValue}>{therapist.approach}</span>
                      </div>
                      <div className={styles.therapistDetailItem}>
                        <span className={styles.detailLabel}>Potrivit/ă:</span>
                        <span className={styles.detailValue}>{therapist.suitable}</span>
                      </div>
                      <button 
                        className={`${styles.selectButton} ${calmMode ? styles.calmButton : ''}`}
                        onClick={() => handleSelectTherapist(therapist.id)}
                      >
                        Alege pe {therapist.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Informații despre alegerea terapeuților */}
        <div className={`${styles.infoSection} ${calmMode ? styles.calmInfoSection : ''}`}>
          <h3 className={styles.infoTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 inline-block mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sfat pentru alegerea terapeutului
          </h3>
          <p className={styles.infoText}>
            Este important să alegi un terapeut cu care te simți confortabil. Poți schimba terapeutul oricând dorești începând o conversație nouă.
          </p>
        </div>
      </div>
    </>
  );
}