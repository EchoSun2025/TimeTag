import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { formatDuration } from '@/lib/utils';

function MiniWindow() {
  const { isQuickRecording, quickRecordStart } = useAppStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isQuickRecording || !quickRecordStart) {
      setElapsed(0);
      return;
    }

    // Update elapsed time every second
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - quickRecordStart.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isQuickRecording, quickRecordStart]);

  const formatElapsed = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="h-full w-full bg-black/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <div className="text-center">
        <div className="text-white text-2xl font-mono mb-2">
          {formatElapsed(elapsed)}
        </div>
        <div className="text-white/70 text-xs">
          Recording... Press Alt+X to stop
        </div>
      </div>
    </div>
  );
}

export default MiniWindow;
