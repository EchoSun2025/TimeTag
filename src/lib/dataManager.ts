/**
 * Data import/export utilities compatible with TimeRecord v1 format
 */

import { db, Tag, TimeRecord } from './db';

interface ExportData {
  exportTime: string;
  version: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
    isExcluded?: boolean;
    isLeisure?: boolean;
    isActive?: boolean;
  }>;
  records: Array<{
    id: string;
    description?: string;
    tags: string[];
    startTime: string | Date;
    endTime: string | Date;
    duration?: number;
  }>;
}

/**
 * Export data to JSON (compatible with TimeRecord v1)
 */
export async function exportData(startDate?: Date, endDate?: Date): Promise<string> {
  // Fetch all records or filtered by date range
  let records: TimeRecord[];
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    records = await db.records
      .where('startTime')
      .between(start, end, true, true)
      .toArray();
  } else {
    records = await db.records.toArray();
  }

  // Fetch all tags
  const tags = await db.tags.toArray();

  // Convert to export format
  const exportRecords = records.map(r => ({
    id: r.id,
    description: r.description || '',
    tags: r.tags,
    startTime: r.startTime instanceof Date ? r.startTime.toISOString() : new Date(r.startTime).toISOString(),
    endTime: r.endTime instanceof Date ? r.endTime.toISOString() : new Date(r.endTime).toISOString(),
    duration: Math.round((new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 1000),
  }));

  const exportTags = tags.map(t => ({
    id: t.id,
    name: t.name,
    color: t.color,
    isExcluded: t.isLeisure || false, // Map isLeisure to isExcluded for v1 compatibility
    isLeisure: t.isLeisure || false,
    isActive: t.isActive !== undefined ? t.isActive : true,
  }));

  const exportObj: ExportData = {
    exportTime: new Date().toISOString(),
    version: '2.0', // TimeTag v2 format
    tags: exportTags,
    records: exportRecords,
  };

  if (startDate && endDate) {
    exportObj.dateRange = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  }

  return JSON.stringify(exportObj, null, 2);
}

/**
 * Download exported data as JSON file
 */
export async function downloadExport(startDate?: Date, endDate?: Date): Promise<void> {
  const jsonStr = await exportData(startDate, endDate);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const filename = startDate && endDate
    ? `timetag-records-${formatDate(startDate)}-to-${formatDate(endDate)}.json`
    : `timetag-records-all-${formatDate(new Date())}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate import data
 */
export function parseImportData(jsonStr: string): {
  success: boolean;
  data?: ExportData;
  recordCount?: number;
  tagCount?: number;
  dateRange?: { start: string; end: string };
  error?: string;
} {
  try {
    const data: ExportData = JSON.parse(jsonStr);
    
    if (!data.version || !data.records || !data.tags) {
      throw new Error('Invalid data format: missing version, records, or tags');
    }

    // Normalize tags (v1 used isExcluded, v2 uses isLeisure)
    data.tags = data.tags.map(tag => ({
      ...tag,
      isLeisure: tag.isLeisure !== undefined ? tag.isLeisure : (tag.isExcluded || false),
      isActive: tag.isActive !== undefined ? tag.isActive : true,
    }));

    return {
      success: true,
      data,
      recordCount: data.records.length,
      tagCount: data.tags.length,
      dateRange: data.dateRange,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}

/**
 * Import data with smart merging (compatible with TimeRecord v1)
 */
export async function importDataMerge(importData: ExportData): Promise<{
  addedRecords: number;
  addedTags: number;
  updatedTags: number;
}> {
  const existingRecords = await db.records.toArray();
  const existingTags = await db.tags.toArray();
  const existingRecordIds = new Set(existingRecords.map(r => r.id));

  // Map existing tags by name (case-insensitive)
  const existingTagsByName = new Map<string, Tag>();
  existingTags.forEach(t => {
    existingTagsByName.set(t.name.toLowerCase(), t);
  });

  // Tag ID mapping (import ID -> existing ID)
  const tagIdMapping = new Map<string, string>();
  let addedTags = 0;
  let updatedTags = 0;

  // Process tags
  for (const importTag of importData.tags) {
    const existingTag = existingTagsByName.get(importTag.name.toLowerCase());
    
    if (existingTag) {
      // Tag exists, update it and use existing ID
      tagIdMapping.set(importTag.id, existingTag.id);
      
      // Update tag properties if they changed
      const updates: Partial<Tag> = {};
      if (importTag.color && importTag.color !== existingTag.color) {
        updates.color = importTag.color;
        updatedTags++;
      }
      if (importTag.isLeisure !== undefined && importTag.isLeisure !== existingTag.isLeisure) {
        updates.isLeisure = importTag.isLeisure;
      }
      
      if (Object.keys(updates).length > 0) {
        await db.tags.update(existingTag.id, updates);
      }
    } else {
      // New tag, add it
      const newTag: Omit<Tag, 'id'> = {
        name: importTag.name,
        color: importTag.color,
        isActive: importTag.isActive !== undefined ? importTag.isActive : true,
        isLeisure: importTag.isLeisure || false,
        subItems: [],
        recurringSchedules: [],
        createdAt: new Date(),
      };
      
      const newId = await db.tags.add({
        ...newTag,
        id: importTag.id,
      });
      
      tagIdMapping.set(importTag.id, typeof newId === 'string' ? newId : importTag.id);
      existingTagsByName.set(importTag.name.toLowerCase(), { ...newTag, id: importTag.id });
      addedTags++;
    }
  }

  // Process records (skip existing ones, update tag IDs)
  let addedRecords = 0;
  for (const record of importData.records) {
    if (!existingRecordIds.has(record.id)) {
      const newRecord: Omit<TimeRecord, 'id'> = {
        description: record.description || '',
        tags: record.tags.map(tagId => tagIdMapping.get(tagId) || tagId),
        startTime: new Date(record.startTime),
        endTime: new Date(record.endTime),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await db.records.add({
        ...newRecord,
        id: record.id,
      });
      
      addedRecords++;
    }
  }

  return {
    addedRecords,
    addedTags,
    updatedTags,
  };
}

/**
 * Import data with full replacement
 */
export async function importDataReplace(importData: ExportData): Promise<{
  addedRecords: number;
  addedTags: number;
}> {
  // Clear existing data
  await db.records.clear();
  await db.tags.clear();

  // Add tags
  for (const tag of importData.tags) {
    await db.tags.add({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      isActive: tag.isActive !== undefined ? tag.isActive : true,
      isLeisure: tag.isLeisure || false,
      subItems: [],
      recurringSchedules: [],
      createdAt: new Date(),
    });
  }

  // Add records
  for (const record of importData.records) {
    await db.records.add({
      id: record.id,
      description: record.description || '',
      tags: record.tags,
      startTime: new Date(record.startTime),
      endTime: new Date(record.endTime),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return {
    addedRecords: importData.records.length,
    addedTags: importData.tags.length,
  };
}
