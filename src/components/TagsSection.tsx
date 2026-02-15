import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import TagModal from './TagModal';

function TagsSection() {
  const tags = useLiveQuery(() => db.tags.toArray(), []);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const handleTagToggle = async (tagId: string) => {
    const tag = await db.tags.get(tagId);
    if (tag) {
      await db.tags.update(tagId, { isActive: !tag.isActive });
    }
  };

  if (!tags) return <div className="flex items-center justify-center h-full">Loading tags...</div>;

  // Sort tags: leisure tags first
  const sortedTags = [...tags].sort((a, b) => {
    if (a.isLeisure && !b.isLeisure) return -1;
    if (!a.isLeisure && b.isLeisure) return 1;
    return 0;
  });

  return (
    <>
      <div className="flex items-center gap-4 h-full">
        <h3 className="text-sm font-semibold whitespace-nowrap">TAGS</h3>
        
        <div className="flex flex-wrap gap-2 flex-1">
          {sortedTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagToggle(tag.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                tag.isActive
                  ? (tag.isLeisure ? 'text-gray-500' : 'text-white')
                  : 'bg-gray-200 text-gray-400'
              }`}
              style={{
                backgroundColor: tag.isActive ? tag.color : undefined,
              }}
            >
              {tag.name}
            </button>
          ))}
          
          {/* Add tag button */}
          <button
            onClick={() => setIsTagModalOpen(true)}
            className="px-3 py-1.5 rounded-full text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all border border-dashed border-gray-300"
            title="Add new tag"
          >
            + New Tag
          </button>
        </div>
        
        <div className="text-xs text-gray-500 whitespace-nowrap ml-auto">
          Click tags to toggle inclusion in statistics
        </div>
      </div>

      <TagModal 
        isOpen={isTagModalOpen} 
        onClose={() => setIsTagModalOpen(false)} 
      />
    </>
  );
}

export default TagsSection;
