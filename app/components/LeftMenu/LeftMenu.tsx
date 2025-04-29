// LeftMenu Component Redesign
'use client';

import { Conversation } from '@/app/types';
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeSection, setActiveSection] = useState<'favorites' | 'recent' | null>(null);
  const [hoveredConversationId, setHoveredConversationId] = useState<string | null>(null);
  const [calmMode, setCalmMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs
  const optionsRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (isRenaming && titleInputRef.current) {
      const focusTimer = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, calmMode ? 300 : 100);
      
      return () => clearTimeout(focusTimer);
    }
  }, [isRenaming, calmMode]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  // Auto-focus search box when opening menu if not in calm mode
  useEffect(() => {
    if (isMenuOpen && !calmMode) {
      const searchInput = document.getElementById('menu-search');
      if (searchInput) {
        setTimeout(() => {
          searchInput.focus();
        }, 300);
      }
    }
  }, [isMenuOpen, calmMode]);

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setShowOptionsFor(null);
    setIsRenaming(false);
    setSearchQuery('');
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
    return compositeId;
  };

  const handleRename = (conversationId: string, section: 'favorite' | 'recent') => {
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

  // Format date
  const formatDate = (timestamp: number): string => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ro });
  };

  // Toggle calm mode
  const toggleCalmMode = () => {
    setCalmMode(prev => !prev);
  };

  // Toggle section
  const toggleSection = (section: 'favorites' | 'recent') => {
    setActiveSection(prev => prev === section ? null : section);
  };

  // Filter conversations
  const filterConversations = (conversations: Conversation[]): Conversation[] => {
    if (!searchQuery.trim()) return conversations;
    
    return conversations.filter(conversation => 
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredFavorites = filterConversations(favoriteConversations);
  const filteredRecent = filterConversations(recentConversations);

  // Conversation list rendering
  const renderConversationItem = (
    conversation: Conversation,
    isCurrent: boolean = false,
    section: 'favorite' | 'recent'
  ) => {
    const itemId = `${conversation.id}-${section}`;
    const isCurrentlyRenaming = isRenaming && editingItemId === itemId;
    const isHovered = hoveredConversationId === conversation.id;
    
    // Identify emotional type of conversation
    const isPositiveConversation = conversation.title.toLowerCase().includes('bine') || 
                                  conversation.title.toLowerCase().includes('progres');
    const isCalmingConversation = conversation.title.toLowerCase().includes('calm') || 
                                 conversation.title.toLowerCase().includes('relaxare');
    const isFocusConversation = conversation.title.toLowerCase().includes('focus') || 
                               conversation.title.toLowerCase().includes('atenție');

    return (
      <motion.div
        key={`${conversation.id}-${section}`}
        className={`conversation-item ${isCurrent ? 'current' : ''} 
                   ${isPositiveConversation ? 'positive' : ''}
                   ${isCalmingConversation ? 'calming' : ''}
                   ${isFocusConversation ? 'focus' : ''}
                   ${calmMode ? 'calm-mode' : ''}`}
        onClick={() => handleConversationClick(conversation.id)}
        onMouseEnter={() => setHoveredConversationId(conversation.id)}
        onMouseLeave={() => setHoveredConversationId(null)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: calmMode ? 0.4 : 0.3 }}
        aria-current={isCurrent ? 'true' : 'false'}
      >
        {isCurrentlyRenaming ? (
          <form onSubmit={handleRenameSubmit} className="rename-form" onClick={e => e.stopPropagation()}>
            <input
              ref={titleInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rename-input"
              placeholder="Introdu un nou titlu"
              aria-label="Numele conversației"
            />
            <div className="rename-actions">
              <button type="submit" className="rename-save">
                Salvează
              </button>
              <button
                type="button"
                onClick={handleRenameCancel}
                className="rename-cancel"
              >
                Anulează
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="conversation-content">
              {/* Emotional indicator for conversation */}
              {(isPositiveConversation || isCalmingConversation || isFocusConversation) && (
                <div 
                  className={`mood-indicator 
                            ${isPositiveConversation ? 'positive' : ''} 
                            ${isCalmingConversation ? 'calming' : ''} 
                            ${isFocusConversation ? 'focus' : ''}`}
                  aria-hidden="true"
                ></div>
              )}
              
              <div className="conversation-title">{conversation.title}</div>
              <div className="conversation-date">{formatDate(conversation.updatedAt)}</div>
            </div>

            <div className="conversation-actions">
              {conversation.isFavorite && (
                <div className="favorite-icon" aria-label="Conversație favorită">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Show options button when hovering or for current conversation */}
              {(isHovered || isCurrent) && (
                <button
                  className="options-button"
                  onClick={(e) => handleOptionsClick(e, conversation.id, section)}
                  aria-label="Opțiuni pentru conversație"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                <div className="options-menu" ref={optionsRef} onClick={e => e.stopPropagation()}>
                  <div
                    className="option-item"
                    onClick={() => handleRename(conversation.id, section)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Redenumește</span>
                  </div>
                  <div
                    className="option-item delete"
                    onClick={() => handleDelete(conversation.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Șterge</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    );
  };

  // Variants for animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: calmMode ? 0.4 : 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: calmMode ? 0.4 : 0.3 }
    }
  };

  const menuVariants = {
    hidden: { x: '-100%' },
    visible: { 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: calmMode ? 100 : 300, 
        damping: calmMode ? 25 : 20 
      }
    },
    exit: { 
      x: '-100%',
      transition: { 
        type: 'spring', 
        stiffness: calmMode ? 200 : 400, 
        damping: calmMode ? 35 : 25 
      }
    }
  };

  return (
    <>
      {/* Backdrop overlay with calm transition */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className={`menu-overlay ${calmMode ? 'calm-overlay' : ''}`}
            onClick={handleCloseMenu}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Side menu panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className={`side-menu ${calmMode ? 'calm-mode' : ''}`}
            ref={menuRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            role="dialog"
            aria-modal="true"
            aria-label="Meniu principal"
          >
            <div className="menu-header">
              <div className="app-brand">
                <svg className="app-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 9H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="app-name">Terapie AI</h1>
              </div>
              
              <div className="menu-actions">
                {/* Calm mode toggle */}
                <button 
                  className={`calm-toggle ${calmMode ? 'active' : ''}`}
                  onClick={toggleCalmMode}
                  aria-label={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
                  aria-pressed={calmMode}
                  title={calmMode ? "Dezactivează modul calm" : "Activează modul calm"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                </button>
                
                {/* Close button */}
                <button
                  className="close-button"
                  onClick={handleCloseMenu}
                  aria-label="Închide meniul"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

            {/* Search input */}
            <div className="search-container">
              <div className="search-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="search-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  id="menu-search"
                  type="text"
                  placeholder="Caută conversații..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* New conversation button */}
            <div className="new-conversation-wrapper">
              <button
                className="new-conversation-button"
                onClick={handleNewConversation}
                aria-label="Începe o nouă conversație"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Conversație nouă</span>
              </button>
            </div>

            {/* Divider */}
            <div className="menu-divider"></div>

            {/* Conversations sections */}
            <div className="menu-content">
              {/* Favorite conversations */}
              {filteredFavorites.length > 0 && (
                <div className="menu-section">
                  <button 
                    className="section-header" 
                    onClick={() => toggleSection('favorites')}
                    aria-expanded={activeSection === 'favorites'}
                  >
                    <div className="section-title-wrapper">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="section-icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="section-title">Conversații Favorite</span>
                    </div>
                    
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className={`section-arrow ${activeSection === 'favorites' ? 'expanded' : ''}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {(activeSection === 'favorites' || filteredFavorites.length <= 3) && (
                      <motion.div 
                        className="conversations-list"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                          opacity: 1, 
                          height: 'auto',
                          transition: { duration: calmMode ? 0.4 : 0.3 }  
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0,
                          transition: { duration: calmMode ? 0.4 : 0.3 }  
                        }}
                        role="list"
                        aria-label="Conversații favorite"
                      >
                        <AnimatePresence>
                          {filteredFavorites.map(conversation =>
                            renderConversationItem(
                              conversation,
                              conversation.id === currentConversation?.id,
                              'favorite'
                            )
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Recent conversations */}
              <div className="menu-section">
                <button 
                  className="section-header" 
                  onClick={() => toggleSection('recent')}
                  aria-expanded={activeSection === 'recent'}
                >
                  <div className="section-title-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="section-icon"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="section-title">Istoricul conversațiilor</span>
                  </div>
                  
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className={`section-arrow ${activeSection === 'recent' ? 'expanded' : ''}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {(activeSection === 'recent' || filteredRecent.length <= 5) && (
                    <motion.div 
                      className="conversations-list"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: 1, 
                        height: 'auto',
                        transition: { duration: calmMode ? 0.4 : 0.3 }  
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        transition: { duration: calmMode ? 0.4 : 0.3 }  
                      }}
                      role="list"
                      aria-label="Istoricul conversațiilor"
                    >
                      <AnimatePresence>
                        {filteredRecent.length > 0 ? (
                          filteredRecent.map(conversation =>
                            renderConversationItem(
                              conversation,
                              conversation.id === currentConversation?.id,
                              'recent'
                            )
                          )
                        ) : (
                          <motion.div 
                            className="empty-list-message"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {searchQuery ? 'Nu am găsit conversații' : 'Nu există conversații în istoric'}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Support section - enhanced */}
            <div className={`support-section ${calmMode ? 'calm-support' : ''}`}>
              <div className="support-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="support-content">
                <p className="support-text">
                  Este important să ții minte că ai resurse la dispoziție în orice moment.
                </p>
                <a href="#" className="support-link">
                  Resurse pentru sănătate mintală
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
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