import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Tag, RecurringSchedule } from '@/types';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEISURE_GREEN = '#86EFAC'; // Light green color for leisure tags

// Memoized editor component to prevent re-renders when tags update
const TagEditor = React.memo(({ 
  selectedTagId,
  editName,
  setEditName,
  editIsLeisure,
  setEditIsLeisure,
  editSubItems,
  setEditSubItems,
  editSchedules,
  setEditSchedules,
  handleAddSchedule,
  handleRemoveSchedule,
  handleScheduleChange,
  handleSave,
  handleCancel,
  dayNames
}: {
  selectedTagId: string;
  editName: string;
  setEditName: (v: string) => void;
  editIsLeisure: boolean;
  setEditIsLeisure: (v: boolean) => void;
  editSubItems: string;
  setEditSubItems: (v: string) => void;
  editSchedules: RecurringSchedule[];
  setEditSchedules: (v: RecurringSchedule[]) => void;
  handleAddSchedule: () => void;
  handleRemoveSchedule: (index: number) => void;
  handleScheduleChange: (index: number, field: keyof RecurringSchedule, value: string | number) => void;
  handleSave: () => void;
  handleCancel: () => void;
  dayNames: string[];
}) => {
  console.log('🎨 TagEditor rendered', { selectedTagId, editName, timestamp: new Date().toISOString() });
  
  // Auto-focus on name input when editor opens
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    console.log('🎯 TagEditor mounted/updated, attempting to focus', { selectedTagId });
    
    // Delay focus to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        console.log('✅ Focus set on name input', {
          hasFocus: document.activeElement === nameInputRef.current,
          activeElement: document.activeElement?.tagName,
          activeElementClass: document.activeElement?.className
        });
        
        // Check again after 100ms to see if focus was stolen
        setTimeout(() => {
          console.log('🔍 Focus check after 100ms:', {
            stillHasFocus: document.activeElement === nameInputRef.current,
            activeElement: document.activeElement?.tagName,
            inputElement: nameInputRef.current?.tagName
          });
        }, 100);
      } else {
        console.log('❌ nameInputRef.current is null');
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [selectedTagId]); // Re-focus when tag changes
  
  return (
    <div className="space-y-6">
      {/* Tag Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag Name
        </label>
        <input
          ref={nameInputRef}
          type="text"
          value={editName}
          onChange={(e) => {
            console.log('✏️ Input changed:', e.target.value);
            setEditName(e.target.value);
          }}
          onFocus={() => console.log('📌 Name input received focus event')}
          onBlur={() => console.log('💨 Name input lost focus event (blur)')}
          onClick={() => console.log('🖱️ Input clicked')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Leisure Tag Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={editIsLeisure}
            onChange={(e) => setEditIsLeisure(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div>
            <div className="font-medium text-gray-700">Leisure Tag</div>
            <div className="text-sm text-gray-500">
              Leisure tags are not counted in total hours and will be light green
            </div>
          </div>
        </label>
      </div>

      {/* Sub-items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub-items
          <span className="text-xs text-gray-400 ml-2">
            (One per line)
          </span>
        </label>
        <textarea
          value={editSubItems}
          onChange={(e) => setEditSubItems(e.target.value)}
          placeholder="e.g., for 'Work' tag:&#10;Can's work&#10;FX work&#10;Art work"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>

      {/* Recurring Schedules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Fixed Time Schedules
          </label>
          <button
            onClick={handleAddSchedule}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Add Schedule
          </button>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          Automatically create time blocks for this tag on specific days
        </div>

        <div className="space-y-3">
          {editSchedules.map((schedule, index) => (
            <div key={index} className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={schedule.dayOfWeek}
                  onChange={(e) => handleScheduleChange(index, 'dayOfWeek', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {dayNames.map((day, i) => (
                    <option key={i} value={i}>{day}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  max="23"
                  value={schedule.startHour}
                  onChange={(e) => handleScheduleChange(index, 'startHour', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={schedule.startMinute}
                  onChange={(e) => handleScheduleChange(index, 'startMinute', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />

                <span className="text-gray-500">to</span>

                <input
                  type="number"
                  min="0"
                  max="23"
                  value={schedule.endHour}
                  onChange={(e) => handleScheduleChange(index, 'endHour', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span>:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={schedule.endMinute}
                  onChange={(e) => handleScheduleChange(index, 'endMinute', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                />

                <button
                  onClick={() => handleRemoveSchedule(index)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <div className="text-xs text-gray-600">
                {dayNames[schedule.dayOfWeek]} {String(schedule.startHour).padStart(2, '0')}:{String(schedule.startMinute).padStart(2, '0')} - {String(schedule.endHour).padStart(2, '0')}:{String(schedule.endMinute).padStart(2, '0')}
              </div>
            </div>
          ))}

          {editSchedules.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-4">
              No fixed schedules. Click "+ Add Schedule" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
});

// Custom comparison function - only compare value props, not function props
TagEditor.displayName = 'TagEditor';
const arePropsEqual = (
  prevProps: any,
  nextProps: any
) => {
  // Only compare the actual data, not the functions
  return (
    prevProps.selectedTagId === nextProps.selectedTagId &&
    prevProps.editName === nextProps.editName &&
    prevProps.editIsLeisure === nextProps.editIsLeisure &&
    prevProps.editSubItems === nextProps.editSubItems &&
    JSON.stringify(prevProps.editSchedules) === JSON.stringify(nextProps.editSchedules)
  );
};

// Wrap with custom comparison
const MemoizedTagEditor = React.memo(TagEditor, arePropsEqual);

function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const tags = useLiveQuery(() => db.tags.toArray(), []);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsLeisure, setEditIsLeisure] = useState(false);
  const [editSubItems, setEditSubItems] = useState('');
  const [editSchedules, setEditSchedules] = useState<RecurringSchedule[]>([]);

  // DEBUG: Track re-renders
  React.useEffect(() => {
    console.log('🔄 SettingsPage rendered', {
      selectedTagId: selectedTag?.id,
      selectedTagName: selectedTag?.name,
      editName,
      tagsCount: tags?.length,
      timestamp: new Date().toISOString()
    });
  });

  // DEBUG: Track tags changes
  React.useEffect(() => {
    console.log('📦 Tags updated from DB', {
      count: tags?.length,
      tags: tags?.map(t => ({ id: t.id, name: t.name })),
      timestamp: new Date().toISOString()
    });
  }, [tags]);

  // DEBUG: Track selectedTag changes
  React.useEffect(() => {
    console.log('🎯 SelectedTag changed', {
      id: selectedTag?.id,
      name: selectedTag?.name,
      objectRef: selectedTag,
      timestamp: new Date().toISOString()
    });
  }, [selectedTag]);

  const handleTagSelect = React.useCallback((tag: Tag) => {
    console.log('👆 handleTagSelect called', { tagId: tag.id, tagName: tag.name, currentSelectedId: selectedTag?.id });
    
    // If clicking the same tag, don't reset states (prevents losing focus)
    if (selectedTag?.id === tag.id) {
      console.log('⏭️ Same tag selected, skipping state reset');
      return;
    }
    
    setSelectedTag(tag);
    setEditName(tag.name);
    setEditIsLeisure(tag.isLeisure ?? false);
    setEditSubItems((tag.subItems || []).join('\n'));
    setEditSchedules(tag.recurringSchedules || []);
  }, [selectedTag]);

  const handleSave = React.useCallback(async () => {
    console.log('💾 handleSave called', {
      selectedTagId: selectedTag?.id,
      editName,
      timestamp: new Date().toISOString()
    });
    
    if (!selectedTag) return;

    const subItems = editSubItems
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Auto-change color to light green if marking as leisure
    const updateData: any = {
      name: editName,
      isLeisure: editIsLeisure,
      subItems,
      recurringSchedules: editSchedules,
    };

    // If marking as leisure, change color to light green
    if (editIsLeisure && selectedTag.color !== LEISURE_GREEN) {
      updateData.color = LEISURE_GREEN;
    }

    await db.tags.update(selectedTag.id, updateData);
    console.log('✅ Save completed', { tagId: selectedTag.id, updateData });
    // Don't update any local state - keep everything as is to maintain focus
  }, [selectedTag, editName, editIsLeisure, editSubItems, editSchedules]);

  const handleCancel = React.useCallback(() => {
    setSelectedTag(null);
  }, []);

  const handleAddSchedule = React.useCallback(() => {
    setEditSchedules([
      ...editSchedules,
      {
        dayOfWeek: 1, // Monday
        startHour: 12,
        startMinute: 0,
        endHour: 13,
        endMinute: 0,
      },
    ]);
  }, [editSchedules]);

  const handleRemoveSchedule = React.useCallback((index: number) => {
    setEditSchedules(editSchedules.filter((_, i) => i !== index));
  }, [editSchedules]);

  const handleScheduleChange = React.useCallback((
    index: number,
    field: keyof RecurringSchedule,
    value: string | number
  ) => {
    const updated = [...editSchedules];
    // Handle both string and number inputs
    const numValue = typeof value === 'string' ? (value === '' ? 0 : parseInt(value)) : value;
    updated[index] = { ...updated[index], [field]: isNaN(numValue) ? 0 : numValue };
    setEditSchedules(updated);
  }, [editSchedules]);

  const dayNames = React.useMemo(() => 
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">Settings - Tag Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body - Split view */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left side - Tag list */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags</h3>
            <div className="space-y-2">
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag)}
                  className={`w-full text-left px-3 py-2 rounded transition-all ${
                    selectedTag?.id === tag.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                    {tag.isLeisure && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                        Leisure
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 space-x-2">
                    {tag.subItems && tag.subItems.length > 0 && (
                      <span>{tag.subItems.length} sub-items</span>
                    )}
                    {tag.recurringSchedules && tag.recurringSchedules.length > 0 && (
                      <span>• {tag.recurringSchedules.length} schedules</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Tag editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTag ? (
              <MemoizedTagEditor
                selectedTagId={selectedTag.id}
                editName={editName}
                setEditName={setEditName}
                editIsLeisure={editIsLeisure}
                setEditIsLeisure={setEditIsLeisure}
                editSubItems={editSubItems}
                setEditSubItems={setEditSubItems}
                editSchedules={editSchedules}
                setEditSchedules={setEditSchedules}
                handleAddSchedule={handleAddSchedule}
                handleRemoveSchedule={handleRemoveSchedule}
                handleScheduleChange={handleScheduleChange}
                handleSave={handleSave}
                handleCancel={handleCancel}
                dayNames={dayNames}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">←</div>
                  <div>Select a tag to edit</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
          <strong>Tip:</strong> Fixed schedules automatically create time blocks. 
          Example: "Meal" on Monday-Friday 12:00-13:00 will appear on timeline every weekday at noon.
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
