'use client';

// app/components/Journaling/TherapistSelector.tsx
import React from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import { TherapistId } from '@/app/types';
import styles from './TherapistSelector.module.css';

interface TherapistSelectorProps {
  onSelect: (therapistId: TherapistId) => void;
}

export default function TherapistSelector({ onSelect }: TherapistSelectorProps) {
  const { journalTemplates } = useApp();

  // Define therapists data - could be fetched from context in a real app
  const therapists = [
    {
      id: 'maria' as TherapistId,
      name: 'Maria',
      title: 'terapeutul tău',
      description: 'Terapeutul tău zilnic, ascultă și îndrumă',
      avatarSrc: '/maria-avatar.png',
    },
    {
      id: 'alin' as TherapistId,
      name: 'Alin',
      title: 'coach provocator',
      description: 'Dragoste dură cu intenții pozitive',
      avatarSrc: '/alin-avatar.png',
    },
    {
      id: 'ana' as TherapistId,
      name: 'Ana',
      title: 'descoperire personală',
      description: 'Înțelegerea sinelui',
      avatarSrc: '/ana-avatar.png',
    },
    {
      id: 'teodora' as TherapistId,
      name: 'Teodora',
      title: 'terapeut imparțial',
      description: 'Te ajută să te schimbi pe tine, nu pe ceilalți',
      avatarSrc: '/teodora-avatar.png',
    },
  ];

  return (
    <div className={styles.therapistSelectorContainer}>
      <p className={styles.selectorDescription}>
        Selectează terapeutul cu care dorești să discuți acest subiect:
      </p>
      
      <div className={styles.therapistGrid}>
        {therapists.map((therapist) => (
          <div
            key={therapist.id}
            className={styles.therapistCard}
            onClick={() => onSelect(therapist.id)}
          >
            <div className={styles.therapistAvatar}>
              <Image
                src={therapist.avatarSrc}
                alt={therapist.name}
                width={48}
                height={48}
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.therapistInfo}>
              <h4 className={styles.therapistName}>{therapist.name}</h4>
              <p className={styles.therapistDescription}>{therapist.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}