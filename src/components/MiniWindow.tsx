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
      const seconds = Math.floor(diff / 1000);
      setElapsed(seconds);
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
      className="w-full h-full flex items-center bg-gray-900/95 text-white rounded-lg shadow-2xl backdrop-blur-sm px-3 gap-2"
      style={{ WebkitAppRegion: 'drag', paddingTop: '7px', paddingBottom: '7px' } as any}
    >
      {/* Timer - 0.7x size, teal color */}
      <div 
        className="font-mono font-black tracking-wide leading-none flex-shrink-0"
        style={{ fontSize: '1.3rem', color: '#2DD4BF' }}
      >
        {timeStr}
      </div>

      {/* Description + Tag - stacked vertically, tight to timer */}
      <div className="flex flex-col justify-center min-w-0 gap-0.5">
        <div 
          className="font-medium truncate opacity-90 leading-tight"
          style={{ fontSize: '0.82rem' }}
          title={activeRecord.description}
        >
          {activeRecord.description || 'No description'}
        </div>
        <div 
          className="self-start px-1.5 py-0.5 rounded-full text-white leading-tight"
          style={{ backgroundColor: tagColor, fontSize: '0.563rem' }}
        >
          {tagName}
        </div>
      </div>

      {/* Stop button - 0.75x size */}
      <button
        onClick={stopRecording}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex-shrink-0 ml-auto bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors shadow-lg"
        style={{ WebkitAppRegion: 'no-drag', width: '21px', height: '21px' } as any}
        title="Stop recording (Alt+X)"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
          <rect width="8" height="8" rx="1" />
        </svg>
      </button>
    </div>
  );
}

export default MiniWindow;
