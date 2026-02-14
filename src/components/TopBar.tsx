import React, { useState } from 'react';
import { db } from '@/lib/db';
import { roundTime } from '@/lib/utils';

function TopBar() {
  const [isRounding, setIsRounding] = useState(false);

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

  return (
    <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Title */}
      <h1 className="text-2xl font-semibold">TimeTag</h1>

      {/* Actions */}
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
          className="px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100"
          title="Settings"
        >
          Settings
        </button>
      </div>
    </div>
  );
}

export default TopBar;
