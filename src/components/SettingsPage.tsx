import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Tag, RecurringSchedule } from '@/types';
import ReminderSettings from './ReminderSettings';
import DataManagerModal from './DataManagerModal';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const LEISURE_GREEN = '#86EFAC'; // Light green color for leisure tags

const TAG_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
];

// Memoized editor component to prevent re-renders when tags update
const TagEditor = React.memo(({ 
  selectedTagId,
  editName,
  setEditName,
  editIsLeisure,
  setEditIsLeisure,
  editColor,
  setEditColor,
  editSubItems,
  setEditSubItems,
  editSchedules,
  setEditSchedules,
  handleAddSchedule,
  handleRemoveSchedule,
  handleScheduleChange,
  handleSave,
  handleCancel,
  handleDelete,
  dayNames
}: {
  selectedTagId: string;
  editName: string;
  setEditName: (v: string) => void;
  editIsLeisure: boolean;
  setEditIsLeisure: (v: boolean) => void;
  editColor: string;
  setEditColor: (v: string) => void;
  editSubItems: string;
  setEditSubItems: (v: string) => void;
  editSchedules: RecurringSchedule[];
  setEditSchedules: (v: RecurringSchedule[]) => void;
  handleAddSchedule: () => void;
  handleRemoveSchedule: (index: number) => void;
  handleScheduleChange: (index: number, field: keyof RecurringSchedule, value: string | number) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleDelete: () => void;
  dayNames: string[];
}) => {
  // Auto-focus on name input when editor opens
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    // Force focus with a slight delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (nameInputRef.current) {
        // First, focus the window to bring focus back to the page
        window.focus();
        // Then focus the input
        nameInputRef.current.focus();
        // Force selection to make cursor visible
        nameInputRef.current.select();
        // Move cursor to end
        const len = nameInputRef.current.value.length;
        nameInputRef.current.setSelectionRange(len, len);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [selectedTagId]);
  
  return (
    <div className="space-y-6">
      {/* Tag Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag Name
        </label>
        <input
          key={selectedTagId}  // Force re-mount when tag changes
          ref={nameInputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
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

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tag Color
        </label>
        <div className="grid grid-cols-8 gap-2">
          {TAG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setEditColor(color)}
              className={`w-10 h-10 rounded-full transition-all ${
                editColor === color 
                  ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
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
          Close
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-md transition-colors"
          style={{ 
            color: 'var(--text-primary)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="ml-auto px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete Tag
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
    prevProps.editColor === nextProps.editColor &&
    prevProps.editSubItems === nextProps.editSubItems &&
    JSON.stringify(prevProps.editSchedules) === JSON.stringify(nextProps.editSchedules)
  );
};

// Wrap with custom comparison
const MemoizedTagEditor = React.memo(TagEditor, arePropsEqual);

function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const tags = useLiveQuery(() => db.tags.toArray(), []);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [activeTab, setActiveTab] = useState<'tags' | 'reminders' | 'data'>('tags');
  const [editName, setEditName] = useState('');
  const [editIsLeisure, setEditIsLeisure] = useState(false);
  const [editColor, setEditColor] = useState(TAG_COLORS[0]);
  const [editSubItems, setEditSubItems] = useState('');
  const [editSchedules, setEditSchedules] = useState<RecurringSchedule[]>([]);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Force focus when modal opens
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      // Simulate a click on the modal to activate the window
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.click();
        }
      }, 10);
    }
  }, [isOpen]);

  const handleTagSelect = React.useCallback((tag: Tag) => {
    // If clicking the same tag, don't reset states (prevents losing focus)
    if (selectedTag?.id === tag.id) {
      return;
    }
    
    setSelectedTag(tag);
    setEditName(tag.name);
    setEditIsLeisure(tag.isLeisure ?? false);
    setEditColor(tag.color);
    setEditSubItems((tag.subItems || []).join('\n'));
    setEditSchedules(tag.recurringSchedules || []);
  }, [selectedTag]);

  // Auto-save whenever edit states change
  React.useEffect(() => {
    if (!selectedTag) return;

    const subItems = editSubItems
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const updateData: any = {
      name: editName,
      isLeisure: editIsLeisure,
      color: editColor,
      subItems,
      recurringSchedules: editSchedules,
    };

    // If marking as leisure and not already green, change to green
    if (editIsLeisure && editColor !== LEISURE_GREEN) {
      updateData.color = LEISURE_GREEN;
      setEditColor(LEISURE_GREEN);
    }

    db.tags.update(selectedTag.id, updateData);
  }, [selectedTag, editName, editIsLeisure, editColor, editSubItems, editSchedules]);

  const handleSave = React.useCallback(() => {
    // "Save Changes" now just closes the window since all changes are auto-saved
    onClose();
  }, [onClose]);

  const handleCancel = React.useCallback(() => {
    setSelectedTag(null);
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (!selectedTag) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${selectedTag.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    await db.tags.delete(selectedTag.id);
    setSelectedTag(null);
  }, [selectedTag]);

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
      <div 
        ref={modalRef}
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-5xl mx-4 h-[80vh] flex flex-col"
        style={{ 
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tags'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Tag Management
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'reminders'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Reminder Settings
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'data'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Data Management
          </button>
        </div>

        {/* Content */}
        {activeTab === 'tags' ? (
          <>
            {/* Body - Split view */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left side - Tag list */}
              <div className="w-1/3 border-r overflow-y-auto p-4" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Tags</h3>
                <div className="space-y-2">
                  {tags?.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagSelect(tag)}
                      className={`w-full text-left px-3 py-2 rounded transition-all ${
                        selectedTag?.id === tag.id
                          ? 'border-2 border-blue-500'
                          : 'border-2 border-transparent'
                      }`}
                      style={{
                        backgroundColor: selectedTag?.id === tag.id 
                          ? (document.documentElement.classList.contains('dark') ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff')
                          : 'var(--bg-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTag?.id !== tag.id) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTag?.id !== tag.id) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium">{tag.name}</span>
                        {tag.isLeisure && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{
                            backgroundColor: document.documentElement.classList.contains('dark') 
                              ? 'rgba(234, 179, 8, 0.2)' 
                              : '#fef9c3',
                            color: document.documentElement.classList.contains('dark')
                              ? '#fde047'
                              : '#a16207'
                          }}>
                            Leisure
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-1 space-x-2" style={{ color: 'var(--text-muted)' }}>
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
                    editColor={editColor}
                    setEditColor={setEditColor}
                    editSubItems={editSubItems}
                    setEditSubItems={setEditSubItems}
                    editSchedules={editSchedules}
                    setEditSchedules={setEditSchedules}
                    handleAddSchedule={handleAddSchedule}
                    handleRemoveSchedule={handleRemoveSchedule}
                    handleScheduleChange={handleScheduleChange}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                    handleDelete={handleDelete}
                    dayNames={dayNames}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
                    <div className="text-center">
                      <div className="text-4xl mb-2">←</div>
                      <div>Select a tag to edit</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t text-xs" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <strong>Tip:</strong> Fixed schedules automatically create time blocks. 
              Example: "Meal" on Monday-Friday 12:00-13:00 will appear on timeline every weekday at noon.
            </div>
          </>
        ) : activeTab === 'reminders' ? (
          <>
            {/* Reminder Settings Content */}
            <div className="flex-1 overflow-y-auto">
              <ReminderSettings />
            </div>
          </>
        ) : (
          <>
            {/* Data Management Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <DataManagerModal isOpen={true} onClose={() => {}} embedded={true} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
