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
      <div className="flex items-center gap-8 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevWeek}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
          >
            &lt;
          </button>
          
          <div className="text-xl font-bold font-sans">
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

        {/* Week total card with tag breakdown */}
        <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-lg p-4 flex items-center gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Week Total</div>
            <div className="text-3xl font-semibold">{weekTotalHours}h {weekTotalMinutes}m</div>
          </div>
          
          {/* Tag breakdown inline - mock data */}
          <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />
              <span className="font-mono text-base">28h 15m</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-500" />
              <span className="font-mono text-base">12h 30m</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-yellow-500" />
              <span className="font-mono text-base">4h 45m</span>
            </div>
          </div>
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
              <div className="text-base font-bold mb-1">
                {day.startTime}
              </div>

              {/* Breaks */}
              {day.breaks.map((brk, i) => (
                <div key={i} className="text-base font-bold text-gray-600 mb-1">
                  break {brk.start}-{brk.end}
                </div>
              ))}

              {/* End time */}
              <div className="text-base font-bold mb-3">
                {day.endTime}
              </div>

              {/* Tag breakdown with colored dots */}
              <div className="space-y-1 mb-3">
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
              <div className="text-xs border-t border-gray-200 pt-1">
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
