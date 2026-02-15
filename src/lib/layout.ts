import { TimeRecord } from '@/types';

/**
 * Detect overlapping records and assign columns for side-by-side display
 * Also treats records within 10 minutes of each other as "overlapping" for better visual separation
 * Earlier records are placed in left columns
 */
export function calculateOverlappingLayout(records: TimeRecord[]) {
  if (records.length === 0) return [];

  const TEN_MINUTES_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Sort by start time (earlier first)
  const sorted = [...records].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Track which columns are occupied at each time point
  const recordsWithLayout = sorted.map((record) => ({
    ...record,
    column: 0,
    totalColumns: 1,
  }));

  // Build groups of overlapping/close-by records
  const groups: number[][] = [];
  
  for (let i = 0; i < recordsWithLayout.length; i++) {
    const current = recordsWithLayout[i];
    const currentStart = new Date(current.startTime).getTime();
    const currentEnd = new Date(current.endTime).getTime();

    // Find which group this record belongs to
    let belongsToGroup = -1;
    
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      
      // Check if current record overlaps or is close to any record in this group
      const isInGroup = group.some(idx => {
        const other = recordsWithLayout[idx];
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
      
      if (isInGroup) {
        belongsToGroup = g;
        break;
      }
    }
    
    if (belongsToGroup === -1) {
      // Create new group
      groups.push([i]);
    } else {
      // Add to existing group
      groups[belongsToGroup].push(i);
    }
  }

  // Assign columns within each group, sorted by start time (earlier = left)
  groups.forEach(group => {
    // Sort indices by start time within group
    const sortedIndices = [...group].sort((idxA, idxB) => {
      const timeA = new Date(recordsWithLayout[idxA].startTime).getTime();
      const timeB = new Date(recordsWithLayout[idxB].startTime).getTime();
      return timeA - timeB;
    });
    
    // Assign columns in order
    sortedIndices.forEach((idx, col) => {
      recordsWithLayout[idx].column = col;
      recordsWithLayout[idx].totalColumns = group.length;
    });
  });

  return recordsWithLayout;
}
