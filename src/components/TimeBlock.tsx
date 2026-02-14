import React, { useState, useRef } from 'react';
import { TimeRecord, Tag } from '@/types';
import { formatTime } from '@/lib/utils';
import { db } from '@/lib/db';

interface TimeBlockProps {
  record: TimeRecord;
  tags: Tag[];
  heightPerHour: number;
  dayStart: number;
  onClick: () => void;
}

type DragMode = 'none' | 'move' | 'resize-top' | 'resize-bottom';

function TimeBlock({ record, tags, heightPerHour, dayStart, onClick }: TimeBlockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const dragStartY = useRef(0);
  const initialStartTime = useRef(0);
  const initialEndTime = useRef(0);

  const startTime = new Date(record.startTime).getTime();
  const endTime = new Date(record.endTime).getTime();
  
  // Calculate position and height
  const startMinutes = (startTime - dayStart) / (1000 * 60);
  const endMinutes = (endTime - dayStart) / (1000 * 60);
  const durationMinutes = endMinutes - startMinutes;
  
  const top = (startMinutes / 60) * heightPerHour;
  const height = Math.max((durationMinutes / 60) * heightPerHour, 20); // Minimum 20px
  
  // Get tag color
  const firstTag = record.tags.length > 0 
    ? tags.find(t => t.id === record.tags[0])
    : null;
  
  const backgroundColor = firstTag ? firstTag.color + '40' : 'rgba(125, 211, 252, 0.3)';
  const borderColor = firstTag ? firstTag.color : '#7dd3fc';

  const handleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    dragStartY.current = e.clientY;
    initialStartTime.current = startTime;
    initialEndTime.current = endTime;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartY.current;
      const deltaMinutes = Math.round((deltaY / heightPerHour) * 60);

      let newStartTime = initialStartTime.current;
      let newEndTime = initialEndTime.current;

      if (mode === 'move') {
        // Move entire block
        newStartTime = initialStartTime.current + deltaMinutes * 60 * 1000;
        newEndTime = initialEndTime.current + deltaMinutes * 60 * 1000;
      } else if (mode === 'resize-top') {
        // Resize from top
        newStartTime = initialStartTime.current + deltaMinutes * 60 * 1000;
        // Ensure minimum 15 minutes duration
        if (newStartTime >= newEndTime - 15 * 60 * 1000) {
          newStartTime = newEndTime - 15 * 60 * 1000;
        }
      } else if (mode === 'resize-bottom') {
        // Resize from bottom
        newEndTime = initialEndTime.current + deltaMinutes * 60 * 1000;
        // Ensure minimum 15 minutes duration
        if (newEndTime <= newStartTime + 15 * 60 * 1000) {
          newEndTime = newStartTime + 15 * 60 * 1000;
        }
      }

      // Prevent dragging outside day boundaries
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      newStartTime = Math.max(dayStart, Math.min(newStartTime, dayEnd));
      newEndTime = Math.max(dayStart, Math.min(newEndTime, dayEnd));

      // Update database
      db.records.update(record.id, {
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        updatedAt: new Date(),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode('none');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && dragMode === 'none') {
      onClick();
    }
  };
  
  return (
    <div
      className="absolute left-0 right-0 px-1 group"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        zIndex: isDragging ? 50 : 10,
      }}
    >
      {/* Resize handle - Top */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'resize-top')}
      />

      {/* Main block */}
      <div
        className={`h-full rounded border-l-4 px-2 py-1 overflow-hidden cursor-move hover:brightness-110 transition-all ${
          isDragging ? 'opacity-70 shadow-lg' : ''
        }`}
        style={{
          backgroundColor,
          borderColor,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onClick={handleClick}
      >
        {/* Time range */}
        <div className="text-xs font-medium opacity-80 pointer-events-none">
          {formatTime(new Date(record.startTime))} - {formatTime(new Date(record.endTime))}
        </div>
        
        {/* Description */}
        {height > 40 && (
          <div className="text-sm font-medium mt-1 line-clamp-2 pointer-events-none">
            {record.description}
          </div>
        )}
        
        {/* Tags */}
        {height > 60 && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 pointer-events-none">
            {record.tags.slice(0, 3).map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Resize handle - Bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10 transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'resize-bottom')}
      />
    </div>
  );
}

export default TimeBlock;
