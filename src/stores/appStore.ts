import { create } from 'zustand';
import { TimeRecord, Tag, Settings } from '@/types';
import { db } from '@/lib/db';

interface AppState {
  // Current date navigation
  currentDate: Date;
  currentWeekStart: Date;
  
  // Recording state
  isRecording: boolean;
  currentRecordStart: Date | null;
  currentRecordDescription: string;
  currentRecordTags: string[];
  
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
  
  // Recording actions
  startRecording: (description: string, tags: string[]) => void;
  stopRecording: () => Promise<void>;
  toggleRecording: () => void;
  
  // Settings actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentDate: new Date(),
  currentWeekStart: new Date(),
  isRecording: false,
  currentRecordStart: null,
  currentRecordDescription: '',
  currentRecordTags: [],
  timelineZoom: 3, // Default zoom level
  settings: null,
  showWeekExpanded: false,
  
  // Date navigation
  setCurrentDate: (date) => set({ currentDate: date }),
  setCurrentWeekStart: (date) => set({ currentWeekStart: date }),
  
  // Timeline controls
  setTimelineZoom: (zoom) => set({ timelineZoom: Math.max(1, Math.min(5, zoom)) }),
  setShowWeekExpanded: (expanded) => set({ showWeekExpanded: expanded }),
  
  // Recording
  startRecording: (description, tags) => {
    set({
      isRecording: true,
      currentRecordStart: new Date(),
      currentRecordDescription: description,
      currentRecordTags: tags,
    });
    
    // Minimize to mini window
    if (window.electronAPI) {
      window.electronAPI.minimizeToMini();
    }
  },
  
  stopRecording: async () => {
    const state = get();
    if (!state.isRecording || !state.currentRecordStart) return;
    
    const endTime = new Date();
    const record: TimeRecord = {
      id: crypto.randomUUID(),
      description: state.currentRecordDescription,
      startTime: state.currentRecordStart,
      endTime,
      tags: state.currentRecordTags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to database
    await db.records.add(record);
    
    // Reset recording state
    set({
      isRecording: false,
      currentRecordStart: null,
      currentRecordDescription: '',
      currentRecordTags: [],
    });
    
    // Restore main window
    if (window.electronAPI) {
      window.electronAPI.restoreFromMini();
    }
  },
  
  toggleRecording: () => {
    const state = get();
    if (state.isRecording) {
      state.stopRecording();
    } else {
      // Open recording modal (to be implemented)
      console.log('Open recording modal');
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
