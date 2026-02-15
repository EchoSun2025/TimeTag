import { TimeRecord } from '@/types';

/**
 * Detect overlapping records and assign columns for side-by-side display
 * Also treats records within 10 minutes of each other as "overlapping" for better visual separation
 */
export function calculateOverlappingLayout(records: TimeRecord[]) {
  if (records.length === 0) return [];

  const TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Sort by start time
  const sorted = [...records].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Track which columns are occupied at each time point
  const recordsWithLayout = sorted.map((record) => ({
    ...record,
    column: 0,
    totalColumns: 1,
  }));

  // Calculate overlaps and assign columns
  for (let i = 0; i < recordsWithLayout.length; i++) {
    const current = recordsWithLayout[i];
    const currentStart = new Date(current.startTime).getTime();
    const currentEnd = new Date(current.endTime).getTime();

    // Find all overlapping or close-by records
    const overlapping = recordsWithLayout.filter((other, j) => {
      if (i === j) return false;
      const otherStart = new Date(other.startTime).getTime();
      const otherEnd = new Date(other.endTime).getTime();
      
      // Check if they actually overlap
      const hasOverlap = !(otherEnd <= currentStart || otherStart >= currentEnd);
      
      // Check if they're within 10 minutes of each other
      const gap = Math.min(
        Math.abs(currentStart - otherEnd),  // Gap after other ends
        Math.abs(otherStart - currentEnd)   // Gap after current ends
      );
      const isCloseBy = gap <= TEN_MINUTES_MS;
      
      return hasOverlap || isCloseBy;
    });

    // Find used columns by overlapping records
    const usedColumns = overlapping
      .filter(r => r.column !== undefined)
      .map(r => r.column);

    // Assign first available column
    let column = 0;
    while (usedColumns.includes(column)) {
      column++;
    }
    current.column = column;

    // Calculate total columns needed for this overlapping group
    const maxColumn = Math.max(column, ...overlapping.map(r => r.column));
    current.totalColumns = maxColumn + 1;
  }

  // Second pass: ensure all overlapping records have same totalColumns
  for (let i = 0; i < recordsWithLayout.length; i++) {
    const current = recordsWithLayout[i];
    const currentStart = new Date(current.startTime).getTime();
    const currentEnd = new Date(current.endTime).getTime();

    const overlapping = recordsWithLayout.filter((other, j) => {
      if (i === j) return false;
      const otherStart = new Date(other.startTime).getTime();
      const otherEnd = new Date(other.endTime).getTime();
      
      const hasOverlap = !(otherEnd <= currentStart || otherStart >= currentEnd);
      const gap = Math.min(
        Math.abs(currentStart - otherEnd),
        Math.abs(otherStart - currentEnd)
      );
      const isCloseBy = gap <= TEN_MINUTES_MS;
      
      return hasOverlap || isCloseBy;
    });

    const maxTotalColumns = Math.max(
      current.totalColumns,
      ...overlapping.map(r => r.totalColumns)
    );

    current.totalColumns = maxTotalColumns;
    overlapping.forEach(r => {
      r.totalColumns = maxTotalColumns;
    });
  }

  return recordsWithLayout;
}
