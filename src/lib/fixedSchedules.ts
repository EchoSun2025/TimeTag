import { Tag, TimeRecord, RecurringSchedule } from '@/types';

/**
 * Generate fixed time records for a specific date based on tag recurring schedules
 */
export function generateFixedTimeRecords(date: Date, tags: Tag[]): TimeRecord[] {
  const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
  const fixedRecords: TimeRecord[] = [];

  tags.forEach(tag => {
    if (!tag.recurringSchedules || tag.recurringSchedules.length === 0) {
      return;
    }

    tag.recurringSchedules.forEach(schedule => {
      if (schedule.dayOfWeek === dayOfWeek) {
        // Create a time record for this schedule
        const startTime = new Date(date);
        startTime.setHours(schedule.startHour, schedule.startMinute, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(schedule.endHour, schedule.endMinute, 0, 0);

        fixedRecords.push({
          id: `fixed-${tag.id}-${schedule.dayOfWeek}-${schedule.startHour}-${schedule.startMinute}`,
          description: tag.name,
          startTime,
          endTime,
          tags: [tag.id],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });
  });

  return fixedRecords;
}
