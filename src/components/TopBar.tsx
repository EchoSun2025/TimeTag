import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { roundTimeDown, roundTimeUp } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import SettingsPage from './SettingsPage';

function TopBar() {
  const [isRounding, setIsRounding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { activeRecord, stopRecording, startRecording, currentDate, isDarkMode, setDarkMode, updateSettings } = useAppStore();
  
  // Get today's records to find the most recent one
  const todayRecords = useLiveQuery(async () => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    return await db.records
      .where('startTime')
      .between(dayStart, dayEnd, true, true)
      .toArray();
  }, [currentDate]);

  // Get tags
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  // Find the most recent record (current or last completed)
  const latestRecord = todayRecords && todayRecords.length > 0
    ? [...todayRecords].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )[0]
    : null;

  // Display active record or latest completed record
  const displayRecord = activeRecord || latestRecord;
  const tag = displayRecord && tags?.find(t => t.id === displayRecord.tags[0]);

  const handleToggleRounding = async () => {
    const newState = !isRounding;
    setIsRounding(newState);

    if (newState) {
      // Turning ON: Apply rounding and save original times
      const allRecords = await db.records.toArray();
      console.log('🔄 Enabling 15min round for', allRecords.length, 'records');
      
      for (const record of allRecords) {
        const currentStart = new Date(record.startTime);
        const currentEnd = new Date(record.endTime);
        // Round start DOWN and end UP to ensure no time is lost
        const roundedStart = roundTimeDown(currentStart, 15);
        const roundedEnd = roundTimeUp(currentEnd, 15);
        
        // Only save original times if not already saved
        const updates: any = {
          startTime: roundedStart,
          endTime: roundedEnd,
          updatedAt: new Date(),
        };
        
        // Save original times only if they don't exist yet
        if (!record.originalStartTime || !record.originalEndTime) {
          updates.originalStartTime = currentStart;
          updates.originalEndTime = currentEnd;
          console.log('💾 Saving original times for record:', record.id, {
            original: { start: currentStart, end: currentEnd },
            rounded: { start: roundedStart, end: roundedEnd }
          });
        } else {
          console.log('✓ Original times already saved for record:', record.id);
        }
        
        await db.records.update(record.id, updates);
      }
    } else {
      // Turning OFF: Restore original times and clear them
      const allRecords = await db.records.toArray();
      console.log('🔙 Disabling 15min round, restoring', allRecords.length, 'records');
      
      for (const record of allRecords) {
        // Restore from original times if available
        if (record.originalStartTime && record.originalEndTime) {
          await db.records.update(record.id, {
            startTime: new Date(record.originalStartTime),
            endTime: new Date(record.originalEndTime),
            // Clear original times so they can be re-saved correctly next time
            originalStartTime: null,
            originalEndTime: null,
            updatedAt: new Date(),
          });
          console.log('✅ Restored and cleared original times for record:', record.id, {
            from: { start: record.startTime, end: record.endTime },
            to: { start: record.originalStartTime, end: record.originalEndTime }
          });
        } else {
          console.log('⚠️ No original times found for record:', record.id);
        }
      }
    }

    // Update settings in both database and appStore
    await updateSettings({ timeRounding: newState });
    console.log('⚙️ Updated settings: timeRounding =', newState);
  };

  const handleContinue = () => {
    if (latestRecord) {
      startRecording(latestRecord.description, latestRecord.tags);
    }
  };

  return (
    <div className="px-6 py-3 flex items-center justify-between transition-colors" style={{ 
      borderBottom: `1px solid var(--border-color)`,
      backgroundColor: activeRecord 
        ? (document.documentElement.classList.contains('dark') ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7')
        : (document.documentElement.classList.contains('dark') ? '#1a1a24' : '#f9fafb')
    }}>
      {/* Left: Title */}
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>TimeTag</h1>

      {/* Center: Current/Last Record Display */}
      {displayRecord && (
        <div className="flex-1 mx-8 flex items-center justify-center">
          <div className="flex items-center gap-3">
            {/* Description */}
            <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {displayRecord.description || 'No description'}
            </span>

            {/* Tag - inline next to description */}
            {tag && (
              <span 
                className="text-sm px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            )}

            {/* Action Button */}
            {activeRecord ? (
              // Stop button (square) for active recording
              <button
                onClick={stopRecording}
                className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors shadow-sm ml-1"
                title="Stop recording (Alt+X)"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                  <rect width="10" height="10" rx="1" />
                </svg>
              </button>
            ) : (
              // Continue button (triangle) for completed record
              <button
                onClick={handleContinue}
                className="w-7 h-7 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-sm ml-1"
                title="Continue this activity"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                  <path d="M2.5 1.5 L2.5 8.5 L8.5 5 Z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* 15min Round button */}
        <button
          onClick={handleToggleRounding}
          className={`px-4 py-2 text-sm border rounded-full transition-colors ${
            isRounding
              ? 'bg-yellow-100 border-yellow-300 text-gray-900 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          style={{ 
            borderColor: isRounding ? undefined : 'var(--border-color)',
            color: isRounding ? undefined : 'var(--text-primary)'
          }}
        >
          15min Round {isRounding ? 'ON' : 'OFF'}
        </button>

        {/* Dark mode toggle button */}
        <button
          onClick={() => setDarkMode(!isDarkMode)}
          className="px-4 py-2 text-sm border rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ 
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          title="Toggle dark mode"
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 text-sm border rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ 
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)'
          }}
          title="Settings"
        >
          Settings
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsPage 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default TopBar;
