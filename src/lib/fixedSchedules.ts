import { Tag, TimeRecord } from '@/types';
import { db } from './db';

/**
 * Check and create fixed time records for a specific date
 * Only creates records if they don't already exist
 */
export async function ensureFixedTimeRecords(date: Date, tags: Tag[]): Promise<void> {
  const dayOfWeek = date.getDay();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Get existing records for this day
  const existingRecords = await db.records
    .where('startTime')
    .between(dayStart, dayEnd, true, true)
    .toArray();

  // Check each tag's schedules
  for (const tag of tags) {
    if (!tag.recurringSchedules || tag.recurringSchedules.length === 0) {
      continue;
    }

    for (const schedule of tag.recurringSchedules) {
      if (schedule.dayOfWeek === dayOfWeek) {
        const startTime = new Date(date);
        startTime.setHours(schedule.startHour, schedule.startMinute, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(schedule.endHour, schedule.endMinute, 0, 0);

        // Check if a similar record already exists
        // Look for records with same tag and description (tag name) within 2 hours before/after
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
        const scheduleStart = startTime.getTime();
        const scheduleEnd = endTime.getTime();
        
        const alreadyExists = existingRecords.some(record => {
          // Must have the same tag
          if (!record.tags.includes(tag.id)) {
            return false;
          }
          
          // Must have the same description (auto-generated records have description = tag name)
          if (record.description !== tag.name) {
            return false;
          }
          
          const recordStart = new Date(record.startTime).getTime();
          const recordEnd = new Date(record.endTime).getTime();
          
          // Check if record is within 2 hours before or after the scheduled time
          const startTimeDiff = Math.abs(recordStart - scheduleStart);
          const endTimeDiff = Math.abs(recordEnd - scheduleEnd);
          
          // If both start and end times are within 2 hours of the schedule, consider it the same
          return startTimeDiff <= TWO_HOURS_MS && endTimeDiff <= TWO_HOURS_MS;
        });

        // Only create if doesn't exist
        if (!alreadyExists) {
          const newRecord: TimeRecord = {
            id: crypto.randomUUID(),
            description: tag.name,
            startTime,
            endTime,
            tags: [tag.id],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.records.add(newRecord);
        }
      }
    }
  }
}
