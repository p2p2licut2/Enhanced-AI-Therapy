'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId } from '@/app/types';
import { motion } from 'framer-motion';

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

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className={`welcome-page ${isAnimating ? 'fade-out' : ''}`}>
      {/* Hero Section */}
      <motion.div 
        className="welcome-hero"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <motion.h1 variants={itemVariants} className="welcome-title">
          Bine ai venit!
        </motion.h1>
        
        <motion.p variants={itemVariants} className="welcome-subtitle">
          Un spațiu sigur pentru conversații semnificative și sprijin emoțional
        </motion.p>
      </motion.div>

      {/* Therapist Selection Section */}
      <motion.div 
        className="welcome-section"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="section-title">
          Alege-ți terapeutul
        </motion.h2>
        
        <motion.p variants={itemVariants} className="section-description">
          Fiecare terapeut are propria abordare unică. Selectează-l pe cel care ți se potrivește cel mai bine.
        </motion.p>
        
        <motion.div variants={itemVariants} className="therapist-grid-welcome">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className={`therapist-card-welcome ${selectedTherapist === therapist.id ? 'selected' : ''}`}
              onClick={() => handleSelectTherapist(therapist.id)}
            >
              <div className="therapist-avatar-welcome">
                <Image
                  src={therapist.avatarSrc}
                  alt={therapist.name}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="therapist-info">
                <h3 className="therapist-name-welcome">{therapist.name}</h3>
                <div className="therapist-specialty">{therapist.specialty}</div>
                <p className="therapist-description-welcome">{therapist.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div 
        className="welcome-section benefits-section"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="section-title">
          Beneficiile Terapie AI
        </motion.h2>
        
        <motion.div variants={itemVariants} className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">
                {benefit.icon}
              </div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div 
        className="welcome-disclaimer"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.p variants={itemVariants}>
          Terapie AI este un instrument de suport, nu un înlocuitor pentru ajutor profesional.
          Pentru situații de urgență, contactează un specialist în sănătate mintală.
        </motion.p>
      </motion.div>
    </div>
  );
}