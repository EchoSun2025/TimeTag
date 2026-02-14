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
  const tagBreakdown = [
    { name: 'Work', color: '#4285F4', hours: 6, minutes: 30 },
    { name: 'Study', color: '#34A853', hours: 3, minutes: 15 },
    { name: 'Break', color: '#FBBC04', hours: 2, minutes: 30 },
  ];

  return (
    <div className="flex items-center gap-4 h-full">
      {/* Date navigation with background card */}
      <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-lg px-6 py-4 flex items-center gap-4">
        <button
          onClick={handlePrevDay}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
        >
          &lt;
        </button>
        
        <div className="text-xl font-sans">
          {formatDate(currentDate)}
        </div>
        
        <button
          onClick={handleNextDay}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
        >
          &gt;
        </button>
      </div>

      {/* Today button - outside with deeper yellow background */}
      <button
        onClick={handleToday}
        className="px-6 py-2.5 text-base bg-yellow-100 border border-yellow-300 rounded-full hover:bg-yellow-200 transition-colors"
      >
        Today
      </button>

      {/* Total hours card with tag breakdown */}
      <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-lg p-4 flex items-center gap-6">
        <div>
          <div className="text-sm text-gray-600 mb-1">Total Hours</div>
          <div className="text-3xl font-semibold">{totalHours}h {totalMinutes}m</div>
        </div>
        
        {/* Tag breakdown inline */}
        <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
          {tagBreakdown.map((tag) => (
            <div key={tag.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-mono text-base">{tag.hours}h {tag.minutes}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DayControl;
