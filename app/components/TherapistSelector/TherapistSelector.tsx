// app/components/TherapistSelector.tsx
'use client';

import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId } from '@/app/types';

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
        className={`overlay ${isTherapistSelectorOpen ? 'visible' : ''}`} 
        onClick={handleClose}
      />
      
      {/* Therapist selector panel */}
      <div className={`side-menu ${isTherapistSelectorOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <span>Alege terapeutul</span>
          <button 
            className="menu-close" 
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
        
        <div className="px-4 py-3">
          <p className="text-sm text-gray-600 mb-4">
            Alege terapeutul potrivit pentru nevoile tale. Fiecare are un stil diferit de abordare.
          </p>
          
          <div className="therapist-grid">
            {therapists.map(therapist => (
              <div 
                key={therapist.id}
                className="therapist-card"
                onClick={() => handleSelectTherapist(therapist.id)}
              >
                <div className="therapist-avatar">
                  <Image 
                    src={therapist.avatarSrc} 
                    alt={therapist.name} 
                    width={64} 
                    height={64} 
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="therapist-name">{therapist.name}</div>
                <div className="therapist-description">{therapist.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}