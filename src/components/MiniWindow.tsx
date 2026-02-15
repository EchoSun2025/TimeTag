import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function MiniWindow() {
  const { activeRecord, stopRecording } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  // Update elapsed time every second
  useEffect(() => {
    if (!activeRecord) {
      setElapsed(0);
      return;
    }

    // Initial calculation
    const now = new Date();
    const diff = now.getTime() - activeRecord.startTime.getTime();
    setElapsed(Math.floor(diff / 1000));

    // Update every second
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - activeRecord.startTime.getTime();
      setElapsed(Math.floor(diff / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  if (!activeRecord) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-gray-900/95 text-white rounded-lg shadow-2xl backdrop-blur-sm"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="text-center text-sm opacity-70">
          No active recording
        </div>
      </div>
    );
  }

  // Format elapsed time as HH:MM:SS
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Get tag info
  const tag = tags?.find(t => t.id === activeRecord.tags[0]);
  const tagColor = tag?.color || '#4285F4';
  const tagName = tag?.name || 'No Tag';

  return (
    <div 
      className="w-full h-full flex items-start bg-gray-900/95 text-white rounded-lg shadow-2xl backdrop-blur-sm p-3"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex-1 flex flex-col min-w-0">
        {/* Timer - top */}
        <div 
          className="text-2xl font-mono font-bold tracking-wide leading-none mb-2"
          style={{ color: tagColor }}
        >
          {timeStr}
        </div>

        {/* Description - middle */}
        <div className="text-sm font-medium truncate mb-1" title={activeRecord.description}>
          {activeRecord.description || 'No description'}
        </div>

        {/* Tag - bottom */}
        <div 
          className="inline-block text-xs px-2 py-0.5 rounded text-white self-start"
          style={{ backgroundColor: tagColor }}
        >
          {tagName}
        </div>
      </div>

      {/* Stop button - right side */}
      <button
        onClick={stopRecording}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex-shrink-0 ml-3 w-10 h-10 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors shadow-lg"
        style={{ WebkitAppRegion: 'no-drag' } as any}
        title="Stop recording (Alt+X)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect width="14" height="14" rx="2" />
        </svg>
      </button>
    </div>
  );
}

export default MiniWindow;
