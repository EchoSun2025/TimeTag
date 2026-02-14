import React from 'react';
import { useAppStore } from '@/stores/appStore';

function Timeline() {
  const { timelineZoom, setTimelineZoom } = useAppStore();

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

  // Generate hour labels from 8am to 9pm (default view)
  const startHour = 8;
  const endHour = 21;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Calculate height based on zoom (zoom 1-5, base 40px per hour)
  const baseHeightPerHour = 40;
  const heightPerHour = baseHeightPerHour * timelineZoom;

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
        className="flex-1 overflow-y-auto scrollbar-hide relative pt-4"
        onWheel={handleWheel}
      >
        <div className="relative">
          {/* Hour grid */}
          {hours.map((hour) => {
            const is12h = hour > 12;
            const displayHour = is12h ? hour - 12 : hour;
            const period = hour >= 12 ? 'pm' : 'am';

            return (
              <div
                key={hour}
                className="relative border-t border-gray-200"
                style={{ height: `${heightPerHour}px` }}
              >
                {/* Hour label */}
                <div className="absolute left-0 top-0 -mt-2 ml-2 text-xs text-gray-500">
                  {displayHour === 0 ? 12 : displayHour}:{String(0).padStart(2, '0')}
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
            {/* Placeholder for double-click to create */}
            <div
              className="absolute inset-0 cursor-crosshair"
              onDoubleClick={(e) => {
                console.log('Double click to create record', e);
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-yellow-100 text-xs text-gray-500 text-center">
        Double-click to create record | Alt + Wheel to zoom
      </div>
    </div>
  );
}

export default Timeline;
