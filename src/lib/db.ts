import Dexie, { Table } from 'dexie';
import { TimeRecord, Tag, Settings } from '@/types';

export class TimeTagDatabase extends Dexie {
  records!: Table<TimeRecord, string>;
  tags!: Table<Tag, string>;
  settings!: Table<Settings, number>;

  constructor() {
    super('TimeTagDB');
    
    // Version 1: Initial schema
    this.version(1).stores({
      records: 'id, startTime, endTime, *tags, createdAt',
      tags: 'id, name, createdAt',
      settings: '++id',
    });

    // Version 2: Add isLeisure and subItems to tags
    this.version(2).stores({
      records: 'id, startTime, endTime, *tags, createdAt',
      tags: 'id, name, createdAt',
      settings: '++id',
    }).upgrade(async (trans) => {
      // Migrate existing tags to add new fields
      const tags = await trans.table('tags').toArray();
      for (const tag of tags) {
        await trans.table('tags').update(tag.id, {
          isLeisure: tag.isLeisure ?? false,
          subItems: tag.subItems ?? [],
        });
      }
    });

    // Version 3: Add recurringSchedules to tags and update leisure colors
    this.version(3).stores({
      records: 'id, startTime, endTime, *tags, createdAt',
      tags: 'id, name, createdAt',
      settings: '++id',
    }).upgrade(async (trans) => {
      const LEISURE_GREEN = '#86EFAC';
      const tags = await trans.table('tags').toArray();
      for (const tag of tags) {
        const updates: any = {
          recurringSchedules: tag.recurringSchedules ?? [],
        };
        
        // Change leisure tag colors to light green
        if (tag.isLeisure) {
          updates.color = LEISURE_GREEN;
        }
        
        await trans.table('tags').update(tag.id, updates);
      }
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
      { name: 'Work', color: '#4285F4', isActive: true, isLeisure: false, subItems: [], recurringSchedules: [], createdAt: new Date() },
      { name: 'Lunch', color: '#34A853', isActive: true, isLeisure: false, subItems: [], recurringSchedules: [], createdAt: new Date() },
      { name: 'Meeting', color: '#EA4335', isActive: true, isLeisure: false, subItems: [], recurringSchedules: [], createdAt: new Date() },
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
