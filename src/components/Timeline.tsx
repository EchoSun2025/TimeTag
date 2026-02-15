import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import RecordModal from './RecordModal';
import TimeBlock from './TimeBlock';
import { TimeRecord } from '@/types';
import { calculateOverlappingLayout } from '@/lib/layout';
import { ensureFixedTimeRecords } from '@/lib/fixedSchedules';
import { isSameDay } from 'date-fns';
import { formatTime } from '@/lib/utils';

function Timeline() {
  const { timelineZoom, setTimelineZoom, currentDate, activeRecord } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState<Date | undefined>();
  const [modalEndTime, setModalEndTime] = useState<Date | undefined>();
  const [editingRecord, setEditingRecord] = useState<TimeRecord | undefined>();
  const [activeBlockNow, setActiveBlockNow] = useState<Date>(new Date());

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

  // Ensure fixed time records exist for current date
  useEffect(() => {
    if (tags && tags.length > 0) {
      // Ensure currentDate is a Date object (in case it was deserialized from storage)
      const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate);
      ensureFixedTimeRecords(dateObj, tags);
    }
  }, [currentDate, tags]);

  // Refresh active record placeholder every 15 minutes
  useEffect(() => {
    if (!activeRecord) return;

    // Set initial "now"
    setActiveBlockNow(new Date());

    // Refresh every 15 minutes (900,000ms)
    const interval = setInterval(() => {
      setActiveBlockNow(new Date());
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  // Check if active record is on the currently viewed day
  const activeRecordOnCurrentDay = useMemo(() => {
    if (!activeRecord) return false;
    const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const startTime = activeRecord.startTime instanceof Date ? activeRecord.startTime : new Date(activeRecord.startTime);
    return isSameDay(startTime, dateObj);
  }, [activeRecord, currentDate]);

  // Build a virtual record for the active recording (if on current day)
  const activeVirtualRecord: TimeRecord | null = useMemo(() => {
    if (!activeRecordOnCurrentDay || !activeRecord) return null;
    const startTime = activeRecord.startTime instanceof Date ? activeRecord.startTime : new Date(activeRecord.startTime);
    return {
      id: '__active__',
      description: activeRecord.description,
      startTime,
      endTime: activeBlockNow,
      tags: activeRecord.tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [activeRecordOnCurrentDay, activeRecord, activeBlockNow]);

  // Calculate overlapping layout including the active virtual record
  const recordsWithLayout = useMemo(() => {
    if (!records) return [];
    const allRecords = activeVirtualRecord ? [...records, activeVirtualRecord] : records;
    return calculateOverlappingLayout(allRecords);
  }, [records, activeVirtualRecord]);

  const handleZoomIn = () => {
    if (timelineZoom >= 5 || !containerRef.current) return;
    
    // Get viewport center
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const viewportHeight = rect.height;
    const centerY = scrollTop + viewportHeight / 2 - 16; // Subtract padding
    
    // Calculate the hour position at viewport center
    const oldHeightPerHour = baseHeightPerHour * timelineZoom;
    const centerHourPosition = centerY / oldHeightPerHour;
    
    // Calculate new height per hour
    const newZoom = timelineZoom + 1;
    const newHeightPerHour = baseHeightPerHour * newZoom;
    
    // Calculate new scroll position to keep center fixed
    const newCenterY = centerHourPosition * newHeightPerHour;
    const newScrollTop = newCenterY - viewportHeight / 2 + 16; // Add padding back
    
    // Update zoom
    setTimelineZoom(newZoom);
    
    // Update scroll position after render
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = newScrollTop;
      }
    }, 0);
  };

  const handleZoomOut = () => {
    if (timelineZoom <= 1 || !containerRef.current) return;
    
    // Get viewport center
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const viewportHeight = rect.height;
    const centerY = scrollTop + viewportHeight / 2 - 16; // Subtract padding
    
    // Calculate the hour position at viewport center
    const oldHeightPerHour = baseHeightPerHour * timelineZoom;
    const centerHourPosition = centerY / oldHeightPerHour;
    
    // Calculate new height per hour
    const newZoom = timelineZoom - 1;
    const newHeightPerHour = baseHeightPerHour * newZoom;
    
    // Calculate new scroll position to keep center fixed
    const newCenterY = centerHourPosition * newHeightPerHour;
    const newScrollTop = newCenterY - viewportHeight / 2 + 16; // Add padding back
    
    // Update zoom
    setTimelineZoom(newZoom);
    
    // Update scroll position after render
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = newScrollTop;
      }
    }, 0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.altKey && containerRef.current) {
      e.preventDefault();
      
      // Get mouse position relative to container
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop;
      const mouseY = e.clientY - rect.top + scrollTop - 16; // Subtract padding
      
      // Calculate the hour position at mouse cursor
      const oldHeightPerHour = baseHeightPerHour * timelineZoom;
      const mouseHourPosition = mouseY / oldHeightPerHour;
      
      // Change zoom
      let newZoom = timelineZoom;
      if (e.deltaY < 0) {
        newZoom = Math.min(timelineZoom + 1, 5);
      } else {
        newZoom = Math.max(timelineZoom - 1, 1);
      }
      
      if (newZoom !== timelineZoom) {
        // Calculate new height per hour
        const newHeightPerHour = baseHeightPerHour * newZoom;
        
        // Calculate new scroll position to keep mouse position fixed
        const newMouseY = mouseHourPosition * newHeightPerHour;
        const newScrollTop = newMouseY - (e.clientY - rect.top) + 16; // Add padding back
        
        // Update zoom
        setTimelineZoom(newZoom);
        
        // Update scroll position after a short delay to ensure render
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = newScrollTop;
          }
        }, 0);
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

  // Handle time block double-click to edit
  const handleBlockEdit = (record: TimeRecord) => {
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
            
            {/* Render time blocks with overlap support (skip the virtual active record) */}
            {recordsWithLayout && tags && recordsWithLayout.map(record => {
              // Render active record placeholder separately
              if (record.id === '__active__') {
                const startTime = activeRecord!.startTime instanceof Date ? activeRecord!.startTime : new Date(activeRecord!.startTime);
                const startMs = startTime.getTime();
                const nowMs = activeBlockNow.getTime();

                const startMinutes = (startMs - dayStartTimestamp) / (1000 * 60);
                const durationMinutes = Math.max((nowMs - startMs) / (1000 * 60), 15);
                const placeholderTop = (startMinutes / 60) * heightPerHour;
                const placeholderHeight = Math.max((durationMinutes / 60) * heightPerHour, 20);

                const tag = tags.find(t => t.id === activeRecord!.tags[0]);
                const tagColor = tag?.color || '#4285F4';
                const tagName = tag?.name || 'No Tag';

                const columnWidth = 100 / record.totalColumns;
                const leftPercent = record.column * columnWidth;

                return (
                  <div
                    key="__active__"
                    className="absolute px-1"
                    style={{
                      top: `${placeholderTop}px`,
                      height: `${placeholderHeight}px`,
                      left: `${leftPercent}%`,
                      width: `${columnWidth}%`,
                      zIndex: 5,
                    }}
                  >
                    <div
                      className="h-full rounded border-l-4 px-2 py-1 overflow-hidden animate-pulse"
                      style={{
                        backgroundColor: tagColor + '20',
                        borderColor: tagColor,
                        borderStyle: 'dashed',
                        borderLeftStyle: 'solid',
                      }}
                    >
                      <div className="text-xs font-medium opacity-60">
                        {formatTime(startTime)} - recording...
                      </div>
                      {placeholderHeight > 40 && (
                        <div className="text-sm font-medium mt-1 opacity-70">
                          {activeRecord!.description || 'No description'}
                        </div>
                      )}
                      {placeholderHeight > 60 && tag && (
                        <span
                          className="inline-block text-xs px-1.5 py-0.5 rounded-full text-white mt-1 opacity-70"
                          style={{ backgroundColor: tagColor }}
                        >
                          {tagName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <TimeBlock
                  key={record.id}
                  record={record}
                  tags={tags}
                  heightPerHour={heightPerHour}
                  dayStart={dayStartTimestamp}
                  onEdit={() => handleBlockEdit(record)}
                  column={record.column}
                  totalColumns={record.totalColumns}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-yellow-100 text-xs text-gray-500 text-center">
        Double-click empty space to create | Double-click block to edit | Drag to move | Drag edges to resize
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
