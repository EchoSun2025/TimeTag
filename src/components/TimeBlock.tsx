import React from 'react';
import { TimeRecord, Tag } from '@/types';
import { formatTime } from '@/lib/utils';

interface TimeBlockProps {
  record: TimeRecord;
  tags: Tag[];
  heightPerHour: number;
  dayStart: number;
  onClick: () => void;
}

function TimeBlock({ record, tags, heightPerHour, dayStart, onClick }: TimeBlockProps) {
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
  
  return (
    <div
      className="absolute left-0 right-0 px-1 cursor-pointer hover:brightness-110 transition-all group"
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
      onClick={onClick}
    >
      <div
        className="h-full rounded border-l-4 px-2 py-1 overflow-hidden"
        style={{
          backgroundColor,
          borderColor,
        }}
      >
        {/* Time range */}
        <div className="text-xs font-medium opacity-80">
          {formatTime(new Date(record.startTime))} - {formatTime(new Date(record.endTime))}
        </div>
        
        {/* Description */}
        {height > 40 && (
          <div className="text-sm font-medium mt-1 line-clamp-2">
            {record.description}
          </div>
        )}
        
        {/* Tags */}
        {height > 60 && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
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
    </div>
  );
}

export default TimeBlock;
