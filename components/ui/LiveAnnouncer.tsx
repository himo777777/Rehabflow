/**
 * Live Announcer Component
 *
 * Provides a way to announce dynamic content changes to screen readers.
 * Uses ARIA live regions to communicate updates without visual change.
 *
 * Usage:
 * 1. Import the announcer hook: import { useAnnouncer } from './LiveAnnouncer';
 * 2. Call announce('Your message') to broadcast to screen readers
 *
 * Politeness levels:
 * - 'polite': Waits for current speech to finish (default)
 * - 'assertive': Interrupts current speech (use for urgent messages)
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type Politeness = 'polite' | 'assertive';

interface AnnouncerContextType {
  announce: (message: string, politeness?: Politeness) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export const useAnnouncer = (): AnnouncerContextType => {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Return a no-op if not wrapped in provider (prevents crashes)
    return { announce: () => {} };
  }
  return context;
};

interface LiveAnnouncerProviderProps {
  children: React.ReactNode;
}

export const LiveAnnouncerProvider: React.FC<LiveAnnouncerProviderProps> = ({ children }) => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    // Clear previous message first to ensure screen reader picks up new one
    if (politeness === 'polite') {
      setPoliteMessage('');
    } else {
      setAssertiveMessage('');
    }

    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new message after a brief delay
    timeoutRef.current = setTimeout(() => {
      if (politeness === 'polite') {
        setPoliteMessage(message);
      } else {
        setAssertiveMessage(message);
      }

      // Clear message after it's been announced
      timeoutRef.current = setTimeout(() => {
        if (politeness === 'polite') {
          setPoliteMessage('');
        } else {
          setAssertiveMessage('');
        }
      }, 1000);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Polite live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>

      {/* Assertive live region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
};

export default LiveAnnouncerProvider;
