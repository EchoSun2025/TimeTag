import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatMinutesToHM } from '@/lib/stats';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, startOfWeek, endOfWeek } from 'date-fns';

interface MonthViewProps {
  currentDate: Date;
}

function MonthView({ currentDate }: MonthViewProps) {
  // Fetch records for the month
  const monthRecords = useLiveQuery(async () => {
    const start = startOfMonth(currentDate);
    start.setHours(0, 0, 0, 0);
    const end = endOfMonth(currentDate);
    end.setHours(23, 59, 59, 999);

    return await db.records
      .where('startTime')
      .between(start, end, true, true)
      .toArray();
  }, [currentDate]);

  // Fetch tags
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  // Calculate month stats
  const monthStats = React.useMemo(() => {
    if (!monthRecords || !tags) return null;

    const monthTotalMinutes = monthRecords.reduce((sum, record) => {
      const duration = Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000);
      return sum + duration;
    }, 0);

    // Calculate tag totals
    const monthTagMinutes: Record<string, number> = {};
    monthRecords.forEach(record => {
      const duration = Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000);
      record.tags.forEach(tagId => {
        monthTagMinutes[tagId] = (monthTagMinutes[tagId] || 0) + duration;
      });
    });

    // Calculate per-day stats
    const daysInMonth = eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }),
    });

    const dailyStats = daysInMonth.map(day => {
      const dayRecords = monthRecords.filter(r => {
        const recordDate = new Date(r.startTime);
        return recordDate.toDateString() === day.toDateString();
      });
      const dayMinutes = dayRecords.reduce((sum, record) => {
        const duration = Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000);
        return sum + duration;
      }, 0);

      // Get top tag for this day
      const dayTagMinutes: Record<string, number> = {};
      dayRecords.forEach(record => {
        const duration = Math.round((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000);
        record.tags.forEach(tagId => {
          dayTagMinutes[tagId] = (dayTagMinutes[tagId] || 0) + duration;
        });
      });
      const topTagId = Object.entries(dayTagMinutes).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topTag = topTagId ? tags.find(t => t.id === topTagId) : null;

      return {
        date: day,
        minutes: dayMinutes,
        topTag,
        isCurrentMonth: day.getMonth() === currentDate.getMonth(),
      };
    });

    return {
      totalMinutes: monthTotalMinutes,
      tagMinutes: monthTagMinutes,
      days: dailyStats,
    };
  }, [monthRecords, tags, currentDate]);

  if (!monthStats || !tags) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const monthTotalTime = formatMinutesToHM(monthStats.totalMinutes);

  // Get month tag breakdown
  const monthTagBreakdown = Object.entries(monthStats.tagMinutes)
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

  // Get max minutes for color intensity
  const maxMinutes = Math.max(...monthStats.days.map(d => d.minutes));

  return (
    <div className="flex flex-col h-full">
      {/* Month total card */}
      <div className="mb-6">
        <div className="bg-yellow-50/30 border border-yellow-200/50 rounded-lg p-4 flex items-center gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Month Total</div>
            <div className="text-3xl font-semibold">{monthTotalTime.hours}h {monthTotalTime.minutes}m</div>
          </div>
          
          {/* Tag breakdown inline */}
          {monthTagBreakdown.length > 0 && (
            <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
              {monthTagBreakdown.slice(0, 5).map((tag) => (
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

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {monthStats.days.map((dayStat, index) => {
            const dayTime = formatMinutesToHM(dayStat.minutes);
            const intensity = maxMinutes > 0 ? dayStat.minutes / maxMinutes : 0;
            const bgColor = dayStat.topTag
              ? `rgba(${parseInt(dayStat.topTag.color.slice(1, 3), 16)}, ${parseInt(dayStat.topTag.color.slice(3, 5), 16)}, ${parseInt(dayStat.topTag.color.slice(5, 7), 16)}, ${0.2 + intensity * 0.6})`
              : dayStat.minutes > 0
              ? `rgba(156, 163, 175, ${0.2 + intensity * 0.4})`
              : undefined;

            return (
              <div
                key={index}
                className={`
                  border rounded p-2 min-h-20
                  ${dayStat.isCurrentMonth ? 'border-gray-200' : 'border-gray-100 opacity-40'}
                  ${dayStat.minutes > 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''}
                `}
                style={{ backgroundColor: bgColor }}
                title={`${format(dayStat.date, 'MMM dd')}: ${dayTime.hours}h ${dayTime.minutes}m`}
              >
                <div className={`text-lg font-semibold mb-1 ${dayStat.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {format(dayStat.date, 'd')}
                </div>
                {dayStat.minutes > 0 && (
                  <div className="text-xs font-mono text-gray-700">
                    {dayTime.hours}h {dayTime.minutes}m
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MonthView;
