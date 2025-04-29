'use client';

import React, { useEffect, useRef } from 'react';
import FocusTrap from '../../utils/FocusTrap';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  calmMode?: boolean; // Adăugat pentru starea de calm
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmă',
  cancelText = 'Anulează',
  isDestructive = false,
  calmMode = false
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside the dialog
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
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
      
      // Focus on the appropriate button when dialog opens
      // For destructive dialogs, focus the cancel button by default
      // For normal dialogs, focus the confirm button
      // În calm mode, întârzie focusul pentru a nu crea anxietate
      const focusDelay = calmMode ? 300 : 100;
      
      setTimeout(() => {
        if (isDestructive && cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        } else if (confirmButtonRef.current && !isDestructive) {
          confirmButtonRef.current.focus();
        } else if (dialogRef.current) {
          const cancelButton = dialogRef.current.querySelector(`.${styles.cancelButton}`) as HTMLButtonElement;
          if (cancelButton) {
            cancelButton.focus();
          }
        }
      }, focusDelay);
      
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore scrolling
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isDestructive, calmMode]);

  if (!isOpen) return null;

  return (
    <FocusTrap isActive={isOpen}>
      {/* Backdrop overlay cu tranziție mai lentă în calm mode */}
      <div 
        className={`${styles.overlay} ${styles.visibleOverlay} ${calmMode ? styles.calmOverlay : ''}`} 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div 
        className={`${styles.dialog} ${calmMode ? styles.calmDialog : ''}`} 
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className={`${styles.dialogHeader} ${calmMode ? styles.calmDialogHeader : ''}`}>
          <span id="dialog-title">{title}</span>
          <button 
            className={styles.closeButton} 
            onClick={onClose} 
            aria-label="Închide dialogul"
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
        
        <div className={styles.dialogContent}>
          <div id="dialog-message" className={styles.dialogMessage}>
            {message}
          </div>
          
          <div className={styles.dialogActions}>
            <button 
              ref={cancelButtonRef}
              className={`${styles.dialogButton} ${styles.cancelButton} ${calmMode ? styles.calmButton : ''}`} 
              onClick={onClose}
            >
              {cancelText}
            </button>
            
            <button 
              ref={confirmButtonRef}
              className={`${styles.dialogButton} ${styles.confirmButton} 
                         ${isDestructive ? styles.destructiveButton : ''} 
                         ${calmMode ? styles.calmButton : ''}`} 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
        
        {/* Mesaj de suport emoțional pentru ștergere în calm mode */}
        {isDestructive && calmMode && (
          <div className={styles.supportNote}>
            Decizia ta este importantă. Poți lua o pauză înainte de a continua.
          </div>
        )}
      </div>
    </FocusTrap>
  );
}