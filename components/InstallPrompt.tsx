import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (Date.now() - dismissedTime < oneWeek) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show manual instructions after delay
    if (iOS && !standalone) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || (!showPrompt)) return null;

  // iOS specific instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-xl shrink-0">
              <Smartphone className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">Installera RehabFlow</h3>
              <p className="text-sm text-slate-600 mb-3">
                Tryck p\u00e5 <span className="font-semibold">Dela</span>-knappen och sedan <span className="font-semibold">"L\u00e4gg till p\u00e5 hemsk\u00e4rmen"</span> f\u00f6r snabb \u00e5tkomst.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 rounded">Dela</span>
                <span>\u2192</span>
                <span className="px-2 py-1 bg-slate-100 rounded">L\u00e4gg till p\u00e5 hemsk\u00e4rmen</span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="St\u00e4ng"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standard install prompt for Android/Desktop
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-xl shrink-0">
            <Download className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 mb-1">Installera RehabFlow</h3>
            <p className="text-sm text-slate-600 mb-3">
              F\u00e5 snabb \u00e5tkomst till din rehabilitering direkt fr\u00e5n hemsk\u00e4rmen.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                Installera
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-lg transition-colors"
              >
                Inte nu
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="St\u00e4ng"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
