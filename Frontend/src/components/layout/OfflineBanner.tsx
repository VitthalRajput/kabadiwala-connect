import React from 'react';
import { useOffline } from '../../context/OfflineContext';
import { WifiOff, Save } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, hasOfflineData } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs sticky top-20 z-20">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>
          You are currently <strong>offline</strong>. Any new lots or edits will be stored locally
          and synchronized once your internet connection is restored.
        </span>
        {hasOfflineData && (
          <span className="ml-auto inline-flex items-center gap-1 bg-amber-600 px-2 py-0.5 rounded-full text-xs">
            <Save className="w-3 h-3" /> Draft Saved
          </span>
        )}
      </div>
    </div>
  );
};

