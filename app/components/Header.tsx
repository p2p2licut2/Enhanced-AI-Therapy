'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useApp } from '@/app/contexts/AppContext';
import TherapistProfileModal from './TherapistProfileModal';
import ConfirmDialog from './ConfirmDialog';
import useAutoScroll from '../hooks/useAutoScroll';
import useSafeAsync, { useTimeout } from '../hooks/useSafeAsync';

export default function Header() {
  const {
    currentTherapist,
    setIsMenuOpen,
    toggleFavorite,
    currentConversation,
    isCurrentConversationFavorite,
    renameConversation,
    deleteConversation
  } = useApp();

  // Safety hooks - MUST COME BEFORE OTHER HOOKS
  const { isMounted } = useSafeAsync();
  const { setTimeout: safeSetTimeout } = useTimeout();

  // State
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isTitleHovered, setIsTitleHovered] = useState<boolean>(false);

  // Refs
  const optionsRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Custom hook for auto-scrolling
  const {
    elementRef: titleScrollRef,
    isScrolling: isAutoScrolling,
    setIsScrolling: setIsAutoScrolling,
    manualScrollActive,
    setManualScrollActive
  } = useAutoScroll<HTMLDivElement>(isTitleHovered, {
    speed: 1,
    interval: 20,
    pauseAtEnd: 2000
  });

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
  }, [currentConversation?.id]);

  // Handle clicks outside menus and scroll container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Type guard to ensure e.target is a Node
      if (!(e.target instanceof Node)) return;
      
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }

      // Handle clicks outside the title area
      if (titleScrollRef.current && !titleScrollRef.current.contains(e.target)) {
        // Reset scroll position ONLY if auto-scrolling was active, not for manual scroll
        if (isAutoScrolling) {
          setIsAutoScrolling(false);

          if (titleScrollRef.current) {
            titleScrollRef.current.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
          }
        }

        // Reset manual scroll flag when clicking elsewhere
        setManualScrollActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAutoScrolling, setIsAutoScrolling, setManualScrollActive]);

  // Focus the input when renaming starts
  useEffect(() => {
    if (isRenaming && titleInputRef.current) {
      // Use safe setTimeout to prevent errors if component unmounts
      safeSetTimeout(() => {
        if (titleInputRef.current && isMounted()) {
          titleInputRef.current.focus();
        }
      }, 0);
    }
  }, [isRenaming, isMounted, safeSetTimeout]);

  // Reset new title and scrolling state when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setNewTitle(currentConversation.title);
    }
    setIsRenaming(false);
    setShowOptions(false);
    setIsAutoScrolling(false);
    setManualScrollActive(false);
    
    // Reset scroll position
    if (titleScrollRef.current) {
      titleScrollRef.current.scrollLeft = 0;
    }
  }, [currentConversation, setIsAutoScrolling, setManualScrollActive]);

  // Event handlers
  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleFavoriteClick = () => {
    if (currentConversation) {
      toggleFavorite(currentConversation.id);
    }
  };

  const handleTitleClick = () => {
    if (currentConversation) {
      // Toggle the options menu
      setShowOptions(!showOptions);

      // Handle auto-scrolling state
      if (manualScrollActive) {
        // If user scrolled manually, reset this flag and start auto-scroll
        setManualScrollActive(false);
        setIsAutoScrolling(true);
      } else {
        // Otherwise toggle auto-scrolling as before
        setIsAutoScrolling(!isAutoScrolling);
      }
    }
  };

  const handleTitleMouseEnter = () => {
    if (currentConversation && !isRenaming && !showOptions) {
      setIsTitleHovered(true);
      setIsAutoScrolling(true);
    }
  };

  const handleTitleMouseLeave = () => {
    if (currentConversation && !isRenaming) {
      setIsTitleHovered(false);
      setIsAutoScrolling(false);
    }
  };

  const handleTherapistClick = () => {
    // Open the therapist profile modal
    setShowProfileModal(true);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setShowOptions(false);
    setIsAutoScrolling(false);
  };

  const handleDelete = () => {
    // Show the custom confirmation dialog instead of window.confirm
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
    }
  };

  return (
    <>
      <header className="global-header" role="banner">
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
                aria-hidden="true"
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
              role="button"
              tabIndex={0}
              aria-label={`Vezi profilul lui ${currentTherapist.name}`}
              onKeyDown={(e) => e.key === 'Enter' && handleTherapistClick()}
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTherapistClick()}
              >
                {currentTherapist.name} - {currentTherapist.title}
              </div>

              {currentConversation && !isRenaming && (
                <div className="scroll-fade flex-1 min-w-0 pr-2">
                  <div
                    ref={titleScrollRef}
                    onClick={handleTitleClick}
                    onMouseEnter={handleTitleMouseEnter}
                    onMouseLeave={handleTitleMouseLeave}
                    className={`overflow-x-auto whitespace-nowrap no-scrollbar cursor-pointer ${isAutoScrolling ? 'auto-scrolling' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Toggle conversation options"
                    aria-expanded={showOptions}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleClick()}
                  >
                    {currentConversation.title}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-3 h-3 ml-1 inline-block"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              )}

              {currentConversation && isRenaming && (
                <form onSubmit={handleRenameSubmit} className="rename-form">
                  <label htmlFor="rename-input" className="sr-only">Redenumește conversația</label>
                  <input
                    id="rename-input"
                    ref={titleInputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rename-input flex-1 min-w-0 truncate"
                    placeholder="Introdu un nou titlu"
                    aria-label="Titlu nou conversație"
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

              {showOptions && (
                <div 
                  className="title-options" 
                  ref={optionsRef}
                  role="menu"
                  aria-label="Opțiuni conversație"
                >
                  <div 
                    className="title-option" 
                    onClick={handleRename}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                      aria-hidden="true"
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
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 mr-2"
                      aria-hidden="true"
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
              aria-label={isCurrentConversationFavorite ? "Elimină de la favorite" : "Adaugă la favorite"}
              aria-pressed={isCurrentConversationFavorite}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isCurrentConversationFavorite ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
                style={{ color: isCurrentConversationFavorite ? '#FFD700' : '#C17F65' }}
                aria-hidden="true"
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
      </header>

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