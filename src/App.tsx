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
  const { loadSettings, currentDate } = useAppStore();
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState(false);
  const [quickRecordStart, setQuickRecordStart] = useState<Date | undefined>();
  
  // Check if we're in mini mode from URL hash
  const isMiniMode = window.location.hash === '#/mini';

  useEffect(() => {
    // Initialize database and load settings
    const init = async () => {
      await initializeDatabase();
      await loadSettings();
    };
    init();

    // Register Alt+X shortcut listener
    if (window.electronAPI) {
      window.electronAPI.onToggleRecording(() => {
        if (!isQuickRecordOpen) {
          // Open modal with current time as start
          const now = new Date();
          setQuickRecordStart(now);
          setIsQuickRecordOpen(true);
        } else {
          // Close modal
          setIsQuickRecordOpen(false);
        }
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('shortcut:toggle-recording');
      }
    };
  }, [loadSettings, isQuickRecordOpen]);

  // Render mini window if in mini mode
  if (isMiniMode) {
    return <MiniWindow />;
  }

  // Calculate end time for quick record (1 hour from start)
  const quickRecordEnd = quickRecordStart ? new Date(quickRecordStart.getTime() + 60 * 60 * 1000) : undefined;

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

      {/* Quick Record Modal (Alt+X) */}
      <RecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => {
          setIsQuickRecordOpen(false);
          setQuickRecordStart(undefined);
        }}
        initialStartTime={quickRecordStart}
        initialEndTime={quickRecordEnd}
      />
    </div>
  );
}

export default App;
