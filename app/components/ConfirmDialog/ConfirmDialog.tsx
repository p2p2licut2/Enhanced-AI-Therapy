'use client';

import React, { useEffect, useRef } from 'react';
import FocusTrap from '../../utils/FocusTrap';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmă',
  cancelText = 'Anulează',
  isDestructive = false
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

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
      setTimeout(() => {
        if (confirmButtonRef.current && !isDestructive) {
          confirmButtonRef.current.focus();
        } else if (dialogRef.current) {
          const cancelButton = dialogRef.current.querySelector('.cancel-button') as HTMLButtonElement;
          if (cancelButton) {
            cancelButton.focus();
          }
        }
      }, 0);
      
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore scrolling
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isDestructive]);

  if (!isOpen) return null;

  return (
    <FocusTrap isActive={isOpen}>
      {/* Backdrop overlay */}
      <div 
        className="custom-overlay visible" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div 
        className="confirm-dialog" 
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className="dialog-header">
          <span id="dialog-title">{title}</span>
          <button 
            className="modal-close" 
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
        
        <div className="dialog-content">
          <div id="dialog-message" className="dialog-message" style={{ color: 'var(--color-text)' }}>
            {message}
          </div>
          
          <div className="dialog-actions">
            <button 
              className="dialog-button cancel-button" 
              onClick={onClose}
            >
              {cancelText}
            </button>
            
            <button 
              ref={confirmButtonRef}
              className={`dialog-button confirm-button ${isDestructive ? 'destructive-button' : ''}`} 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}