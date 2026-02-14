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
  const weekTotalHours = 45;
  const weekTotalMinutes = 30;
  const dayData = weekDays.map((day) => ({
    date: day,
    startTime: '9:00am',
    endTime: '6:30pm',
    breaks: [{ start: '11:30am', end: '12:00pm' }],
    tags: [
      { name: 'Work', color: '#4285F4', hours: 6, minutes: 30 },
      { name: 'Study', color: '#34A853', hours: 2, minutes: 15 },
    ],
    totalHours: 8,
    totalMinutes: 45,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={handlePrevWeek}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
        >
          &lt;
        </button>
        
        <div className="text-xl font-mono">
          {formatWeekRange(currentDate)}
        </div>
        
        <button
          onClick={handleNextWeek}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
        >
          &gt;
        </button>

        <button
          onClick={toggleWeekDays}
          className="px-4 py-2 text-base border border-gray-300 rounded hover:bg-gray-100"
        >
          {weekDaysCount} Days
        </button>
      </div>

      {/* Week total card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 inline-block">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Week Total</div>
            <div className="text-3xl font-semibold">{weekTotalHours}h {weekTotalMinutes}m</div>
          </div>
          <button
            onClick={() => setShowWeekExpanded(!showWeekExpanded)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 text-lg"
          >
            {showWeekExpanded ? '-' : '+'}
          </button>
        </div>
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

              {/* Tag breakdown with colored dots */}
              <div className="space-y-1 mb-2">
                {day.tags.map((tag) => (
                  <div key={tag.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-mono">{tag.hours}h {tag.minutes}m</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="text-sm font-semibold border-t border-gray-200 pt-1">
                Total: {day.totalHours}h {day.totalMinutes}m
              </div>
            </div>
          ))}
        </div>

        {/* Expanded view (mini timelines) */}
        {showWeekExpanded && (
          <div className="mt-4 text-center text-gray-500 text-base">
            Expanded timeline view coming soon...
          </div>
        )}
      </div>
    </div>
  );
}

export default WeekOverview;
