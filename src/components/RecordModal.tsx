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
    } else {
      // Reset for new record
      setDescription('');
      setSelectedTags([]);
      setCurrentSubItemIndex(0);
    }
  }, [editRecord, isOpen]);

  // Auto-fill first sub-item when tag is selected
  useEffect(() => {
    if (!editRecord && selectedTags.length > 0 && tags) {
      const tag = tags.find(t => t.id === selectedTags[0]);
      if (tag && tag.subItems.length > 0) {
        setDescription(tag.subItems[0]);
        setCurrentSubItemIndex(0);
      }
    }
  }, [selectedTags, tags, editRecord]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags([tagId]); // Only one tag at a time
    setFocusedTagIndex(-1);
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
    // Arrow left/right: cycle through sub-items when description is focused
    if (document.activeElement === descriptionRef.current && subItems.length > 0) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentSubItemIndex + 1) % subItems.length;
        setCurrentSubItemIndex(nextIndex);
        setDescription(subItems[nextIndex]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentSubItemIndex === 0 ? subItems.length - 1 : currentSubItemIndex - 1;
        setCurrentSubItemIndex(prevIndex);
        setDescription(subItems[prevIndex]);
      }
    }
    
    // Arrow up/down: navigate between description and tags
    if (e.key === 'ArrowDown' && document.activeElement === descriptionRef.current) {
      e.preventDefault();
      tagsContainerRef.current?.focus();
      if (tags && tags.length > 0) {
        setFocusedTagIndex(0);
      }
    } else if (e.key === 'ArrowUp' && document.activeElement === tagsContainerRef.current) {
      e.preventDefault();
      descriptionRef.current?.focus();
      setFocusedTagIndex(-1);
    }
    
    // Arrow left/right: navigate tags in tags container
    if (document.activeElement === tagsContainerRef.current && tags) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedTagIndex(prev => Math.min(prev + 1, tags.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedTagIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedTagIndex >= 0 && focusedTagIndex < tags.length) {
          handleTagToggle(tags[focusedTagIndex].id);
        }
      }
    }

    // Enter to save (from tags container only)
    if (e.key === 'Enter' && document.activeElement === tagsContainerRef.current) {
      e.preventDefault();
      handleSave();
    }

    // Ctrl+Enter to save from description
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    }

    // Escape to close
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
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {editRecord ? 'Edit Record' : 'New Record'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Tags - Top Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'text-white ring-2 ring-offset-2'
                      : 'bg-gray-200 text-gray-600'
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
            <div className="text-xs text-gray-400 mt-2">
              Use ↑ ↓ to navigate, ← → in tags area or Enter/Space to select
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
              {subItems.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          {/* Delete button on left (only when editing) */}
          {editRecord && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
          
          {/* Action buttons on right */}
          <div className={`flex items-center gap-3 ${!editRecord ? 'ml-auto' : ''}`}>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {editRecord ? 'Update' : 'Start Recording'}
            </button>
            <div className="text-xs text-gray-400">
              Ctrl+Enter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordModal;
