import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import { formatWeekRange, getWeekDays } from '@/lib/utils';
import { calculateDayStats, getDayTimeRange, formatMinutesToHM } from '@/lib/stats';
import { format, startOfWeek, endOfWeek } from 'date-fns';

function WeekOverview() {
  const { currentDate, showWeekExpanded, setShowWeekExpanded } = useAppStore();
  const [weekDaysCount, setWeekDaysCount] = useState<5 | 7>(5);

  const weekDays = getWeekDays(currentDate, weekDaysCount);

  // Fetch records for the week
  const weekRecords = useLiveQuery(async () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    start.setHours(0, 0, 0, 0);
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    end.setHours(23, 59, 59, 999);

    return await db.records
      .where('startTime')
      .between(start, end, true, true)
      .toArray();
  }, [currentDate]);

  // Fetch tags
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  // Calculate week stats
  const weekStats = React.useMemo(() => {
    if (!weekRecords || !tags) return null;

    const dayStats = weekDays.map(day => {
      const dayRecords = weekRecords.filter(r => {
        const recordDate = new Date(r.startTime);
        return recordDate.toDateString() === day.toDateString();
      });
      return calculateDayStats(dayRecords, tags, day);
    });

    // Calculate week total
    const weekTotalMinutes = dayStats.reduce((sum, day) => sum + day.totalMinutes, 0);

    // Calculate tag totals for week
    const weekTagMinutes: Record<string, number> = {};
    dayStats.forEach(day => {
      Object.entries(day.tagMinutes).forEach(([tagId, minutes]) => {
        weekTagMinutes[tagId] = (weekTagMinutes[tagId] || 0) + minutes;
      });
    });

    return {
      totalMinutes: weekTotalMinutes,
      tagMinutes: weekTagMinutes,
      days: dayStats,
    };
  }, [weekRecords, tags, weekDays]);

  const toggleWeekDays = () => {
    setWeekDaysCount(weekDaysCount === 5 ? 7 : 5);
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    useAppStore.getState().setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    useAppStore.getState().setCurrentDate(next);
  };

  if (!weekStats || !tags) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const weekTotalTime = formatMinutesToHM(weekStats.totalMinutes);
  
  // Get week tag breakdown
  const weekTagBreakdown = Object.entries(weekStats.tagMinutes)
    .map(([tagId, minutes]) => {
      const tag = tags.find(t => t.id === tagId);
      if (!tag) return null;
      const time = formatMinutesToHM(minutes);
      return { name: tag.name, color: tag.color, ...time };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a || !b) return 0;
      const aTotal = a.hours * 60 + a.minutes;
      const bTotal = b.hours * 60 + b.minutes;
      return bTotal - aTotal;
    }) as Array<{ name: string; color: string; hours: number; minutes: number }>;

  return (
    <div className="flex flex-col h-full">
      {/* Week navigation */}
      <div className="flex items-center gap-4 mb-6">
        {/* Week date navigation with background card */}
        <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-lg px-6 py-4 flex items-center gap-4">
          <button
            onClick={handlePrevWeek}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
          >
            &lt;
          </button>
          
          <div className="text-xl font-sans">
            {formatWeekRange(currentDate)}
          </div>
          
          <button
            onClick={handleNextWeek}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
          >
            &gt;
          </button>
        </div>

        {/* Combined 5/7 Days and Expand button - outside with lighter yellow background */}
        <div className="flex bg-yellow-50/50 border border-yellow-200 rounded-full overflow-hidden divide-x divide-yellow-200">
          <button
            onClick={toggleWeekDays}
            className="px-6 py-2.5 text-base hover:bg-yellow-100 transition-colors"
          >
            {weekDaysCount} Days
          </button>
          <button
            onClick={() => setShowWeekExpanded(!showWeekExpanded)}
            className="px-6 py-2.5 text-base hover:bg-yellow-100 transition-colors"
          >
            {showWeekExpanded ? 'Mini Timeline' : 'Expand'}
          </button>
        </div>

        {/* Week total card with tag breakdown */}
        <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-lg p-4 flex items-center gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Week Total</div>
            <div className="text-3xl font-semibold">{weekTotalTime.hours}h {weekTotalTime.minutes}m</div>
          </div>
          
          {/* Tag breakdown inline */}
          {weekTagBreakdown.length > 0 && (
            <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
              {weekTagBreakdown.slice(0, 5).map((tag) => (
                <div key={tag.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-mono text-base">{tag.hours}h {tag.minutes}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day columns */}
      <div className="flex-1 overflow-auto">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${weekDaysCount}, 1fr)` }}>
          {weekStats.days.map((dayStats, index) => {
            const day = weekDays[index];
            const timeRange = getDayTimeRange(dayStats.records);
            const dayTotal = formatMinutesToHM(dayStats.totalMinutes);

            // Get tag breakdown for this day
            const dayTagBreakdown = Object.entries(dayStats.tagMinutes)
              .map(([tagId, minutes]) => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                const time = formatMinutesToHM(minutes);
                return { color: tag.color, ...time };
              })
              .filter(Boolean) as Array<{ color: string; hours: number; minutes: number }>;

            return (
              <div key={index} className="border border-gray-200 rounded p-3 text-sm">
                {/* Day header */}
                <div className="font-semibold mb-2 text-center">
                  {format(day, 'EEE')} {format(day, 'MM/dd')}
                </div>

                {dayStats.records.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">No records</div>
                ) : (
                  <>
                    {/* Start time */}
                    {timeRange.start && (
                      <div className="text-base mb-1">
                        {format(timeRange.start, 'h:mma').toLowerCase()}
                      </div>
                    )}

                    {/* Breaks */}
                    {dayStats.breaks.map((brk, i) => (
                      <div key={i} className="text-base text-gray-600 mb-1">
                        break {format(brk.startTime, 'h:mma').toLowerCase()}-{format(brk.endTime, 'h:mma').toLowerCase()}
                      </div>
                    ))}

                    {/* End time */}
                    {timeRange.end && (
                      <div className="text-base mb-3">
                        {format(timeRange.end, 'h:mma').toLowerCase()}
                      </div>
                    )}

                    {/* Tag breakdown with colored dots */}
                    <div className="space-y-1 mb-3">
                      {dayTagBreakdown.map((tag, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
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
                      Total: {dayTotal.hours}h {dayTotal.minutes}m
                    </div>
                  </>
                )}
              </div>
            );
          })}
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
