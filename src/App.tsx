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
        {/* Top section - Day Control (auto height based on content) */}
        <div className="border-b border-gray-200 py-6 px-8">
          <DayControl />
        </div>

        {/* Middle section - Tags (reduced height, just fit content) */}
        <div className="border-b border-gray-200 px-8 py-4">
          <TagsSection />
        </div>

        {/* Bottom section - Week Overview (remaining space) */}
        <div className="flex-1 px-8 py-6 overflow-auto">
          <WeekOverview />
        </div>
      </div>
    </div>
  );
}

export default App;
