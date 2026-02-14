import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { formatDate } from '@/lib/utils';

function DayControl() {
  const { currentDate, setCurrentDate } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Mock data - will be replaced with real calculations
  const totalHours = 12.25;
  const tagBreakdown = {
    Work: 6.5,
    Study: 3.25,
    Break: 2.5,
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Date navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handlePrevDay}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          &lt;
        </button>
        
        <div className="text-lg font-mono">
          {formatDate(currentDate)}
        </div>
        
        <button
          onClick={handleNextDay}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          &gt;
        </button>
        
        <button
          onClick={handleToday}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          Today
        </button>
      </div>

      {/* Total hours */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Total Hours:</span>
        <span className="text-xl font-semibold">{totalHours}h</span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
        >
          {showDetails ? '-' : '+'}
        </button>
      </div>

      {/* Tag breakdown (expandable) */}
      {showDetails && (
        <div className="mt-3 text-sm space-y-1">
          {Object.entries(tagBreakdown).map(([tag, hours]) => (
            <div key={tag} className="flex justify-between gap-4">
              <span className="text-gray-600">{tag}:</span>
              <span className="font-mono">{hours}h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DayControl;
