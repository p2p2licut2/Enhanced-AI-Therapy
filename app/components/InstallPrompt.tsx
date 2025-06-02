'use client';

import React, { useState, useEffect } from 'react';

// Deferim executarea codului la runtime in browserul client
export default function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  // Tipul pentru evenimentul BeforeInstallPrompt (nu există în TypeScript standard)
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }

  useEffect(() => {
    // Verificare pentru iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    
    // Verificare dacă aplicația este deja instalată
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone;
                          
    // Nu afișăm prompt-ul dacă aplicația e deja instalată
    if (isAppInstalled) {
      return;
    }

    // Capturăm evenimentul beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenim afișarea promptului nativ
      e.preventDefault();
      // Salvăm evenimentul pentru a-l folosi mai târziu
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Afișăm banner-ul nostru personalizat
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Verificăm localstorage pentru a vedea dacă utilizatorul a închis banner-ul anterior
    const hasClosedPrompt = localStorage.getItem('installPromptClosed');
    if (hasClosedPrompt && Date.now() - parseInt(hasClosedPrompt) < 1000 * 60 * 60 * 24 * 7) {
      // Nu afișăm prompt-ul dacă a fost închis în ultima săptămână
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installEvent) return;
    
    // Afișăm promptul nativ
    await installEvent.prompt();
    
    // Așteptăm alegerea utilizatorului
    const { outcome } = await installEvent.userChoice;
    
    // Ascundem banner-ul nostru
    setShowInstallPrompt(false);
    
    // Stocăm în localStorage că utilizatorul a văzut prompt-ul
    localStorage.setItem('installPromptClosed', Date.now().toString());
  };

  const handleCloseClick = () => {
    setShowInstallPrompt(false);
    // Stocăm în localStorage că utilizatorul a închis prompt-ul
    localStorage.setItem('installPromptClosed', Date.now().toString());
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-prompt-text">
          <h3>Instalează Soulberry</h3>
          <p>
            {isIOS 
              ? 'Adaugă această aplicație pe ecranul tău de pornire pentru acces rapid și offline.' 
              : 'Instalează aplicația pentru o experiență mai bună și acces instant.'}
          </p>
        </div>
        
        <div className="install-prompt-actions">
          {isIOS ? (
            <div className="ios-instructions">
              <p>Apasă pe <strong>Partajează</strong> <span className="share-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
                </svg>
              </span> și apoi <strong>Adaugă la ecranul principal</strong></p>
            </div>
          ) : (
            <button className="install-button" onClick={handleInstallClick}>
              Instalează acum
            </button>
          )}
          <button className="close-install-prompt" onClick={handleCloseClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}