import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import { formatWeekRange, getWeekDays } from '@/lib/utils';
import { calculateDayStats, getDayTimeRange, formatMinutesToHM } from '@/lib/stats';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import MonthView from './MonthView';

type ViewMode = '5days' | '7days' | 'month';

function WeekOverview() {
  const { currentDate, showWeekExpanded, setShowWeekExpanded } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('5days');
  
  const weekDaysCount = viewMode === '5days' ? 5 : viewMode === '7days' ? 7 : 7;

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
    if (viewMode === '5days') {
      setViewMode('7days');
    } else if (viewMode === '7days') {
      setViewMode('month');
    } else {
      setViewMode('5days');
    }
  };

  const jumpToThisWeek = () => {
    useAppStore.getState().setCurrentDate(new Date());
  };

  const handlePrevPeriod = () => {
    const prev = new Date(currentDate);
    if (viewMode === 'month') {
      prev.setMonth(prev.getMonth() - 1);
    } else {
      prev.setDate(prev.getDate() - 7);
    }
    useAppStore.getState().setCurrentDate(prev);
  };

  const handleNextPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    useAppStore.getState().setCurrentDate(next);
  };

  if (!weekStats || !tags) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // If month view, render MonthView component
  if (viewMode === 'month') {
    return (
      <div className="flex flex-col h-full">
        {/* Month navigation */}
        <div className="flex items-center gap-4 mb-6">
          {/* Month date navigation */}
          <div className="rounded-lg px-6 py-4 flex items-center gap-4" style={{
            backgroundColor: 'var(--accent-bg)',
            borderWidth: '1px',
            borderColor: 'var(--accent-border)'
          }}>
            <button
              onClick={handlePrevPeriod}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
            >
              &lt;
            </button>
            
            <div className="text-xl font-sans font-bold">
              {format(currentDate, 'yyyy MMM')}
            </div>
            
            <button
              onClick={handleNextPeriod}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
            >
              &gt;
            </button>
          </div>

          {/* View mode buttons */}
          <div className="flex rounded-full overflow-hidden" style={{
            backgroundColor: 'var(--accent-bg)',
            borderWidth: '1px',
            borderColor: 'var(--accent-border)'
          }}>
            <button
              onClick={jumpToThisWeek}
              className="px-6 py-2.5 text-base transition-colors"
              style={{
                color: 'var(--text-primary)',
                borderRight: `1px solid var(--accent-border)`
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              This Week
            </button>
            <button
              onClick={toggleWeekDays}
              className="px-6 py-2.5 text-base transition-colors"
              style={{
                color: 'var(--text-primary)',
                borderRight: `1px solid var(--accent-border)`
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {viewMode === 'month' ? '5 Days' : 'Month'}
            </button>
          </div>
        </div>

        <MonthView currentDate={currentDate} />
      </div>
    );
  }

  // Week view rendering
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
        <div className="rounded-lg px-6 py-4 flex items-center gap-4" style={{
          backgroundColor: 'var(--accent-bg)',
          borderWidth: '1px',
          borderColor: 'var(--accent-border)'
        }}>
          <button
            onClick={handlePrevPeriod}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
          >
            &lt;
          </button>
          
          <div className="text-xl font-sans font-bold">
            {formatWeekRange(currentDate)}
          </div>
          
          <button
            onClick={handleNextPeriod}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
          >
            &gt;
          </button>
        </div>

        {/* View mode buttons */}
        <div className="flex rounded-full overflow-hidden" style={{
          backgroundColor: 'var(--accent-bg)',
          borderWidth: '1px',
          borderColor: 'var(--accent-border)'
        }}>
          <button
            onClick={jumpToThisWeek}
            className="px-6 py-2.5 text-base transition-colors"
            style={{
              color: 'var(--text-primary)',
              borderRight: `1px solid var(--accent-border)`
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            This Week
          </button>
          <button
            onClick={toggleWeekDays}
            className="px-6 py-2.5 text-base transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {viewMode === '5days' ? '7 Days' : '5 Days'}
          </button>
        </div>

        {/* Week total card with tag breakdown */}
        <div className="rounded-lg p-4 flex items-center gap-6" style={{
          backgroundColor: 'var(--accent-bg)',
          borderWidth: '1px',
          borderColor: 'var(--accent-border)'
        }}>
          <div>
            <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Week Total</div>
            <div className="text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>{weekTotalTime.hours}h {weekTotalTime.minutes}m</div>
          </div>
          
          {/* Tag breakdown inline */}
          {weekTagBreakdown.length > 0 && (
            <div className="flex items-center gap-4 pl-6" style={{ borderLeft: `1px solid var(--border-color)` }}>
              {weekTagBreakdown.slice(0, 5).map((tag) => (
                <div key={tag.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-mono text-base" style={{ color: 'var(--text-primary)' }}>{tag.hours}h {tag.minutes}m</span>
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
              <div key={index} className="border rounded p-3 text-sm" style={{ borderColor: 'var(--border-color)' }}>
                {/* Day header */}
                <div className="font-semibold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
                  {format(day, 'EEE')} {format(day, 'MM/dd')}
                </div>

                {dayStats.records.length === 0 ? (
                  <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No records</div>
                ) : (
                  <>
                    {/* Start time */}
                    {timeRange.start && (
                      <div className="text-base mb-1 font-bold" style={{ color: 'var(--text-primary)' }}>
                        {format(timeRange.start, 'h:mma').toLowerCase()}
                      </div>
                    )}

                    {/* Breaks */}
                    {dayStats.breaks.map((brk, i) => (
                      <div key={i} className="text-base mb-1 font-bold" style={{ color: 'var(--text-secondary)' }}>
                        break {format(brk.startTime, 'h:mma').toLowerCase()}-{format(brk.endTime, 'h:mma').toLowerCase()}
                      </div>
                    ))}

                    {/* End time */}
                    {timeRange.end && (
                      <div className="text-base mb-3 font-bold" style={{ color: 'var(--text-primary)' }}>
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
                          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{tag.hours}h {tag.minutes}m</span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="text-xs pt-1" style={{ 
                      borderTop: `1px solid var(--border-color)`,
                      color: 'var(--text-secondary)'
                    }}>
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
