'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId } from '@/app/types';
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

// Benefits list with icons
const benefits = [
  {
    title: 'Confidențialitate',
    description: 'Conversațiile tale rămân private și securizate',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Disponibil Oricând',
    description: 'Suport emoțional disponibil 24/7, când ai nevoie',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Feedback Personalizat',
    description: 'Perspective adaptate stilului tău de gândire',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function WelcomePage() {
  const { createNewConversation, setShowWelcomePage } = useApp();
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistId | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Bine ai venit!
        </h1>
        
        <p className={styles.heroSubtitle}>
          Un spațiu sigur pentru conversații semnificative și sprijin emoțional
        </p>
      </div>

      {/* Therapist Selection Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Alege-ți terapeutul
        </h2>
        
        <p className={styles.sectionDescription}>
          Fiecare terapeut are propria abordare unică. Selectează-l pe cel care ți se potrivește cel mai bine.
        </p>
        
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
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              </div>
              <div className={styles.therapistInfo}>
                <h3 className={styles.therapistName}>{therapist.name}</h3>
                <div className={styles.therapistSpecialty}>{therapist.specialty}</div>
                <p className={styles.therapistDescription}>{therapist.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className={`${styles.section} ${styles.benefitsSection}`}>
        <h2 className={styles.sectionTitle}>
          Beneficiile Terapie AI
        </h2>
        
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} className={styles.benefitCard}>
              <div className={styles.benefitIcon}>
                {benefit.icon}
              </div>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitDescription}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

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