/**
 * Context Flow - Preload Script
 * Secure bridge between main and renderer
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { 
  ContextSnapshot, 
  ContextSummary, 
  ContextSuggestion,
  Folder,
  ContextTemplate,
  ContextDiff,
  TimerSession
} from '../../../../core/types';

export interface ContextFlowAPI {
  // Context operations
  captureContext: (name?: string) => Promise<{ success: boolean; snapshot?: ContextSnapshot; error?: string }>;
  restoreContext: (id: string) => Promise<{ success: boolean; error?: string }>;
  getContexts: () => Promise<ContextSummary[]>;
  getContext: (id: string) => Promise<ContextSnapshot | null>;
  deleteContext: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Folders
  getFolders: () => Promise<Folder[]>;
  createFolder: (name: string, emoji?: string, color?: string) => Promise<Folder>;
  addToFolder: (contextId: string, folderId: string) => Promise<{ success: boolean }>;
  getOrganizedContexts: () => Promise<Map<string, ContextSummary[]>>;
  
  // Timer
  getTimerSession: () => Promise<TimerSession | null>;
  getTimerDuration: () => Promise<number>;
  getDailyProgress: () => Promise<{ current: number; goal: number; percentage: number }>;
  
  // Diff
  compareContexts: (idA: string, idB: string) => Promise<ContextDiff | null>;
  
  // Templates
  getTemplates: () => Promise<ContextTemplate[]>;
  applyTemplate: (templateId: string) => Promise<{ success: boolean }>;
  
  // Focus Mode
  toggleFocusMode: () => Promise<{ isFocused: boolean }>;
  getFocusStatus: () => Promise<{ isFocused: boolean; elapsed: number }>;
  
  // Import/Export
  exportContexts: () => Promise<string>;
  importContexts: (json: string) => Promise<{ success: boolean; imported: number; failed: number; errors: string[] }>;
  
  // AI
  getSuggestions: () => Promise<ContextSuggestion[]>;
  
  // Event listeners
  onContextSaved: (callback: (snapshot: ContextSnapshot) => void) => void;
  onContextRestored: (callback: (snapshot: ContextSnapshot) => void) => void;
  onFocusModeChanged: (callback: (isFocused: boolean) => void) => void;
  removeAllListeners: () => void;
}

const api: ContextFlowAPI = {
  // Context
  captureContext: (name?: string) => 
    ipcRenderer.invoke('capture-context', name),
  restoreContext: (id: string) => 
    ipcRenderer.invoke('restore-context', id),
  getContexts: () => 
    ipcRenderer.invoke('get-contexts'),
  getContext: (id: string) => 
    ipcRenderer.invoke('get-context', id),
  deleteContext: (id: string) => 
    ipcRenderer.invoke('delete-context', id),
  
  // Folders
  getFolders: () => 
    ipcRenderer.invoke('get-folders'),
  createFolder: (name: string, emoji?: string, color?: string) => 
    ipcRenderer.invoke('create-folder', name, emoji, color),
  addToFolder: (contextId: string, folderId: string) => 
    ipcRenderer.invoke('add-to-folder', contextId, folderId),
  getOrganizedContexts: () => 
    ipcRenderer.invoke('get-organized-contexts'),
  
  // Timer
  getTimerSession: () => 
    ipcRenderer.invoke('get-timer-session'),
  getTimerDuration: () => 
    ipcRenderer.invoke('get-timer-duration'),
  getDailyProgress: () => 
    ipcRenderer.invoke('get-daily-progress'),
  
  // Diff
  compareContexts: (idA: string, idB: string) => 
    ipcRenderer.invoke('compare-contexts', idA, idB),
  
  // Templates
  getTemplates: () => 
    ipcRenderer.invoke('get-templates'),
  applyTemplate: (templateId: string) => 
    ipcRenderer.invoke('apply-template', templateId),
  
  // Focus
  toggleFocusMode: () => 
    ipcRenderer.invoke('toggle-focus-mode'),
  getFocusStatus: () => 
    ipcRenderer.invoke('get-focus-status'),
  
  // Import/Export
  exportContexts: () => 
    ipcRenderer.invoke('export-contexts'),
  importContexts: (json: string) => 
    ipcRenderer.invoke('import-contexts', json),
  
  // Suggestions
  getSuggestions: () => 
    ipcRenderer.invoke('get-suggestions'),
  
  // Listeners
  onContextSaved: (callback) => {
    ipcRenderer.on('context-saved', (_, snapshot) => callback(snapshot));
  },
  onContextRestored: (callback) => {
    ipcRenderer.on('context-restored', (_, snapshot) => callback(snapshot));
  },
  onFocusModeChanged: (callback) => {
    ipcRenderer.on('focus-mode-changed', (_, isFocused) => callback(isFocused));
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('context-saved');
    ipcRenderer.removeAllListeners('context-restored');
    ipcRenderer.removeAllListeners('focus-mode-changed');
  }
};

contextBridge.exposeInMainWorld('contextFlow', api);

declare global {
  interface Window {
    contextFlow: ContextFlowAPI;
  }
}
