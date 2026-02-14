import { TimeRecord, Tag, DayStats, BreakPeriod } from '@/types';

/**
 * Calculate statistics for a single day
 */
export function calculateDayStats(
  records: TimeRecord[],
  tags: Tag[],
  date: Date
): DayStats {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  // Filter only active tags
  const activeTags = tags.filter(t => t.isActive);
  const activeTagIds = new Set(activeTags.map(t => t.id));

  // Calculate total minutes and tag breakdown
  let totalMinutes = 0;
  const tagMinutes: Record<string, number> = {};

  records.forEach(record => {
    const start = new Date(record.startTime).getTime();
    const end = new Date(record.endTime).getTime();
    const duration = Math.floor((end - start) / (1000 * 60));

    // Check if record has any active tags
    const hasActiveTags = record.tags.some(tagId => activeTagIds.has(tagId));

    if (hasActiveTags || record.tags.length === 0) {
      totalMinutes += duration;

      // Count for each tag
      record.tags.forEach(tagId => {
        if (activeTagIds.has(tagId)) {
          tagMinutes[tagId] = (tagMinutes[tagId] || 0) + duration;
        }
      });
    }
  });

  // Detect breaks (gaps between records)
  const breaks = detectBreaks(records);

  return {
    date,
    totalMinutes,
    tagMinutes,
    records,
    breaks,
  };
}

/**
 * Detect breaks (gaps) between records
 */
function detectBreaks(records: TimeRecord[]): BreakPeriod[] {
  if (records.length === 0) return [];

  // Sort by start time
  const sorted = [...records].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const breaks: BreakPeriod[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = new Date(sorted[i].endTime);
    const nextStart = new Date(sorted[i + 1].startTime);

    const gapMinutes = Math.floor((nextStart.getTime() - currentEnd.getTime()) / (1000 * 60));

    // Only count gaps of 5+ minutes as breaks
    if (gapMinutes >= 5) {
      breaks.push({
        startTime: currentEnd,
        endTime: nextStart,
        durationMinutes: gapMinutes,
      });
    }
  }

  return breaks;
}

/**
 * Get start and end time of a day's records
 */
export function getDayTimeRange(records: TimeRecord[]): { start: Date | null; end: Date | null } {
  if (records.length === 0) return { start: null, end: null };

  const sorted = [...records].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return {
    start: new Date(sorted[0].startTime),
    end: new Date(sorted[sorted.length - 1].endTime),
  };
}

/**
 * Format minutes to hours and minutes
 */
export function formatMinutesToHM(minutes: number): { hours: number; minutes: number } {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { hours, minutes: mins };
}
