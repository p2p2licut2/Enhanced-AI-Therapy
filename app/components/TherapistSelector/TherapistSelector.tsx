'use client';

import Image from 'next/image';
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
  },
  {
    id: 'alin' as TherapistId,
    name: 'Alin',
    description: 'Dragoste dură cu intenții pozitive',
    avatarSrc: '/alin-avatar.png',
  },
  {
    id: 'ana' as TherapistId,
    name: 'Ana',
    description: 'Înțelegerea sinelui',
    avatarSrc: '/ana-avatar.png',
  },
  {
    id: 'teodora' as TherapistId,
    name: 'Teodora',
    description: 'Te ajută să te schimbi pe tine, nu pe ceilalți',
    avatarSrc: '/teodora-avatar.png',
  },
];

export default function TherapistSelector() {
  const { 
    isTherapistSelectorOpen, 
    setIsTherapistSelectorOpen,
    createNewConversation
  } = useApp();

  const handleClose = () => {
    setIsTherapistSelectorOpen(false);
  };

  const handleSelectTherapist = (therapistId: TherapistId) => {
    createNewConversation(therapistId);
    setIsTherapistSelectorOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`${styles.overlay} ${isTherapistSelectorOpen ? styles.visible : ''}`}
        onClick={handleClose}
      />
      
      {/* Therapist selector panel */}
      <div className={`${styles.sideMenu} ${isTherapistSelectorOpen ? styles.open : ''}`}>
        <div className={styles.menuHeader}>
          <span>Alege terapeutul</span>
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
        
        <div className={styles.content}>
          <p className={styles.infoText}>
            Alege terapeutul potrivit pentru nevoile tale. Fiecare are un stil diferit de abordare.
          </p>
          
          <div className={styles.therapistGrid}>
            {therapists.map(therapist => (
              <div 
                key={therapist.id}
                className={styles.therapistCard}
                onClick={() => handleSelectTherapist(therapist.id)}
              >
                <div className={styles.therapistAvatar}>
                  <Image 
                    src={therapist.avatarSrc} 
                    alt={therapist.name} 
                    width={64} 
                    height={64} 
                    className={styles.avatarImage}
                  />
                </div>
                <div className={styles.therapistName}>{therapist.name}</div>
                <div className={styles.therapistDescription}>{therapist.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}