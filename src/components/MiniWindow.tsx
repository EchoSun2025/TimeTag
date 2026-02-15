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
    if (!activeRecord) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - activeRecord.startTime.getTime();
      setElapsed(Math.floor(diff / 1000)); // seconds
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  if (!activeRecord) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/80 text-white rounded-lg">
        <div className="text-center">
          <div className="text-sm opacity-70">No active recording</div>
        </div>
      </div>
    );
  }

  // Format elapsed time as HH:MM:SS
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Get tag color
  const tag = tags?.find(t => t.id === activeRecord.tags[0]);
  const tagColor = tag?.color || '#4285F4';
  const tagName = tag?.name || 'No Tag';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 text-white rounded-lg px-4 py-3 relative">
      {/* Timer - Large */}
      <div 
        className="text-3xl font-mono font-bold tracking-wider mb-1"
        style={{ color: tagColor }}
      >
        {timeStr}
      </div>

      {/* Description */}
      <div className="text-sm font-medium text-center truncate w-full mb-1">
        {activeRecord.description}
      </div>

      {/* Tag */}
      <div 
        className="text-xs px-2 py-0.5 rounded text-white mb-2"
        style={{ backgroundColor: tagColor }}
      >
        {tagName}
      </div>

      {/* Stop button */}
      <button
        onClick={stopRecording}
        className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors shadow-lg"
        title="Stop recording (Alt+X)"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect width="12" height="12" rx="1" />
        </svg>
      </button>

      {/* Hint */}
      <div className="text-[10px] opacity-50 mt-1">
        Alt+X to stop
      </div>
    </div>
  );
}

export default MiniWindow;
