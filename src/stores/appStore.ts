import { create } from 'zustand';
import { TimeRecord, Tag, Settings } from '@/types';
import { db } from '@/lib/db';

interface AppState {
  // Current date navigation
  currentDate: Date;
  currentWeekStart: Date;
  
  // Quick recording state (Alt+X)
  isQuickRecording: boolean;
  quickRecordStart: Date | null;
  
  // Timeline zoom (1-5 scale)
  timelineZoom: number;
  
  // Settings
  settings: Settings | null;
  
  // UI state
  showWeekExpanded: boolean;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setCurrentWeekStart: (date: Date) => void;
  setTimelineZoom: (zoom: number) => void;
  setShowWeekExpanded: (expanded: boolean) => void;
  
  // Quick recording actions (Alt+X)
  startQuickRecording: () => void;
  stopQuickRecording: () => Promise<void>;
  toggleQuickRecording: () => void;
  
  // Settings actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  currentWeekStart: new Date(),
  isQuickRecording: false,
  quickRecordStart: null,
  timelineZoom: 3, // Default zoom level
  settings: null,
  showWeekExpanded: false,
  
  // Date navigation
  setCurrentDate: (date) => set({ currentDate: date }),
  setCurrentWeekStart: (date) => set({ currentWeekStart: date }),
  
  // Timeline controls
  setTimelineZoom: (zoom) => set({ timelineZoom: Math.max(1, Math.min(5, zoom)) }),
  setShowWeekExpanded: (expanded) => set({ showWeekExpanded: expanded }),
  
  // Quick recording (Alt+X)
  startQuickRecording: () => {
    set({
      isQuickRecording: true,
      quickRecordStart: new Date(),
    });
    
    // Minimize to mini window
    if (window.electronAPI) {
      window.electronAPI.minimizeToMini();
    }
  },
  
  stopQuickRecording: async () => {
    const state = get();
    if (!state.isQuickRecording || !state.quickRecordStart) return;
    
    const endTime = new Date();
    const record: TimeRecord = {
      id: crypto.randomUUID(),
      description: 'Quick Record',
      startTime: state.quickRecordStart,
      endTime,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to database
    await db.records.add(record);
    
    // Reset recording state
    set({
      isQuickRecording: false,
      quickRecordStart: null,
    });
    
    // Restore main window and open edit modal
    if (window.electronAPI) {
      window.electronAPI.restoreFromMini();
    }
  },
  
  toggleQuickRecording: () => {
    const state = get();
    if (state.isQuickRecording) {
      state.stopQuickRecording();
    } else {
      state.startQuickRecording();
    }
  },
  
  // Settings
  loadSettings: async () => {
    const settings = await db.settings.toArray();
    if (settings.length > 0) {
      set({ settings: settings[0] });
    }
  },
  
  updateSettings: async (newSettings) => {
    const state = get();
    if (!state.settings) return;
    
    const updated = { ...state.settings, ...newSettings };
    await db.settings.update(1, updated);
    set({ settings: updated });
  },
}));
