import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function MiniWindow() {
  const { activeRecord, stopRecording } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  // Debug logging only once on mount
  useEffect(() => {
    console.log('🎨 MiniWindow mounted:', {
      hasActiveRecord: !!activeRecord,
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      htmlBg: window.getComputedStyle(document.documentElement).backgroundColor,
      rootDiv: document.getElementById('root')
    });
  }, []); // Empty deps - only run once

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
        className="w-full h-full flex items-center justify-center text-white shadow-2xl"
        style={{ 
          WebkitAppRegion: 'drag',
          backgroundColor: '#1a1a24',
          borderRadius: '12px',
          border: '1px solid #2a4a70'
        } as any}
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
      className="w-full h-full flex items-center text-white shadow-2xl px-2 gap-2"
      style={{ 
        WebkitAppRegion: 'drag', 
        paddingTop: '4px', 
        paddingBottom: '4px',
        backgroundColor: '#1a1a24',
        borderRadius: '12px',
        border: '1px solid #2a4a70'
      } as any}
    >
      {/* Timer - smaller size, teal color */}
      <div 
        className="font-mono font-black tracking-wide leading-none flex-shrink-0"
        style={{ fontSize: '1.1rem', color: '#2DD4BF' }}
      >
        {timeStr}
      </div>

      {/* Description + Tag - stacked vertically, tight to timer */}
      <div className="flex flex-col justify-center min-w-0 gap-0">
        <div 
          className="font-medium truncate opacity-90 leading-tight"
          style={{ fontSize: '0.7rem' }}
          title={activeRecord.description}
        >
          {activeRecord.description || 'No description'}
        </div>
        <div 
          className="self-start px-1.5 py-0.5 rounded-full text-white leading-tight"
          style={{ backgroundColor: tagColor, fontSize: '0.5rem' }}
        >
          {tagName}
        </div>
      </div>

      {/* Stop button - smaller */}
      <button
        onClick={stopRecording}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex-shrink-0 ml-auto bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors shadow-lg"
        style={{ WebkitAppRegion: 'no-drag', width: '18px', height: '18px' } as any}
        title="Stop recording (Alt+X)"
      >
        <svg width="7" height="7" viewBox="0 0 7 7" fill="currentColor">
          <rect width="7" height="7" rx="1" />
        </svg>
      </button>
    </div>
  );
}

export default MiniWindow;
