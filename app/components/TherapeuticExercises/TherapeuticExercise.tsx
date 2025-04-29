'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './TherapeuticExercise.module.css';

interface TherapeuticExerciseProps {
  type: 'breathing' | 'mindfulness' | 'grounding';
  onClose: () => void;
  calmMode?: boolean;
  duration?: number; // in seconds
}

export default function TherapeuticExercise({ 
  type, 
  onClose, 
  calmMode = false,
  duration = 60 
}: TherapeuticExerciseProps) {
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [count, setCount] = useState(4);
  const [secondsRemaining, setSecondsRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userProgress, setUserProgress] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop timer
  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
        setUserProgress(prev => prev + (1 / duration) * 100);
      }, 1000);
    } else if (secondsRemaining === 0) {
      handleComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, secondsRemaining, duration]);

  // Handle breathing cycles
  useEffect(() => {
    if (type === 'breathing' && isRunning) {
      const totalCycleTime = 11; // 4+1+4+2 seconds

      const cycleBreathing = () => {
        if (currentPhase === 'inhale') {
          if (count > 1) {
            setCount(count - 1);
          } else {
            setCurrentPhase('hold');
            setCount(1);
          }
        } else if (currentPhase === 'hold') {
          if (count > 1) {
            setCount(count - 1);
          } else {
            setCurrentPhase('exhale');
            setCount(4);
          }
        } else if (currentPhase === 'exhale') {
          if (count > 1) {
            setCount(count - 1);
          } else {
            setCurrentPhase('rest');
            setCount(2);
          }
        } else if (currentPhase === 'rest') {
          if (count > 1) {
            setCount(count - 1);
          } else {
            setCurrentPhase('inhale');
            setCount(4);
          }
        }
      };

      breathingIntervalRef.current = setInterval(cycleBreathing, 1000);
    }

    return () => {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [currentPhase, count, isRunning, type]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTogglePause = () => {
    setIsRunning(prev => !prev);
  };

  const handleComplete = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  // Determină clasa CSS în funcție de faza de respirație
  const getBreathingClass = () => {
    if (currentPhase === 'inhale') {
      return styles.inhale;
    } else if (currentPhase === 'hold') {
      return styles.hold;
    } else if (currentPhase === 'exhale') {
      return styles.exhale;
    } else {
      return styles.rest;
    }
  };

  // Determină mesajul pentru fiecare fază
  const getPhaseMessage = () => {
    if (currentPhase === 'inhale') {
      return 'Inspiră lent prin nas';
    } else if (currentPhase === 'hold') {
      return 'Ține respirația';
    } else if (currentPhase === 'exhale') {
      return 'Expiră lent prin gură';
    } else {
      return 'Pauză';
    }
  };

  const exerciseContent = () => {
    switch (type) {
      case 'breathing':
        return (
          <div className={`${styles.breathingExercise} ${calmMode ? styles.calmExercise : ''}`}>
            <div className={`${styles.breathingCircle} ${getBreathingClass()}`}>
              <div className={styles.breathingInner}>{count}</div>
            </div>
            <div className={styles.instructions}>
              <div className={styles.phase}>{getPhaseMessage()}</div>
              <div className={styles.tip}>
                {currentPhase === 'inhale' && 'Umple-ți plămânii cu aer, simte cum pieptul se extinde'}
                {currentPhase === 'hold' && 'Menține aerul în plămâni, păstrează starea de liniște'}
                {currentPhase === 'exhale' && 'Eliberează aerul complet, lasă tensiunea să plece'}
                {currentPhase === 'rest' && 'Relaxează-te înainte de următorul ciclu'}
              </div>
            </div>
          </div>
        );
      
      case 'mindfulness':
        return (
          <div className={`${styles.mindfulnessExercise} ${calmMode ? styles.calmExercise : ''}`}>
            <p>Concentrează-te pe respirație și pe momentul prezent</p>
            <div className={styles.mindfulnessTimer}>{formatTime(secondsRemaining)}</div>
          </div>
        );
        
      case 'grounding':
        return (
          <div className={`${styles.groundingExercise} ${calmMode ? styles.calmExercise : ''}`}>
            <p>Tehnica 5-4-3-2-1</p>
            <ul className={styles.groundingList}>
              <li>5 lucruri pe care le <strong>vezi</strong></li>
              <li>4 lucruri pe care le <strong>atingi</strong></li>
              <li>3 lucruri pe care le <strong>auzi</strong></li>
              <li>2 lucruri pe care le <strong>miroși</strong></li>
              <li>1 lucru pe care îl <strong>guști</strong></li>
            </ul>
          </div>
        );
        
      default:
        return <div>Exercițiu indisponibil</div>;
    }
  };

  // Dacă folosim prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ''} ${calmMode ? styles.calmContainer : ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          {type === 'breathing' && 'Exercițiu de respirație 4-1-4-2'}
          {type === 'mindfulness' && 'Exercițiu de mindfulness'}
          {type === 'grounding' && 'Exercițiu de echilibrare (grounding)'}
        </div>
        <div className={styles.controls}>
          <button 
            className={styles.controlButton}
            onClick={toggleExpand}
            aria-label={isExpanded ? "Minimizează exercițiul" : "Extinde exercițiul"}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
          <button 
            className={styles.controlButton} 
            onClick={handleTogglePause}
            aria-label={isRunning ? "Pauză" : "Continuă"}
          >
            {isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button 
            className={styles.controlButton} 
            onClick={onClose}
            aria-label="Închide exercițiul"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className={`${styles.content} ${!isExpanded && styles.contentHidden}`}>
        {exerciseContent()}
      </div>
      
      <div className={styles.progressContainer}>
        <div 
          className={`${styles.progressBar} ${calmMode ? styles.calmProgressBar : ''} ${prefersReducedMotion ? styles.noTransition : ''}`} 
          style={{ width: `${userProgress}%` }}
          role="progressbar"
          aria-valuenow={userProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.timeRemaining}>
          {formatTime(secondsRemaining)}
        </div>
        <div className={styles.benefitText}>
          {calmMode 
            ? "Respirația conștientă reduce anxietatea și aduce claritate mentală." 
            : "Continuă să respiri împreună cu exercițiul."}
        </div>
      </div>
    </div>
  );
}