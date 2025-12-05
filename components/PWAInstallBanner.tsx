/**
 * PWA Install Banner
 *
 * Visar en anpassad installationsbanner för PWA.
 * Features:
 * - Döljs automatiskt om redan installerad
 * - Sparar dismiss-status
 * - Native install prompt
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  isInstalledPWA,
  setupInstallPrompt,
  promptInstall,
  canInstall,
  registerServiceWorker
} from '../src/registerSW';
import { logger } from '../utils/logger';

interface PWAInstallBannerProps {
  /** Force show even if dismissed */
  forceShow?: boolean;
  /** Callback when installed */
  onInstalled?: () => void;
}

type PWAStatus = 'idle' | 'canInstall' | 'installed' | 'offline' | 'updateAvailable';

const DISMISS_KEY = 'rehabflow_pwa_banner_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  forceShow = false,
  onInstalled
}) => {
  const [status, setStatus] = useState<PWAStatus>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isInstalledPWA()) {
      setStatus('installed');
      return;
    }

    // Check dismiss status
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && !forceShow) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        setIsDismissed(true);
      }
    }

    // Setup install prompt
    setupInstallPrompt(
      () => setStatus('canInstall'),
      () => {
        setStatus('installed');
        onInstalled?.();
      }
    );

    // Register service worker with callbacks
    registerServiceWorker({
      onSuccess: () => {
        logger.debug('PWA ready for offline use');
      },
      onUpdate: () => {
        setUpdateAvailable(true);
        setStatus('updateAvailable');
      },
      onOffline: () => {
        setIsOnline(false);
        setStatus('offline');
      },
      onOnline: () => {
        setIsOnline(true);
        if (canInstall()) {
          setStatus('canInstall');
        }
      }
    });

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forceShow, onInstalled]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await promptInstall();
      if (installed) {
        setStatus('installed');
        onInstalled?.();
      }
    } catch (err) {
      console.error('Install failed:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  const handleUpdate = () => {
    window.location.reload();
  };

  // Don't show if installed or dismissed
  if (status === 'installed' && !updateAvailable) return null;
  if (isDismissed && !forceShow && status !== 'updateAvailable') return null;

  // Update available banner
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-blue-600 rounded-2xl p-4 shadow-xl max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Ny version tillgänglig</h3>
              <p className="text-white/80 text-sm mt-1">
                Uppdatera för att få de senaste funktionerna
              </p>
            </div>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="p-1 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <button
            onClick={handleUpdate}
            className="w-full mt-3 py-2 bg-white text-blue-600 font-medium rounded-xl hover:bg-white/90 transition-colors"
          >
            Uppdatera nu
          </button>
        </div>
      </div>
    );
  }

  // Offline banner
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-amber-500 rounded-2xl p-4 shadow-xl max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <WifiOff className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Offline-läge</h3>
              <p className="text-white/80 text-sm">
                Du är offline. Vissa funktioner kan vara begränsade.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Install banner
  if (status === 'canInstall') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-4 shadow-xl max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Installera RehabFlow</h3>
              <p className="text-white/80 text-sm mt-1">
                Få snabbare åtkomst och offline-funktionalitet
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 text-white/60 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 bg-white/20 text-white rounded-xl text-sm hover:bg-white/30 transition-colors"
            >
              Inte nu
            </button>
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 py-2 bg-white text-cyan-600 font-medium rounded-xl text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                  Installerar...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Installera
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallBanner;

/**
 * PWA Status Indicator - Compact version for header/nav
 */
export const PWAStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isInstalledPWA());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
        <WifiOff size={12} />
        <span>Offline</span>
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
        <CheckCircle2 size={12} />
        <span>App</span>
      </div>
    );
  }

  return null;
};
