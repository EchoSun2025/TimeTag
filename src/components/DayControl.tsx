import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { calculateDayStats, formatMinutesToHM } from '@/lib/stats';

function DayControl() {
  const { currentDate, setCurrentDate } = useAppStore();

  // Fetch records for current date
  const records = useLiveQuery(async () => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    return await db.records
      .where('startTime')
      .between(dayStart, dayEnd, true, true)
      .toArray();
  }, [currentDate]);

  // Fetch tags
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!records || !tags) return null;
    return calculateDayStats(records, tags, currentDate);
  }, [records, tags, currentDate]);

  const totalTime = stats ? formatMinutesToHM(stats.totalMinutes) : { hours: 0, minutes: 0 };
  
  // Get tag breakdown for display
  const tagBreakdown = React.useMemo(() => {
    if (!stats || !tags) return [];
    
    return Object.entries(stats.tagMinutes)
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
        return bTotal - aTotal; // Sort by duration descending
      }) as Array<{ name: string; color: string; hours: number; minutes: number }>;
  }, [stats, tags]);

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
          <div className="text-3xl font-semibold">{totalTime.hours}h {totalTime.minutes}m</div>
        </div>
        
        {/* Tag breakdown inline */}
        {tagBreakdown.length > 0 && (
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
        )}
      </div>
    </div>
  );
}

export default DayControl;
