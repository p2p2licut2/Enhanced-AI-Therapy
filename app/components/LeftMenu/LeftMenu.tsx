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
    // Focus the input when renaming starts
    if (isRenaming && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isRenaming]);

  const handleCloseMenu = () => {
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

  const renderConversationItem = (
    conversation: Conversation,
    isCurrent: boolean = false,
    section: 'favorite' | 'recent'
  ) => {
    const itemId = `${conversation.id}-${section}`;
    const isCurrentlyRenaming = isRenaming && editingItemId === itemId;
    const showOptionButtons = isCurrent || hoveredConversationId === conversation.id;

    return (
      <div
        key={`${conversation.id}-${section}`}
        className={`${styles.conversationItem} ${isCurrent ? styles.currentConversation : ''}`}
        onClick={() => handleConversationClick(conversation.id)}
        onMouseEnter={() => setHoveredConversationId(conversation.id)}
        onMouseLeave={() => setHoveredConversationId(null)}
      >
        {isCurrentlyRenaming ? (
          <form onSubmit={handleRenameSubmit} className={styles.renameFormMenu} onClick={e => e.stopPropagation()}>
            <input
              ref={titleInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={styles.renameInputMenu}
              placeholder="Introdu un nou titlu"
            />
            <div className={styles.renameActionsMenu}>
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
              <div className={styles.conversationItemTitle}>{conversation.title}</div>
              <div className={styles.conversationItemDate}>{formatDate(conversation.updatedAt)}</div>
            </div>

            <div className={styles.conversationActions}>
              {conversation.isFavorite && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.favoriteIcon}
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
                  aria-label="Options"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
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
      {/* Backdrop overlay */}
      <div
        className={`${styles.overlay} ${isMenuOpen ? styles.visible : ''}`}
        onClick={handleCloseMenu}
      />

      {/* Side menu panel */}
      <div className={`${styles.sideMenu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.menuHeader}>
          <span>Terapie AI</span>
          <button
            className={styles.menuClose}
            onClick={handleCloseMenu}
            aria-label="Close menu"
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

        {/* New conversation option */}
        <div className={styles.menuSection}>
          <div
            className={styles.menuItem}
            onClick={handleNewConversation}
          >
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 mr-3"
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
                  className="w-4 h-4 mr-2 text-yellow-500"
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

            {favoriteConversations.map(conversation =>
              renderConversationItem(
                conversation,
                conversation.id === currentConversation?.id,
                'favorite'
              )
            )}
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
                className="w-4 h-4 mr-2"
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