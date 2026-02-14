import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimizeToMini: () => ipcRenderer.invoke('window:minimize-to-mini'),
  restoreFromMini: () => ipcRenderer.invoke('window:restore-from-mini'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Shortcut listeners
  onToggleRecording: (callback: () => void) => {
    ipcRenderer.on('shortcut:toggle-recording', callback);
  },

  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  minimizeToMini: () => Promise<void>;
  restoreFromMini: () => Promise<void>;
  closeWindow: () => Promise<void>;
  onToggleRecording: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
