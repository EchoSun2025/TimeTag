import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { TimeRecord } from '@/types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editRecord?: TimeRecord;
  onStartRecording?: (description: string, tags: string[]) => void;
}

function RecordModal({ isOpen, onClose, editRecord, onStartRecording }: RecordModalProps) {
  const tags = useLiveQuery(() => db.tags.toArray(), []);
  
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [focusedTagIndex, setFocusedTagIndex] = useState(-1);
  const [currentSubItemIndex, setCurrentSubItemIndex] = useState(0);
  
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const tagsContainerRef = React.useRef<HTMLDivElement>(null);

  // Get selected tag's sub-items
  const selectedTag = tags?.find(t => selectedTags.includes(t.id));
  const subItems = selectedTag?.subItems || [];

  useEffect(() => {
    if (editRecord) {
      setDescription(editRecord.description);
      setSelectedTags(editRecord.tags);
      setFocusedTagIndex(-1);
    } else if (isOpen) {
      // Reset for new record
      setDescription('');
      setSelectedTags([]);
      setCurrentSubItemIndex(0);
      setFocusedTagIndex(-1);
    }
  }, [editRecord, isOpen]);

  // Auto-select first tag for new records
  useEffect(() => {
    if (!editRecord && isOpen && tags && tags.length > 0) {
      // Check if we need to auto-select (only when no tag is selected)
      setSelectedTags(prev => {
        if (prev.length === 0) {
          setFocusedTagIndex(0);
          // Focus on tags container after a short delay
          setTimeout(() => {
            tagsContainerRef.current?.focus();
          }, 100);
          return [tags[0].id];
        }
        return prev;
      });
    }
  }, [editRecord, isOpen, tags]);

  // Auto-fill first sub-item when tag is selected
  useEffect(() => {
    if (!editRecord && selectedTags.length > 0 && tags && tags.length > 0) {
      const tag = tags.find(t => t.id === selectedTags[0]);
      if (tag && tag.subItems && tag.subItems.length > 0) {
        setDescription(tag.subItems[0]);
        setCurrentSubItemIndex(0);
      } else {
        setDescription('');
      }
    }
  }, [selectedTags, tags, editRecord]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags([tagId]); // Only one tag at a time
    // Don't reset focusedTagIndex, keep current focus position
  };

  const handleSave = async () => {
    if (editRecord) {
      // Update existing record
      await db.records.update(editRecord.id, {
        description: description.trim() || 'Untitled',
        tags: selectedTags,
        updatedAt: new Date(),
      });
      handleClose();
    } else if (onStartRecording) {
      // Start new recording
      onStartRecording(description.trim() || 'Untitled', selectedTags);
      
      // Save description to tag's sub-items if not empty and not already exists
      if (description.trim() && selectedTags.length > 0) {
        const tag = tags?.find(t => t.id === selectedTags[0]);
        if (tag && !tag.subItems.includes(description.trim())) {
          await db.tags.update(tag.id, {
            subItems: [description.trim(), ...tag.subItems],
          });
        }
      }
      
      handleClose();
    }
  };

  const handleDelete = async () => {
    if (!editRecord) return;
    if (confirm('Delete this record?')) {
      await db.records.delete(editRecord.id);
      handleClose();
    }
  };

  const handleClose = () => {
    setDescription('');
    setSelectedTags([]);
    setFocusedTagIndex(-1);
    setCurrentSubItemIndex(0);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // In tags container
    if (document.activeElement === tagsContainerRef.current && tags) {
      const TAGS_PER_ROW = 9; // Typically 9 tags fit per row
      
      // Arrow up/down/left/right: navigate tags (2D grid)
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        
        // Handle case when no tag is focused yet
        if (focusedTagIndex === -1) {
          setFocusedTagIndex(0);
          return;
        }
        
        // Move down to next row (±9 for 9-column layout)
        const nextIndex = focusedTagIndex + TAGS_PER_ROW;
        if (nextIndex < tags.length) {
          setFocusedTagIndex(nextIndex);
        } else {
          // If would go past end, check if we're on the last row
          const currentRow = Math.floor(focusedTagIndex / TAGS_PER_ROW);
          const totalRows = Math.ceil(tags.length / TAGS_PER_ROW);
          const lastRow = totalRows - 1;
          
          if (currentRow === lastRow) {
            // Already on last row, move to description
            descriptionRef.current?.focus();
          } else {
            // Not on last row yet, jump to last tag
            setFocusedTagIndex(tags.length - 1);
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        
        // Handle case when no tag is focused yet
        if (focusedTagIndex === -1) {
          setFocusedTagIndex(0);
          return;
        }
        
        // Move up to previous row
        const prevIndex = focusedTagIndex - TAGS_PER_ROW;
        if (prevIndex >= 0) {
          setFocusedTagIndex(prevIndex);
        } else {
          // If would go negative, jump to first tag
          setFocusedTagIndex(0);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedTagIndex(prev => Math.min(prev + 1, tags.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedTagIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === ' ') {
        // Space: Select tag and stay in tags
        e.preventDefault();
        if (focusedTagIndex >= 0 && focusedTagIndex < tags.length) {
          handleTagToggle(tags[focusedTagIndex].id);
        }
      } else if (e.key === 'Enter') {
        // Enter: Start recording directly
        e.preventDefault();
        handleSave();
      }
      return; // Exit early for tags container
    }
    
    // In description input
    if (document.activeElement === descriptionRef.current) {
      // Arrow left/right: cycle through sub-items (if available)
      if (subItems.length > 0) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (currentSubItemIndex + 1) % subItems.length;
          setCurrentSubItemIndex(nextIndex);
          setDescription(subItems[nextIndex]);
          return;
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = currentSubItemIndex === 0 ? subItems.length - 1 : currentSubItemIndex - 1;
          setCurrentSubItemIndex(prevIndex);
          setDescription(subItems[prevIndex]);
          return;
        }
      }
      
      // Arrow up: move to tags
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        tagsContainerRef.current?.focus();
        if (focusedTagIndex === -1 && tags && tags.length > 0) {
          setFocusedTagIndex(0);
        }
        return;
      }
      
      // Arrow down: move to tags
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        tagsContainerRef.current?.focus();
        if (focusedTagIndex === -1 && tags && tags.length > 0) {
          setFocusedTagIndex(0);
        }
        return;
      }
      
      // Enter: Start recording (no need for Ctrl)
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
        return;
      }
    }

    // Escape to close (works from anywhere)
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4" 
        style={{ color: 'var(--text-primary)' }}
        onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-semibold">
            {editRecord ? 'Edit Record' : 'New Record'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Tags - Top Priority */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Tag
            </label>
            <div 
              ref={tagsContainerRef}
              className="flex flex-wrap gap-2 outline-none"
              tabIndex={0}
            >
              {tags?.map((tag, index) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    handleTagToggle(tag.id);
                    setFocusedTagIndex(index);
                    // Ensure focus returns to tags container
                    setTimeout(() => {
                      tagsContainerRef.current?.focus();
                    }, 0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'text-white ring-2 ring-offset-2'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  } ${
                    focusedTagIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                    borderColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                  }}
                  tabIndex={-1}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Use ↑ ↓ ← → to navigate tags, Space to select, Enter to start recording
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description
              {subItems.length > 0 && (
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                  (Use ← → to cycle through {subItems.length} saved items)
                </span>
              )}
            </label>
            <input
              ref={descriptionRef}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              style={{ 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          {/* Delete button on left (only when editing) */}
          {editRecord && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
          
          {/* Action buttons on right */}
          <div className={`flex items-center gap-3 ${!editRecord ? 'ml-auto' : ''}`}>
            <button
              onClick={handleClose}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {editRecord ? 'Update' : 'Start Recording'}
            </button>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Enter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordModal;
