import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';

/**
 * Round time to nearest interval (default 15 minutes)
 */
export function roundTime(date: Date, intervalMinutes: number = 15): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

/**
 * Round start time DOWN to interval (ensures no time is lost)
 */
export function roundTimeDown(date: Date, intervalMinutes: number = 15): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

/**
 * Round end time UP to interval (ensures no time is lost)
 */
export function roundTimeUp(date: Date, intervalMinutes: number = 15): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

/**
 * Format time for display (e.g., "9:15am")
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mma').toLowerCase();
}

/**
 * Format date for display (e.g., "2026/02/14")
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy/MM/dd EEE.');
}

/**
 * Format week range (e.g., "02/09-02/15 Feb.Week2")
 */
export function formatWeekRange(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const weekNumber = Math.ceil(start.getDate() / 7);
  
  return `${format(start, 'MM/dd')}-${format(end, 'MM/dd')} ${format(date, 'MMM')}.Week${weekNumber}`;
}

/**
 * Convert minutes to readable format (e.g., "6h30min")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}min`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h${mins}min`;
}

/**
 * Get duration in minutes between two dates
 */
export function getDurationMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Get week days array starting from Monday
 */
export function getWeekDays(date: Date, count: 5 | 7 = 5): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

/**
 * Check if two dates are on the same day
 */
export function isSameDayHelper(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

/**
 * Generate ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
