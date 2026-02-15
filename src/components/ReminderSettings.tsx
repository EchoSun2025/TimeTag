import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function ReminderSettings() {
  const settings = useLiveQuery(() => db.settings.get(1), []);
  
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [normalInterval, setNormalInterval] = useState(90);
  const [normalMessageMode, setNormalMessageMode] = useState<'random' | 'custom'>('random');
  const [normalCustomMessage, setNormalCustomMessage] = useState('');
  const [leisureInterval, setLeisureInterval] = useState(30);
  const [leisureMessageMode, setLeisureMessageMode] = useState<'random' | 'custom'>('random');
  const [leisureCustomMessage, setLeisureCustomMessage] = useState('');

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setReminderEnabled(settings.reminderEnabled ?? false);
      setNormalInterval(settings.normalInterval ?? 90);
      setNormalMessageMode(settings.normalMessageMode ?? 'random');
      setNormalCustomMessage(settings.normalCustomMessage ?? '');
      setLeisureInterval(settings.leisureInterval ?? 30);
      setLeisureMessageMode(settings.leisureMessageMode ?? 'random');
      setLeisureCustomMessage(settings.leisureCustomMessage ?? '');
    }
  }, [settings]);

  // Auto-save when settings change
  useEffect(() => {
    if (!settings) return;
    
    db.settings.update(1, {
      reminderEnabled,
      normalInterval,
      normalMessageMode,
      normalCustomMessage,
      leisureInterval,
      leisureMessageMode,
      leisureCustomMessage,
    });
  }, [settings, reminderEnabled, normalInterval, normalMessageMode, normalCustomMessage, leisureInterval, leisureMessageMode, leisureCustomMessage]);

  if (!settings) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Reminder Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure TTS voice reminders for work/leisure activities
        </p>
      </div>

      {/* Enable reminders toggle */}
      <div className="flex items-center gap-4 p-4 rounded-lg" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderColor: 'var(--border-color)'
      }}>
        <input
          type="checkbox"
          id="reminder-enabled"
          checked={reminderEnabled}
          onChange={(e) => setReminderEnabled(e.target.checked)}
          className="w-5 h-5 cursor-pointer"
        />
        <label htmlFor="reminder-enabled" className="flex-1 cursor-pointer">
          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Enable Voice Reminders</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Use TTS to remind you to take breaks or return to work
          </div>
        </label>
      </div>

      {/* Normal (Work/Study) tags settings */}
      <div className="rounded-lg p-6 space-y-4" style={{
        borderWidth: '1px',
        borderColor: 'var(--border-color)'
      }}>
        <div>
          <h3 className="text-lg font-semibold mb-1">Normal Tags (Work/Study)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reminders to take breaks during focused work sessions
          </p>
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reminder Interval (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="999"
            value={normalInterval}
            onChange={(e) => setNormalInterval(parseInt(e.target.value) || 90)}
            className="px-3 py-2 border rounded w-32"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          />
          <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            (Default: 90 minutes)
          </span>
        </div>

        {/* Message mode */}
        <div>
          <label className="block text-sm font-medium mb-2">Message Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={normalMessageMode === 'random'}
                onChange={() => setNormalMessageMode('random')}
                className="w-4 h-4"
              />
              <span>Random Messages</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={normalMessageMode === 'custom'}
                onChange={() => setNormalMessageMode('custom')}
                className="w-4 h-4"
              />
              <span>Custom Message</span>
            </label>
          </div>
        </div>

        {/* Custom message */}
        {normalMessageMode === 'custom' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Message
            </label>
            <textarea
              value={normalCustomMessage}
              onChange={(e) => setNormalCustomMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Time to take a break! Stretch and drink some water."
              className="w-full px-3 py-2 border rounded resize-none"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        )}

        {normalMessageMode === 'random' && (
          <div className="text-sm p-3 rounded" style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}>
            <strong>Random messages include:</strong> "Time for a break! Stretch and hydrate", 
            "Rest your eyes and move around", "Take a breather, you've been working hard", etc.
          </div>
        )}
      </div>

      {/* Leisure tags settings */}
      <div className="rounded-lg p-6 space-y-4" style={{
        borderWidth: '1px',
        borderColor: 'var(--border-color)'
      }}>
        <div>
          <h3 className="text-lg font-semibold mb-1">Leisure Tags</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reminders to return to productive activities during leisure time
          </p>
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Reminder Interval (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="999"
            value={leisureInterval}
            onChange={(e) => setLeisureInterval(parseInt(e.target.value) || 30)}
            className="px-3 py-2 border rounded w-32"
            style={{
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          />
          <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            (Default: 30 minutes)
          </span>
        </div>

        {/* Message mode */}
        <div>
          <label className="block text-sm font-medium mb-2">Message Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={leisureMessageMode === 'random'}
                onChange={() => setLeisureMessageMode('random')}
                className="w-4 h-4"
              />
              <span>Random Messages</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={leisureMessageMode === 'custom'}
                onChange={() => setLeisureMessageMode('custom')}
                className="w-4 h-4"
              />
              <span>Custom Message</span>
            </label>
          </div>
        </div>

        {/* Custom message */}
        {leisureMessageMode === 'custom' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Message
            </label>
            <textarea
              value={leisureCustomMessage}
              onChange={(e) => setLeisureCustomMessage(e.target.value)}
              rows={3}
              placeholder="e.g. Hey! Time to get back to work!"
              className="w-full px-3 py-2 border rounded resize-none"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        )}

        {leisureMessageMode === 'random' && (
          <div className="text-sm p-3 rounded" style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}>
            <strong>Random messages include:</strong> "Time to get back to work!", 
            "Break's over, let's be productive", "Ready to tackle some tasks?", etc.
            The tone gradually intensifies with each reminder.
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-lg p-4 text-sm" style={{
        backgroundColor: 'var(--bg-secondary)',
        borderWidth: '1px',
        borderColor: 'var(--border-color)',
        color: 'var(--text-secondary)'
      }}>
        <strong>How it works:</strong> Voice reminders will be announced using your system's TTS engine. 
        Reminders start automatically when you begin recording time. For leisure tags, the reminder frequency 
        increases to encourage you to return to productive activities.
      </div>
    </div>
  );
}

export default ReminderSettings;
