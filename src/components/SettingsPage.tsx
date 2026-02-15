import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Tag } from '@/types';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const tags = useLiveQuery(() => db.tags.toArray(), []);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsLeisure, setEditIsLeisure] = useState(false);
  const [editSubItems, setEditSubItems] = useState('');

  const handleTagSelect = (tag: Tag) => {
    setSelectedTag(tag);
    setEditName(tag.name);
    setEditIsLeisure(tag.isLeisure);
    setEditSubItems(tag.subItems.join('\n'));
  };

  const handleSave = async () => {
    if (!selectedTag) return;

    const subItems = editSubItems
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    await db.tags.update(selectedTag.id, {
      name: editName,
      isLeisure: editIsLeisure,
      subItems,
    });

    setSelectedTag(null);
  };

  const handleCancel = () => {
    setSelectedTag(null);
  };

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
                  {tag.subItems.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {tag.subItems.length} sub-items
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Tag editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTag ? (
              <div className="space-y-6">
                {/* Tag Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Name
                  </label>
                  <input
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
                        Leisure tags are not counted in total hours
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
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    These items appear when you select this tag in a new record.
                    Use ← → arrows to cycle through them.
                    New descriptions are automatically added here.
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
          <strong>Tip:</strong> Set frequently used activities as sub-items for quick access.
          For example, "Work" tag can have sub-items like "Client meeting", "Code review", "Documentation".
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
