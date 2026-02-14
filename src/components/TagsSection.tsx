import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function TagsSection() {
  const tags = useLiveQuery(() => db.tags.toArray(), []);

  const handleTagToggle = async (tagId: string) => {
    const tag = await db.tags.get(tagId);
    if (tag) {
      await db.tags.update(tagId, { isActive: !tag.isActive });
    }
  };

  if (!tags) return <div className="flex items-center justify-center h-full">Loading tags...</div>;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold mb-3">TAGS</h3>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => handleTagToggle(tag.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              tag.isActive
                ? 'text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
            style={{
              backgroundColor: tag.isActive ? tag.color : undefined,
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Click tags to toggle inclusion in statistics
      </div>
    </div>
  );
}

export default TagsSection;
