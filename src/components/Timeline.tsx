import React, { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import RecordModal from './RecordModal';
import TimeBlock from './TimeBlock';
import { TimeRecord } from '@/types';

function Timeline() {
  const { timelineZoom, setTimelineZoom, currentDate } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState<Date | undefined>();
  const [modalEndTime, setModalEndTime] = useState<Date | undefined>();
  const [editingRecord, setEditingRecord] = useState<TimeRecord | undefined>();

  // Fetch records for current date
  const records = useLiveQuery(async () => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    return await db.records
      .where('startTime')
      .between(dayStart, dayEnd, true, true)
      .toArray();
  }, [currentDate]);

  // Fetch tags
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  const handleZoomIn = () => setTimelineZoom(timelineZoom + 1);
  const handleZoomOut = () => setTimelineZoom(timelineZoom - 1);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.altKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Generate full 24 hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate height based on zoom (zoom 1-5, base 40px per hour)
  const baseHeightPerHour = 40;
  const heightPerHour = baseHeightPerHour * timelineZoom;

  // Scroll to 8am by default on mount
  useEffect(() => {
    if (containerRef.current) {
      const defaultStartHour = 8;
      const scrollPosition = defaultStartHour * heightPerHour;
      containerRef.current.scrollTop = scrollPosition;
    }
  }, []); // Only run once on mount

  // Handle double-click to create record
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const clickY = e.clientY - rect.top + scrollTop - 16; // Subtract padding
    
    // Calculate clicked hour and minute
    const totalMinutes = (clickY / heightPerHour) * 60;
    const clickedHour = Math.floor(totalMinutes / 60);
    const clickedMinute = Math.floor(totalMinutes % 60);

    // Round to nearest 15 minutes
    const roundedMinute = Math.round(clickedMinute / 15) * 15;
    
    // Create start time
    const startTime = new Date(currentDate);
    startTime.setHours(clickedHour, roundedMinute, 0, 0);
    
    // Default end time is 1 hour later
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    setModalStartTime(startTime);
    setModalEndTime(endTime);
    setEditingRecord(undefined);
    setIsModalOpen(true);
  };

  // Handle time block click
  const handleBlockClick = (record: TimeRecord) => {
    setEditingRecord(record);
    setModalStartTime(undefined);
    setModalEndTime(undefined);
    setIsModalOpen(true);
  };

  // Get day start timestamp
  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayStartTimestamp = dayStart.getTime();

  return (
    <div className="h-full flex flex-col bg-yellow-50 relative">
      {/* Floating zoom controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={handleZoomOut}
          disabled={timelineZoom <= 1}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Zoom out"
        >
          -
        </button>
        <button
          onClick={handleZoomIn}
          disabled={timelineZoom >= 5}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Zoom in"
        >
          +
        </button>
      </div>

      {/* Timeline content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative pt-4"
        onWheel={handleWheel}
      >
        <div className="relative">
          {/* Hour grid - Full 24 hours */}
          {hours.map((hour) => {
            const is12h = hour > 12;
            const displayHour = hour === 0 ? 12 : (is12h ? hour - 12 : hour);
            const period = hour >= 12 ? 'pm' : 'am';

            return (
              <div
                key={hour}
                className="relative border-t border-gray-200"
                style={{ height: `${heightPerHour}px` }}
              >
                {/* Hour label */}
                <div className="absolute left-0 top-0 -mt-2 ml-2 text-xs text-gray-500">
                  {displayHour}:{String(0).padStart(2, '0')}
                  {period}
                </div>

                {/* Grid lines for quarters */}
                <div
                  className="absolute left-12 right-0 border-t border-gray-100"
                  style={{ top: `${heightPerHour * 0.25}px` }}
                />
                <div
                  className="absolute left-12 right-0 border-t border-gray-100"
                  style={{ top: `${heightPerHour * 0.5}px` }}
                />
                <div
                  className="absolute left-12 right-0 border-t border-gray-100"
                  style={{ top: `${heightPerHour * 0.75}px` }}
                />
              </div>
            );
          })}

          {/* Time blocks will be rendered here */}
          <div className="absolute inset-0 left-12">
            {/* Double-click overlay for creating records */}
            <div
              className="absolute inset-0 cursor-crosshair"
              onDoubleClick={handleDoubleClick}
            />
            
            {/* Render time blocks */}
            {records && tags && records.map(record => (
              <TimeBlock
                key={record.id}
                record={record}
                tags={tags}
                heightPerHour={heightPerHour}
                dayStart={dayStartTimestamp}
                onClick={() => handleBlockClick(record)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-yellow-100 text-xs text-gray-500 text-center">
        Double-click to create | Click to edit | Drag to move | Drag edges to resize
      </div>

      {/* Record Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(undefined);
        }}
        initialStartTime={modalStartTime}
        initialEndTime={modalEndTime}
        editRecord={editingRecord}
      />
    </div>
  );
}

export default Timeline;
