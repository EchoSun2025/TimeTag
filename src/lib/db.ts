import Dexie, { Table } from 'dexie';
import { TimeRecord, Tag, Settings } from '@/types';

export class TimeTagDatabase extends Dexie {
  records!: Table<TimeRecord, string>;
  tags!: Table<Tag, string>;
  settings!: Table<Settings, number>;

  constructor() {
    super('TimeTagDB');
    
    this.version(1).stores({
      records: 'id, startTime, endTime, *tags, createdAt',
      tags: 'id, name, createdAt',
      settings: '++id',
    });
  }
}

export const db = new TimeTagDatabase();

// Initialize default settings
export async function initializeDefaultSettings() {
  const existingSettings = await db.settings.toArray();
  if (existingSettings.length === 0) {
    await db.settings.add({
      timeRounding: false,
      roundingInterval: 15,
      defaultStartHour: 8,
      defaultEndHour: 21,
      weekDaysCount: 5,
    });
  }
}

// Initialize default tags
export async function initializeDefaultTags() {
  const existingTags = await db.tags.toArray();
  if (existingTags.length === 0) {
    const defaultTags: Omit<Tag, 'id'>[] = [
      { name: 'Work', color: '#4285F4', isActive: true, createdAt: new Date() },
      { name: 'Study', color: '#34A853', isActive: true, createdAt: new Date() },
      { name: 'Meeting', color: '#EA4335', isActive: true, createdAt: new Date() },
      { name: 'Break', color: '#FBBC04', isActive: true, createdAt: new Date() },
      { name: 'Exercise', color: '#00ACC1', isActive: true, createdAt: new Date() },
      { name: 'Reading', color: '#A142F4', isActive: true, createdAt: new Date() },
      { name: 'Meal', color: '#F9AB00', isActive: true, createdAt: new Date() },
      { name: 'Social', color: '#E91E63', isActive: true, createdAt: new Date() },
      { name: 'Other', color: '#5E6FE1', isActive: true, createdAt: new Date() },
    ];

    for (const tag of defaultTags) {
      await db.tags.add({
        ...tag,
        id: crypto.randomUUID(),
      });
    }
  }
}

// Initialize database
export async function initializeDatabase() {
  await initializeDefaultSettings();
  await initializeDefaultTags();
}
