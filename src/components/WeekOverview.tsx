import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { formatWeekRange, getWeekDays, formatDuration } from '@/lib/utils';
import { format } from 'date-fns';

function WeekOverview() {
  const { currentDate, settings, showWeekExpanded, setShowWeekExpanded } = useAppStore();
  const [weekDaysCount, setWeekDaysCount] = useState<5 | 7>(5);

  const weekDays = getWeekDays(currentDate, weekDaysCount);

  const toggleWeekDays = () => {
    setWeekDaysCount(weekDaysCount === 5 ? 7 : 5);
  };

  const handlePrevWeek = () => {
    // Implementation
  };

  const handleNextWeek = () => {
    // Implementation
  };

  // Mock data - will be replaced with real calculations
  const weekTotal = 45.5;
  const dayData = weekDays.map((day) => ({
    date: day,
    startTime: '9:00am',
    endTime: '6:30pm',
    breaks: [{ start: '11:30am', end: '12:00pm' }],
    tags: {
      Work: 6.5,
      Study: 2.25,
    },
    total: 8.75,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={handlePrevWeek}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          &lt;
        </button>
        
        <div className="text-base font-mono">
          {formatWeekRange(currentDate)}
        </div>
        
        <button
          onClick={handleNextWeek}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          &gt;
        </button>

        <button
          onClick={toggleWeekDays}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          {weekDaysCount} Days
        </button>
      </div>

      {/* Week total */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-600">Week Total: </span>
        <span className="text-lg font-semibold">{formatDuration(weekTotal * 60)}</span>
      </div>

      {/* Day columns */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${weekDaysCount}, 1fr)` }}>
          {dayData.map((day, index) => (
            <div key={index} className="border border-gray-200 rounded p-3 text-sm">
              {/* Day header */}
              <div className="font-semibold mb-2 text-center">
                {format(day.date, 'EEE')} {format(day.date, 'MM/dd')}
              </div>

              {/* Start time */}
              <div className="text-gray-600 text-xs mb-1">
                {day.startTime}
              </div>

              {/* Breaks */}
              {day.breaks.map((brk, i) => (
                <div key={i} className="text-xs text-gray-500 mb-1">
                  break {brk.start}-{brk.end}
                </div>
              ))}

              {/* End time */}
              <div className="text-gray-600 text-xs mb-2">
                {day.endTime}
              </div>

              {/* Tag breakdown */}
              <div className="space-y-1 mb-2">
                {Object.entries(day.tags).map(([tag, hours]) => (
                  <div key={tag} className="text-xs">
                    {tag}: {formatDuration(hours * 60)}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="text-xs font-semibold border-t border-gray-200 pt-1">
                Total: {formatDuration(day.total * 60)}
              </div>
            </div>
          ))}
        </div>

        {/* Expand button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowWeekExpanded(!showWeekExpanded)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            {showWeekExpanded ? 'Collapse' : 'Expand'} Details
          </button>
        </div>

        {/* Expanded view (mini timelines) */}
        {showWeekExpanded && (
          <div className="mt-4 text-center text-gray-500">
            Expanded timeline view coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

export default WeekOverview;
