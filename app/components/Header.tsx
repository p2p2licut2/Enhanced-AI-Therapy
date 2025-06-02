'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import TherapistProfileModal from './TherapistProfileModal';
import ConfirmDialog from './ConfirmDialog';

export default function Header() {
  const {
    currentTherapist,
    setIsMenuOpen,
    toggleFavorite,
    currentConversation,
    isCurrentConversationFavorite,
    renameConversation,
    deleteConversation,
    pendingConversationTitle
  } = useApp();

  // State
  const [showOptions, setShowOptions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [manualScrollActive, setManualScrollActive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);

  // Refs
  const optionsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Efect pentru click-uri în afara meniului
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Verificăm dacă click-ul este în afara meniului și a titlului
      if (showOptions && optionsRef.current && titleRef.current) {
        // Dacă click-ul nu este nici în meniu, nici pe titlu, închidem meniul
        if (!optionsRef.current.contains(e.target as Node) && 
            !titleRef.current.contains(e.target as Node)) {
          setShowOptions(false);
        }
      }
    };

    // Adăugăm listener doar când meniul este deschis
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  // Effect to handle the fade effect for the title scroll container
  useEffect(() => {
    const el = titleScrollRef.current;
    if (!el) return;

    const updateFade = () => {
      // if we're at (or almost at) the end, hide the fade
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.classList.add('fade-hidden');
      } else {
        el.classList.remove('fade-hidden');
      }
    };

    // Run once on mount (especially when the title is short)
    updateFade();

    el.addEventListener('scroll', updateFade);
    return () => el.removeEventListener('scroll', updateFade);
  }, [currentConversation?.id, pendingConversationTitle]);

  // Auto-scrolling effect
  useEffect(() => {
    if (isAutoScrolling && titleScrollRef.current) {
      const el = titleScrollRef.current;

      // Only auto-scroll if the content is actually wider than the container
      if (el.scrollWidth > el.clientWidth) {
        // Clear any existing scroll timer
        if (autoScrollTimerRef.current) {
          clearInterval(autoScrollTimerRef.current);
        }

        // Save initial position to detect manual changes
        let lastKnownScrollPosition = el.scrollLeft;

        // Start a new scroll interval
        const scrollSpeed = 1; // pixels per tick (adjust for desired speed)
        const scrollInterval = 20; // milliseconds between ticks

        let position = el.scrollLeft;
        autoScrollTimerRef.current = setInterval(() => {
          // Check if scroll position changed outside this interval
          // This indicates user has scrolled manually
          if (Math.abs(el.scrollLeft - lastKnownScrollPosition) > 1 && el.scrollLeft !== position) {
            // User scrolled manually - stop auto-scrolling
            if (autoScrollTimerRef.current) {
              clearInterval(autoScrollTimerRef.current);
              autoScrollTimerRef.current = null;
            }
            if (resetScrollTimerRef.current) {
              clearTimeout(resetScrollTimerRef.current);
              resetScrollTimerRef.current = null;
            }
            setIsAutoScrolling(false);
            setManualScrollActive(true);
            return;
          }

          // Increment position
          position += scrollSpeed;
          lastKnownScrollPosition = position;

          // If we've reached the end, set the timer to reset
          if (position >= el.scrollWidth - el.clientWidth) {
            // Clear this interval
            if (autoScrollTimerRef.current) {
              clearInterval(autoScrollTimerRef.current);
              autoScrollTimerRef.current = null;
            }

            // Set timer to reset to beginning after a pause
            if (resetScrollTimerRef.current) {
              clearTimeout(resetScrollTimerRef.current);
            }

            resetScrollTimerRef.current = setTimeout(() => {
              // Smoothly scroll back to start
              if (el && document.contains(el)) {
                el.scrollTo({
                  left: 0,
                  behavior: 'smooth'
                });
              }

              // Stop auto-scrolling
              setIsAutoScrolling(false);
            }, 2000); // 2 second pause at the end
          } else {
            // Apply the scroll position
            el.scrollLeft = position;
          }
        }, scrollInterval);
      }
    }

    return () => {
      // Cleanup intervals and timers on unmount or when auto-scrolling stops
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
      if (resetScrollTimerRef.current) {
        clearTimeout(resetScrollTimerRef.current);
        resetScrollTimerRef.current = null;
      }
    };
  }, [isAutoScrolling]);

  // Focus the input when renaming starts
  useEffect(() => {
    if (isRenaming && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isRenaming]);

  // Reset new title and scrolling state when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setNewTitle(currentConversation.title);
    } else if (pendingConversationTitle) {
      setNewTitle(pendingConversationTitle);
    }
    
    setIsRenaming(false);
    setShowOptions(false);
    setIsAutoScrolling(false);
    setManualScrollActive(false);

    // Reset auto-scroll timers
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
    if (resetScrollTimerRef.current) {
      clearTimeout(resetScrollTimerRef.current);
      resetScrollTimerRef.current = null;
    }

    // Reset scroll position
    if (titleScrollRef.current) {
      titleScrollRef.current.scrollLeft = 0;
    }
  }, [currentConversation, pendingConversationTitle]);

  // Event handlers
  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleFavoriteClick = () => {
    if (currentConversation) {
      toggleFavorite(currentConversation.id);
    }
  };

  // Funcția separată pentru deschiderea/închiderea meniului de opțiuni
  const handleTitleClick = (e: React.MouseEvent) => {
    // Prevenim propagarea pentru a evita închiderea imediată
    e.stopPropagation();
    
    // Verificăm dacă avem o conversație validă (nu afișăm meniul pentru titlul provizoriu)
    if (currentConversation) {
      // Toggle-ul stării
      setShowOptions(prev => !prev);
    }
  };

  const handleTitleMouseEnter = () => {
    if ((currentConversation || pendingConversationTitle) && !isRenaming && !showOptions) {
      setIsTitleHovered(true);
      setIsAutoScrolling(true);
    }
  };

  const handleTitleMouseLeave = () => {
    if ((currentConversation || pendingConversationTitle) && !isRenaming) {
      setIsTitleHovered(false);
      
      // Oprește auto-scrolling-ul
      setIsAutoScrolling(false);
      
      // Oprește toate intervalele și timer-ele
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
      
      if (resetScrollTimerRef.current) {
        clearTimeout(resetScrollTimerRef.current);
        resetScrollTimerRef.current = null;
      }
      
      // Resetează poziția de scroll
      if (titleScrollRef.current) {
        titleScrollRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleTherapistClick = () => {
    // Open the therapist profile modal
    setShowProfileModal(true);
  };

  // Tratăm click-urile pe opțiunile din meniu pentru a preveni propagarea
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setShowOptions(false);
    setIsAutoScrolling(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (currentConversation) {
      deleteConversation(currentConversation.id);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentConversation && newTitle.trim()) {
      renameConversation(currentConversation.id, newTitle.trim());
      setIsRenaming(false);
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    if (currentConversation) {
      setNewTitle(currentConversation.title);
    } else if (pendingConversationTitle) {
      setNewTitle(pendingConversationTitle);
    }
  };

  return (
    <>
      <div className="global-header">
        <div className="header-content">
          <div className="header-left flex items-center flex-1 min-w-0">
            <button
              className="header-menu-button"
              onClick={handleMenuClick}
              aria-label="Open menu"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div
              className="header-icon cursor-pointer"
              onClick={handleTherapistClick}
              title="Vezi profilul terapeutului"
            >
              <Image
                src={currentTherapist.avatarSrc}
                alt={currentTherapist.name}
                width={40}
                height={40}
                className="rounded-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>

            <div className="header-title-container flex flex-col min-w-0">
              <div
                className="header-title truncate cursor-pointer"
                onClick={handleTherapistClick}
                title="Vezi profilul terapeutului"
              >
                {currentTherapist.name} - {currentTherapist.title}
              </div>

              {/* Afișăm titlul conversației curente sau titlul provizoriu */}
              {(currentConversation || pendingConversationTitle) && !isRenaming && (
                <div className="scroll-fade flex-1 min-w-0 pr-2">
                  {/* Fix: Folosim două elemente diferite cu referințe separate */}
                  <div
                    ref={titleRef}
                    onClick={currentConversation ? handleTitleClick : undefined}
                    className="overflow-x-auto whitespace-nowrap no-scrollbar cursor-pointer"
                  >
                    {/* Elementul interior care are referința pentru scroll */}
                    <div
                      ref={titleScrollRef}
                      onMouseEnter={handleTitleMouseEnter}
                      onMouseLeave={handleTitleMouseLeave}
                      className={`inline-block ${isAutoScrolling ? 'auto-scrolling' : ''}`}
                    >
                      {currentConversation ? currentConversation.title : pendingConversationTitle}
                      {currentConversation && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="w-3 h-3 ml-1 inline-block"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentConversation && isRenaming && (
                <form 
                  onSubmit={handleRenameSubmit} 
                  className="rename-form"
                  onClick={(e) => e.stopPropagation()} // Prevenim propagarea
                >
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rename-input flex-1 min-w-0 truncate"
                    placeholder="Introdu un nou titlu"
                  />
                  <div className="rename-actions">
                    <button type="submit" className="rename-save-btn">
                      Salvează
                    </button>
                    <button
                      type="button"
                      onClick={handleRenameCancel}
                      className="rename-cancel-btn"
                    >
                      Anulează
                    </button>
                  </div>
                </form>
              )}

              {/* Afișăm meniul de opțiuni doar pentru conversații reale */}
              {showOptions && currentConversation && (
                <div 
                  className="title-options" 
                  ref={optionsRef}
                  onClick={(e) => e.stopPropagation()} // Prevenim propagarea
                >
                  <div 
                    className="title-option" 
                    onClick={handleRename}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Redenumește
                  </div>
                  <div 
                    className="title-option title-option-delete" 
                    onClick={handleDelete}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Șterge
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentConversation && (
            <button
              className="favorite-button"
              onClick={handleFavoriteClick}
              aria-label={isCurrentConversationFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isCurrentConversationFavorite ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
                style={{ color: isCurrentConversationFavorite ? '#FFD700' : '#C17F65' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Therapist Profile Modal */}
      <TherapistProfileModal
        therapist={currentTherapist}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Custom Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmare ștergere"
        message={
          <>
            <p>Ești sigur că vrei să ștergi această conversație?</p>
            <p><strong>Această acțiune nu poate fi anulată.</strong></p>
          </>
        }
        confirmText="Da, șterge"
        cancelText="Anulează"
        isDestructive={true}
      />
    </>
  );
}