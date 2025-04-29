'use client';

import { Conversation } from '@/app/types';
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import styles from './LeftMenu.module.css';

export default function LeftMenu() {
  const {
    isMenuOpen,
    setIsMenuOpen,
    setIsTherapistSelectorOpen,
    favoriteConversations,
    recentConversations,
    loadConversation,
    currentConversation,
    renameConversation,
    deleteConversation
  } = useApp();

  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);
  // Stare pentru activarea modului calm
  const [calmMode, setCalmMode] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && e.target instanceof Node) {
        if (!optionsRef.current.contains(e.target)) {
          setShowOptionsFor(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Focus the input when renaming starts with o mică întârziere pentru a reduce anxietatea
    if (isRenaming && titleInputRef.current) {
      const focusTimer = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 100);
      
      return () => clearTimeout(focusTimer);
    }
  }, [isRenaming]);

  const handleCloseMenu = () => {
    // Tranziție mai calmă la închidere
    setIsMenuOpen(false);
    setShowOptionsFor(null);
    setIsRenaming(false);
  };

  const handleNewConversation = () => {
    setIsTherapistSelectorOpen(true);
    handleCloseMenu();
  };

  const handleConversationClick = (conversationId: string) => {
    if (!isRenaming) {
      loadConversation(conversationId);
      handleCloseMenu();
    }
  };

  const handleOptionsClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    conversationId: string,
    section: 'favorite' | 'recent'
  ) => {
    e.stopPropagation();
    setShowOptionsFor(`${conversationId}-${section}`);
  };

  const getConversationIdFromComposite = (compositeId: string): string => {
    if (compositeId.endsWith('-favorite') || compositeId.endsWith('-recent')) {
      return compositeId.substring(0, compositeId.lastIndexOf('-'));
    }
    return compositeId; // Safety case
  };

  const handleRename = (conversationId: string, section: 'favorite' | 'recent') => {
    // Find the conversation to get its current title
    const conversation = [...favoriteConversations, ...recentConversations]
      .find(c => c.id === conversationId);

    if (conversation) {
      setNewTitle(conversation.title);
      setIsRenaming(true);
      setEditingItemId(`${conversationId}-${section}`);
      setShowOptionsFor(null);
    }
  };

  const handleDelete = (conversationId: string) => {
    // Use the custom dialog instead of window.confirm
    setConversationToDelete(conversationId);
    setShowDeleteConfirm(true);
    setShowOptionsFor(null);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete);
      setConversationToDelete(null);
    }
  };

  const handleRenameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingItemId && newTitle.trim()) {
      const conversationId = getConversationIdFromComposite(editingItemId);
      renameConversation(conversationId, newTitle.trim());
      setIsRenaming(false);
      setEditingItemId(null);
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setEditingItemId(null);
  };

  // Format date to readable string
  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ro });
  };

  // Toggle calm mode pentru utilizatorii cu anxietate
  const toggleCalmMode = () => {
    setCalmMode(prev => !prev);
  };

  const renderConversationItem = (
    conversation: Conversation,
    isCurrent: boolean = false,
    section: 'favorite' | 'recent'
  ) => {
    const itemId = `${conversation.id}-${section}`;
    const isCurrentlyRenaming = isRenaming && editingItemId === itemId;
    const showOptionButtons = isCurrent || hoveredConversationId === conversation.id;

    // Identificăm tipul emoțional al conversației pentru personalizare
    const isPositiveConversation = conversation.title.toLowerCase().includes('bine') || 
                                  conversation.title.toLowerCase().includes('progres');
    const isCalmingConversation = conversation.title.toLowerCase().includes('calm') || 
                                 conversation.title.toLowerCase().includes('relaxare');

    return (
      <div
        key={`${conversation.id}-${section}`}
        className={`${styles.conversationItem} 
                   ${isCurrent ? styles.currentConversation : ''} 
                   ${isPositiveConversation ? styles.positiveConversation : ''}
                   ${isCalmingConversation ? styles.calmingConversation : ''}
                   ${calmMode ? styles.calmModeItem : ''}`}
        onClick={() => handleConversationClick(conversation.id)}
        onMouseEnter={() => setHoveredConversationId(conversation.id)}
        onMouseLeave={() => setHoveredConversationId(null)}
        aria-current={isCurrent ? 'true' : 'false'}
      >
        {isCurrentlyRenaming ? (
          <form onSubmit={handleRenameSubmit} className={styles.renameForm} onClick={e => e.stopPropagation()}>
            <input
              ref={titleInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={styles.renameInput}
              placeholder="Introdu un nou titlu"
              aria-label="Numele conversației"
            />
            <div className={styles.renameActions}>
              <button type="submit" className={styles.saveButton}>
                Salvează
              </button>
              <button
                type="button"
                onClick={handleRenameCancel}
                className={styles.cancelButton}
              >
                Anulează
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className={styles.conversationDetails}>
              <div className={styles.conversationTitle}>
                {/* Indicator emoțional pentru conversație */}
                {isPositiveConversation && (
                  <span className={`${styles.moodIndicator} ${styles.moodPositive}`} 
                        aria-label="Conversație pozitivă"></span>
                )}
                {isCalmingConversation && (
                  <span className={`${styles.moodIndicator} ${styles.moodCalm}`}
                        aria-label="Conversație calmantă"></span>
                )}
                {conversation.title}
              </div>
              <div className={styles.conversationDate}>{formatDate(conversation.updatedAt)}</div>
            </div>

            <div className={styles.conversationActions}>
              {conversation.isFavorite && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.favoriteIcon}
                  aria-label="Conversație favorită"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {/* Show options button when hovering or when it's the current conversation */}
              {showOptionButtons && (
                <button
                  className={styles.optionsButton}
                  onClick={(e) => handleOptionsClick(e, conversation.id, section)}
                  aria-label="Opțiuni pentru conversație"
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              )}

              {showOptionsFor === itemId && (
                <div className={styles.conversationOptions} ref={optionsRef} onClick={e => e.stopPropagation()}>
                  <div
                    className={styles.conversationOption}
                    onClick={() => handleRename(conversation.id, section)}
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
                    className={`${styles.conversationOption} ${styles.deleteOption}`}
                    onClick={() => handleDelete(conversation.id)}
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
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay with calm transition */}
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.visibleOverlay : ''} ${calmMode ? styles.calmOverlay : ''}`}
        onClick={handleCloseMenu}
        aria-hidden="true"
      />

      {/* Side menu panel with therapeutic considerations */}
      <div className={`${styles.sideMenu} ${isMenuOpen ? styles.openMenu : ''} ${calmMode ? styles.calmModeMenu : ''}`}>
        <div className={styles.menuHeader}>
          <span>Terapie AI</span>
          <div className={styles.headerActions}>
            {/* Buton pentru modul calm - nou adăugat */}
            <button 
              className={`${styles.calmModeToggle} ${calmMode ? styles.calmModeActive : ''}`}
              onClick={toggleCalmMode}
              aria-label={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
              aria-pressed={calmMode}
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            </button>
            <button
              className={styles.menuClose}
              onClick={handleCloseMenu}
              aria-label="Închide meniul"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* New conversation option with soothing hover */}
        <div className={styles.menuSection}>
          <div
            className={`${styles.menuItem} ${calmMode ? styles.calmMenuItem : ''}`}
            onClick={handleNewConversation}
            role="button"
            aria-label="Începe o nouă conversație"
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-3"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Începe o nouă conversație</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.menuDivider} />

        {/* Favorite conversations */}
        {favoriteConversations.length > 0 && (
          <div className={styles.menuSection}>
            <div className={styles.sectionTitle}>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.sectionIcon}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Conversații Favorite</span>
              </div>
            </div>

            <div className={styles.conversationsList} role="list" aria-label="Conversații favorite">
              {favoriteConversations.map(conversation =>
                renderConversationItem(
                  conversation,
                  conversation.id === currentConversation?.id,
                  'favorite'
                )
              )}
            </div>
          </div>
        )}

        {/* Recent conversations */}
        <div className={styles.menuSection}>
          <div className={styles.sectionTitle}>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className={styles.sectionIcon}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Istoricul conversațiilor</span>
            </div>
          </div>

          <div className={styles.conversationsList} role="list" aria-label="Istoricul conversațiilor">
            {recentConversations.length > 0 ? (
              recentConversations.map(conversation =>
                renderConversationItem(
                  conversation,
                  conversation.id === currentConversation?.id,
                  'recent'
                )
              )
            ) : (
              <div className={styles.emptyText}>
                Nu există conversații în istoric
              </div>
            )}
          </div>
        </div>

        {/* Secțiune nouă pentru suport emoțional */}
        <div className={`${styles.supportSection} ${calmMode ? styles.calmSupportSection : ''}`}>
          <p className={styles.supportText}>
            Este important să ții minte că ai resurse la dispoziție în orice moment.
          </p>
          <a href="#" className={styles.supportLink}>
            Resurse pentru sănătate mintală
          </a>
        </div>
      </div>

      {/* Custom Delete Confirmation Dialog - cu tranziții blânde */}
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
        calmMode={calmMode}
      />
    </>
  );
}