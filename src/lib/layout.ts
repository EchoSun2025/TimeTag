import { TimeRecord } from '@/types';

/**
 * Detect overlapping records and assign columns for side-by-side display
 */
export function calculateOverlappingLayout(records: TimeRecord[]) {
  if (records.length === 0) return [];

  console.log('calculateOverlappingLayout: input records', records.length);

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

    // Find all overlapping records
    const overlapping = recordsWithLayout.filter((other, j) => {
      if (i === j) return false;
      const otherStart = new Date(other.startTime).getTime();
      const otherEnd = new Date(other.endTime).getTime();
      
      // Check if they overlap
      return !(otherEnd <= currentStart || otherStart >= currentEnd);
    });

    console.log(`Record ${i} (${current.description}):`, {
      start: new Date(current.startTime).toISOString(),
      end: new Date(current.endTime).toISOString(),
      overlappingCount: overlapping.length
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

    console.log(`  Assigned column ${column}, totalColumns ${current.totalColumns}`);
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
      return !(otherEnd <= currentStart || otherStart >= currentEnd);
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

  console.log('calculateOverlappingLayout: final layout', 
    recordsWithLayout.map(r => ({
      desc: r.description,
      column: r.column,
      totalColumns: r.totalColumns
    }))
  );

  return recordsWithLayout;
}
