'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Therapist } from '@/app/types';
import FocusTrap from '../utils/FocusTrap';

interface TherapistProfileModalProps {
  therapist: Therapist;
  isOpen: boolean;
  onClose: () => void;
}

export default function TherapistProfileModal({ 
  therapist, 
  isOpen, 
  onClose 
}: TherapistProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus the close button when modal opens
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
      
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore scrolling on body when modal closes
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap isActive={isOpen}>
      {/* Backdrop overlay */}
      <div 
        className="custom-overlay visible" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="therapist-profile-modal" 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        aria-describedby="profile-description"
      >
        <div className="modal-header">
          <span id="profile-title">Profilul terapeutului</span>
          <button 
            ref={closeButtonRef}
            className="modal-close" 
            onClick={onClose} 
            aria-label="Închide profilul"
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
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
        
        <div className="modal-content">
          <div className="therapist-profile-header">
            <div className="therapist-avatar-large">
              <Image
                src={therapist.avatarSrc}
                alt={`Imagine de profil a terapeutului ${therapist.name}`}
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            </div>
            
            <div className="therapist-details">
              <h2 className="therapist-name-large">{therapist.name}</h2>
              <div className="therapist-title-badge">{therapist.title}</div>
            </div>
          </div>
          
          <div id="profile-description" className="therapist-description-container">
            <h3 className="description-heading">Abordare terapeutică</h3>
            <p className="therapist-description-text">{therapist.description}</p>
            
            <div className="therapist-approach">
              {getTherapistDetails(therapist.id)}
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}

// Helper function to get detailed therapist information based on ID
function getTherapistDetails(therapistId: string) {
  // Custom details for each therapist
  const details: Record<string, React.ReactNode> = {
    maria: (
      <>
        <p>Maria folosește o abordare bazată pe <strong>terapie cognitiv-comportamentală</strong> pentru a te ajuta să identifici și să modifici tiparele de gândire care îți creează dificultăți.</p>
        <ul className="approach-list" role="list">
          <li>Ascultă cu empatie și înțelegere</li>
          <li>Oferă observații valoroase</li>
          <li>Te ghidează spre propriile concluzii</li>
          <li>Menține un ton calm și încurajator</li>
        </ul>
      </>
    ),
    alin: (
      <>
        <p>Alin folosește metoda <strong>"dragoste dură"</strong> pentru a te provoca să ieși din zona de confort și să îți atingi potențialul maxim.</p>
        <ul className="approach-list" role="list">
          <li>Pune întrebări provocatoare</li>
          <li>Contestă presupunerile limitative</li>
          <li>Folosește umor și energie pozitivă</li>
          <li>Te motivează spre acțiune și schimbare</li>
        </ul>
      </>
    ),
    ana: (
      <>
        <p>Ana te ghidează într-o călătorie de <strong>descoperire personală</strong> și te ajută să îți înțelegi mai bine valorile și tiparele de gândire.</p>
        <ul className="approach-list" role="list">
          <li>Utilizează întrebări reflective</li>
          <li>Încurajează contemplația și meditația</li>
          <li>Folosește metafore revelatorii</li>
          <li>Creează un spațiu pentru introspecție profundă</li>
        </ul>
      </>
    ),
    teodora: (
      <>
        <p>Teodora te ajută să te concentrezi pe <strong>responsabilitatea personală</strong> și pe aspectele vieții tale pe care le poți controla și modifica.</p>
        <ul className="approach-list" role="list">
          <li>Oferă perspective imparțiale și directe</li>
          <li>Dezvoltă reziliența emoțională</li>
          <li>Învață strategii de auto-control</li>
          <li>Promovează abordări pragmatice pentru schimbare</li>
        </ul>
      </>
    )
  };
  
  return details[therapistId] || (
    <p>Acest terapeut te va ajuta să explorezi gândurile și emoțiile într-un mediu sigur și de susținere.</p>
  );
}