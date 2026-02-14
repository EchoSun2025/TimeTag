import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { initializeDatabase } from '@/lib/db';
import Timeline from '@/components/Timeline';
import DayControl from '@/components/DayControl';
import TagsSection from '@/components/TagsSection';
import WeekOverview from '@/components/WeekOverview';

function App() {
  const { loadSettings, toggleRecording } = useAppStore();

  useEffect(() => {
    // Initialize database and load settings
    const init = async () => {
      await initializeDatabase();
      await loadSettings();
    };
    init();

    // Register keyboard shortcut listener
    if (window.electronAPI) {
      window.electronAPI.onToggleRecording(() => {
        toggleRecording();
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('shortcut:toggle-recording');
      }
    };
  }, [loadSettings, toggleRecording]);

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      {/* Left side - Timeline (1/3) */}
      <div className="w-1/3 border-r border-gray-200">
        <Timeline />
      </div>

      {/* Right side (2/3) */}
      <div className="flex-1 flex flex-col">
        {/* Top section - Day Control (1/5 of right side) */}
        <div className="h-[20%] border-b border-gray-200 p-4">
          <DayControl />
        </div>

        {/* Middle section - Tags (1/5 of right side) */}
        <div className="h-[20%] border-b border-gray-200 p-4">
          <TagsSection />
        </div>

        {/* Bottom section - Week Overview (3/5 of right side) */}
        <div className="flex-1 p-4 overflow-auto">
          <WeekOverview />
        </div>
      </div>
    </div>
  );
}

export default App;
