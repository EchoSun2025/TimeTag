import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { roundTime } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import SettingsPage from './SettingsPage';

function TopBar() {
  const [isRounding, setIsRounding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { activeRecord, stopRecording, startRecording, currentDate } = useAppStore();
  
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
      // Apply rounding to all records
      const allRecords = await db.records.toArray();
      
      for (const record of allRecords) {
        const roundedStart = roundTime(new Date(record.startTime), 15);
        const roundedEnd = roundTime(new Date(record.endTime), 15);
        
        await db.records.update(record.id, {
          startTime: roundedStart,
          endTime: roundedEnd,
          updatedAt: new Date(),
        });
      }
    }

    // Update settings
    await db.settings.update(1, { timeRounding: newState });
  };

  const handleContinue = () => {
    if (latestRecord) {
      startRecording(latestRecord.description, latestRecord.tags);
    }
  };

  return (
    <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Left: Title */}
      <h1 className="text-2xl font-semibold">TimeTag</h1>

      {/* Center: Current/Last Record Display */}
      {displayRecord && (
        <div className="flex-1 mx-8 flex items-center justify-center">
          <div className="bg-green-50 rounded-lg px-6 py-2 flex items-center gap-4 shadow-sm">
            {/* Description and Tag */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-800">
                {displayRecord.description || 'No description'}
              </div>
              {tag && (
                <div 
                  className="inline-block text-xs px-2 py-0.5 rounded text-white mt-1"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </div>
              )}
            </div>

            {/* Action Button */}
            {activeRecord ? (
              // Stop button (square) for active recording
              <button
                onClick={stopRecording}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center transition-colors shadow"
                title="Stop recording (Alt+X)"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                  <rect width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : (
              // Continue button (triangle) for completed record
              <button
                onClick={handleContinue}
                className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow"
                title="Continue this activity"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                  <path d="M3 2 L3 10 L10 6 Z" />
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
              ? 'bg-yellow-100 border-yellow-300 text-gray-900'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          15min Round {isRounding ? 'ON' : 'OFF'}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100"
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
