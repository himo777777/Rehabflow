import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../hooks';

/**
 * Shows a banner when the user is offline or just reconnected
 */
const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();

  // Don't show anything if always been online
  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[200] transition-all duration-500 ${
        !isOnline
          ? 'translate-y-0'
          : wasOffline
            ? 'translate-y-0'
            : '-translate-y-full'
      }`}
    >
      <div
        className={`px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 ${
          !isOnline
            ? 'bg-amber-500 text-amber-950'
            : 'bg-green-500 text-green-950'
        }`}
      >
        {!isOnline ? (
          <>
            <WifiOff size={16} />
            <span>Du är offline. Dina framsteg sparas lokalt.</span>
          </>
        ) : (
          <>
            <Wifi size={16} />
            <span>Ansluten igen! Synkroniserar...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
