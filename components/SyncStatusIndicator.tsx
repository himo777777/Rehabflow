/**
 * Sync Status Indicator Component
 * Shows offline/sync status in the UI
 */

import React from 'react';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  className = '',
}) => {
  const {
    status,
    pendingCount,
    isOnline,
    isSyncing,
    hasUnsyncedData,
    triggerSync,
  } = useOfflineSync();

  // Get icon and color based on status
  const getStatusDisplay = () => {
    if (!isOnline) {
      return {
        icon: <CloudOff size={16} />,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        label: 'Offline',
        description: 'Data sparas lokalt',
      };
    }

    switch (status) {
      case 'syncing':
        return {
          icon: <Loader2 size={16} className="animate-spin" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          label: 'Synkar...',
          description: `Synkar ${pendingCount} objekt`,
        };
      case 'pending':
        return {
          icon: <RefreshCw size={16} />,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          label: 'Väntar',
          description: `${pendingCount} objekt att synka`,
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          label: 'Fel',
          description: 'Sync misslyckades',
        };
      case 'synced':
      default:
        return {
          icon: <CheckCircle size={16} />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          label: 'Synkad',
          description: 'Allt är uppdaterat',
        };
    }
  };

  const { icon, color, bgColor, label, description } = getStatusDisplay();

  // Compact view (just icon)
  if (!showDetails) {
    return (
      <button
        onClick={hasUnsyncedData && isOnline ? triggerSync : undefined}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-full
          ${bgColor} ${color}
          ${hasUnsyncedData && isOnline ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          transition-colors
          ${className}
        `}
        title={`${label}: ${description}`}
        aria-label={`Sync status: ${label}. ${description}`}
        disabled={!hasUnsyncedData || !isOnline}
      >
        {icon}
        {pendingCount > 0 && (
          <span className="text-xs font-medium">{pendingCount}</span>
        )}
      </button>
    );
  }

  // Detailed view
  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2 rounded-xl
        ${bgColor} ${color}
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs opacity-70">{description}</span>
        </div>
      </div>

      {hasUnsyncedData && isOnline && !isSyncing && (
        <button
          onClick={triggerSync}
          className="ml-auto px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Synka nu"
        >
          Synka nu
        </button>
      )}
    </div>
  );
};

/**
 * Offline Banner - shows at top of screen when offline
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline, pendingCount } = useOfflineSync();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium"
      role="alert"
      aria-live="assertive"
    >
      <CloudOff size={16} />
      <span>
        Du är offline. {pendingCount > 0 ? `${pendingCount} ändringar väntar på att synkas.` : 'Ändringar sparas lokalt.'}
      </span>
    </div>
  );
};

/**
 * Sync Notification - shows when sync completes
 */
export const SyncNotification: React.FC<{
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ visible, message, type, onClose }) => {
  if (!visible) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
        animate-in slide-in-from-bottom-4 fade-in duration-300
      `}
      role="alert"
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Stäng"
      >
        ×
      </button>
    </div>
  );
};

export default SyncStatusIndicator;
