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
      { name: 'Work', color: '#4285F4', isActive: true, isLeisure: false, subItems: [], createdAt: new Date() },
      { name: 'Study', color: '#34A853', isActive: true, isLeisure: false, subItems: [], createdAt: new Date() },
      { name: 'Meeting', color: '#EA4335', isActive: true, isLeisure: false, subItems: [], createdAt: new Date() },
      { name: 'Break', color: '#FBBC04', isActive: true, isLeisure: true, subItems: [], createdAt: new Date() },
      { name: 'Exercise', color: '#00ACC1', isActive: true, isLeisure: true, subItems: [], createdAt: new Date() },
      { name: 'Reading', color: '#A142F4', isActive: true, isLeisure: false, subItems: [], createdAt: new Date() },
      { name: 'Meal', color: '#F9AB00', isActive: true, isLeisure: true, subItems: [], createdAt: new Date() },
      { name: 'Social', color: '#E91E63', isActive: true, isLeisure: true, subItems: [], createdAt: new Date() },
      { name: 'Other', color: '#5E6FE1', isActive: true, isLeisure: false, subItems: [], createdAt: new Date() },
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
