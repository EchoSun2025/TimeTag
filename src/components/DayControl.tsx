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
  const totalHours = 12;
  const totalMinutes = 15;
  const tagBreakdown = {
    Work: { hours: 6, minutes: 30 },
    Study: { hours: 3, minutes: 15 },
    Break: { hours: 2, minutes: 30 },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Date navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrevDay}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
        >
          &lt;
        </button>
        
        <div className="text-2xl font-mono">
          {formatDate(currentDate)}
        </div>
        
        <button
          onClick={handleNextDay}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
        >
          &gt;
        </button>
        
        <button
          onClick={handleToday}
          className="px-4 py-2 text-base border border-gray-300 rounded hover:bg-gray-100"
        >
          Today
        </button>
      </div>

      {/* Total hours card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 min-w-[200px]">
        <div className="text-sm text-gray-600 text-center mb-2">Total Hours</div>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-semibold">{totalHours}h {totalMinutes}m</span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-lg"
          >
            {showDetails ? '-' : '+'}
          </button>
        </div>
      </div>

      {/* Tag breakdown (expandable to the right) */}
      {showDetails && (
        <div className="absolute top-20 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg text-base min-w-[180px]">
          {Object.entries(tagBreakdown).map(([tag, time]) => (
            <div key={tag} className="flex justify-between gap-6 mb-2">
              <span className="text-gray-600">{tag}:</span>
              <span className="font-mono">{time.hours}h {time.minutes}m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DayControl;
