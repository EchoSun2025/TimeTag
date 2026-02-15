import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TimeRecord, Tag, Settings, ActiveRecord } from '@/types';
import { db } from '@/lib/db';

interface AppState {
  // Current date navigation
  currentDate: Date;
  currentWeekStart: Date;
  
  // Active recording state
  activeRecord: ActiveRecord | null;
  
  // Timeline zoom (1-5 scale)
  timelineZoom: number;
  
  // Settings
  settings: Settings | null;
  
  // UI state
  showWeekExpanded: boolean;
  isMiniMode: boolean;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setCurrentWeekStart: (date: Date) => void;
  setTimelineZoom: (zoom: number) => void;
  setShowWeekExpanded: (expanded: boolean) => void;
  setMiniMode: (mini: boolean) => void;
  
  // Recording actions
  startRecording: (description: string, tags: string[]) => void;
  stopRecording: () => Promise<void>;
  
  // Settings actions
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentDate: new Date(),
      currentWeekStart: new Date(),
      activeRecord: null,
      timelineZoom: 3, // Default zoom level
      settings: null,
      showWeekExpanded: false,
      isMiniMode: false,
      
      // Date navigation
      setCurrentDate: (date) => set({ currentDate: date }),
      setCurrentWeekStart: (date) => set({ currentWeekStart: date }),
      
      // Timeline controls
      setTimelineZoom: (zoom) => set({ timelineZoom: Math.max(1, Math.min(5, zoom)) }),
      setShowWeekExpanded: (expanded) => set({ showWeekExpanded: expanded }),
      setMiniMode: (mini) => set({ isMiniMode: mini }),
      
      // Recording
      startRecording: (description, tags) => {
        const activeRecord: ActiveRecord = {
          id: crypto.randomUUID(),
          description,
          startTime: new Date(),
          tags,
        };
        
        set({ activeRecord, isMiniMode: true });
        
        // Switch to mini window
        if (window.electronAPI) {
          window.electronAPI.minimizeToMini();
        }
      },
      
      stopRecording: async () => {
        const state = get();
        if (!state.activeRecord) return;
        
        const endTime = new Date();
        const record: TimeRecord = {
          id: state.activeRecord.id,
          description: state.activeRecord.description,
          startTime: state.activeRecord.startTime,
          endTime,
          tags: state.activeRecord.tags,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        try {
          // Use put instead of add to allow overwriting if exists
          await db.records.put(record);
        } catch (error) {
          console.error('Failed to save record:', error);
        }
        
        // Reset recording state regardless of save success
        set({ activeRecord: null, isMiniMode: false });
        
        // Restore main window
        if (window.electronAPI) {
          window.electronAPI.restoreFromMini();
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
    }),
    {
      name: 'timetag-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          try {
            const parsed = JSON.parse(str);
            // Convert startTime string back to Date
            if (parsed.state?.activeRecord?.startTime) {
              parsed.state.activeRecord.startTime = new Date(parsed.state.activeRecord.startTime);
            }
            return parsed;
          } catch (e) {
            return null;
          }
        },
        setItem: (name, value) => {
          // Convert Date to string before saving
          const toSave = {
            ...value,
            state: {
              ...value.state,
              activeRecord: value.state.activeRecord ? {
                ...value.state.activeRecord,
                startTime: value.state.activeRecord.startTime instanceof Date 
                  ? value.state.activeRecord.startTime.toISOString()
                  : value.state.activeRecord.startTime,
              } : null,
            },
          };
          localStorage.setItem(name, JSON.stringify(toSave));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        // Only persist activeRecord and isMiniMode
        activeRecord: state.activeRecord,
        isMiniMode: state.isMiniMode,
      }),
    }
  )
);
