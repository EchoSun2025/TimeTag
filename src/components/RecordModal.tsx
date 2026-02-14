import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { TimeRecord } from '@/types';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStartTime?: Date;
  initialEndTime?: Date;
  editRecord?: TimeRecord;
}

function RecordModal({ isOpen, onClose, initialStartTime, initialEndTime, editRecord }: RecordModalProps) {
  const tags = useLiveQuery(() => db.tags.toArray(), []);
  
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [focusedTagIndex, setFocusedTagIndex] = useState(-1);
  
  const descriptionRef = React.useRef<HTMLInputElement>(null);
  const startTimeRef = React.useRef<HTMLInputElement>(null);
  const endTimeRef = React.useRef<HTMLInputElement>(null);
  const tagsContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editRecord) {
      setDescription(editRecord.description);
      setStartTime(formatDateTimeLocal(new Date(editRecord.startTime)));
      setEndTime(formatDateTimeLocal(new Date(editRecord.endTime)));
      setSelectedTags(editRecord.tags);
    } else if (initialStartTime && initialEndTime) {
      setStartTime(formatDateTimeLocal(initialStartTime));
      setEndTime(formatDateTimeLocal(initialEndTime));
    }
  }, [editRecord, initialStartTime, initialEndTime, isOpen]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!startTime || !endTime) return;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    const record: TimeRecord = {
      id: editRecord?.id || crypto.randomUUID(),
      description: description.trim() || 'Untitled',
      startTime: start,
      endTime: end,
      tags: selectedTags,
      createdAt: editRecord?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editRecord) {
      await db.records.update(editRecord.id, record);
    } else {
      await db.records.add(record);
    }

    handleClose();
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
    setStartTime('');
    setEndTime('');
    setSelectedTags([]);
    setFocusedTagIndex(-1);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Arrow up/down: navigate between fields
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (document.activeElement === descriptionRef.current) {
        startTimeRef.current?.focus();
      } else if (document.activeElement === startTimeRef.current) {
        endTimeRef.current?.focus();
      } else if (document.activeElement === endTimeRef.current) {
        tagsContainerRef.current?.focus();
        if (tags && tags.length > 0) {
          setFocusedTagIndex(0);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (document.activeElement === endTimeRef.current) {
        startTimeRef.current?.focus();
      } else if (document.activeElement === startTimeRef.current) {
        descriptionRef.current?.focus();
      } else if (document.activeElement === tagsContainerRef.current) {
        endTimeRef.current?.focus();
        setFocusedTagIndex(-1);
      }
    }
    
    // Arrow left/right: navigate tags
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

    // Enter to save (when not in tags container)
    if (e.key === 'Enter' && document.activeElement !== tagsContainerRef.current) {
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
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
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

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                ref={startTimeRef}
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                ref={endTimeRef}
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
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
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-600'
                  } ${
                    focusedTagIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                  }}
                  tabIndex={-1}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Use ← → arrows to navigate tags, Enter/Space to select
            </div>
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
              {editRecord ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordModal;
