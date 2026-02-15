import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { initializeDatabase } from '@/lib/db';
import Timeline from '@/components/Timeline';
import DayControl from '@/components/DayControl';
import TagsSection from '@/components/TagsSection';
import WeekOverview from '@/components/WeekOverview';
import TopBar from '@/components/TopBar';
import MiniWindow from '@/components/MiniWindow';
import RecordModal from '@/components/RecordModal';

function App() {
  const { loadSettings, startRecording, stopRecording, activeRecord, isMiniMode, setMiniMode } = useAppStore();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  // Check if we're in mini mode from URL hash
  const urlIsMiniMode = window.location.hash === '#/mini';

  useEffect(() => {
    // Initialize database and load settings
    const init = async () => {
      await initializeDatabase();
      await loadSettings();
    };
    init();

    // Register keyboard shortcuts
    if (window.electronAPI) {
      // Alt+X: Stop recording if active, otherwise open new record modal
      window.electronAPI.onToggleRecording(() => {
        if (activeRecord) {
          stopRecording();
        } else {
          setIsRecordModalOpen(true);
        }
      });

      // Alt+A: Toggle between full view and mini view
      window.electronAPI.onToggleView(() => {
        if (activeRecord) {
          // If recording, toggle between views without stopping
          if (isMiniMode) {
            setMiniMode(false);
            window.electronAPI.restoreFromMini();
          } else {
            setMiniMode(true);
            window.electronAPI.minimizeToMini();
          }
        }
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('shortcut:toggle-recording');
        window.electronAPI.removeAllListeners('shortcut:toggle-view');
      }
    };
  }, [loadSettings, activeRecord, stopRecording, isMiniMode, setMiniMode]);

  // Render mini window if in mini mode
  if (urlIsMiniMode || isMiniMode) {
    return <MiniWindow />;
  }

  const handleStartRecording = (description: string, tags: string[]) => {
    startRecording(description, tags);
    setIsRecordModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black overflow-hidden">
      {/* Top bar with title and actions */}
      <TopBar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
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

      {/* New Record Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onStartRecording={handleStartRecording}
      />
    </div>
  );
}

export default App;
