/**
 * Context Flow - Core Type Definitions
 */

// Window State
export interface WindowState {
  id: number;
  app: string;
  title: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  minimized: boolean;
  focused: boolean;
  visible: boolean;
}

// App-Specific State (generic)
export interface AppState {
  [key: string]: any;
}

// VSCode State
export interface VSCodeState extends AppState {
  workspace?: string;
  openFiles: Array<{
    path: string;
    cursor?: { line: number; character: number };
  }>;
  activeFile?: string;
}

// Chrome State
export interface ChromeState extends AppState {
  tabs: Array<{
    url: string;
    title: string;
    active: boolean;
    scrollPosition?: { x: number; y: number };
  }>;
}

// Terminal State
export interface TerminalState extends AppState {
  cwd: string;
  shell: string;
}

// Context Snapshot
export interface ContextSnapshot {
  id: string;
  name: string;
  emoji: string;
  timestamp: number;
  updatedAt: number;
  lastRestored?: number;
  restoreCount: number;
  
  // Window states
  windows: WindowState[];
  
  // App-specific states
  appStates: {
    vscode?: VSCodeState;
    chrome?: ChromeState;
    terminal?: TerminalState;
    [appName: string]: AppState | undefined;
  };
  
  // Metadata
  metadata: {
    project?: string;
    tags: string[];
    duration: number;
    appCount: number;
  };
}

// Context Summary (for listing)
export interface ContextSummary {
  id: string;
  name: string;
  emoji: string;
  timestamp: number;
  lastRestored?: number;
  restoreCount: number;
  appCount: number;
  project?: string;
}

// Suggestion
export interface ContextSuggestion {
  contextId: string;
  label: string;
  emoji: string;
  priority: number;
  confidence: number;
  reason: string;
  autoExecute: boolean;
}

// User Event (for AI learning)
export interface UserEvent {
  id?: number;
  timestamp: number;
  type: 'snap' | 'restore' | 'switch' | 'app_launch' | 'app_close';
  contextId?: string;
  activeApps: string[];
  timeBucket: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;
  project?: string;
}

// App Adapter Interface
export interface AppAdapter {
  name: string;
  apps: string[];
  
  capture(window: WindowState): Promise<AppState | null>;
  restore(window: WindowState, state: AppState): Promise<void>;
  isAvailable(): Promise<boolean>;
}

// Hardware Event
export interface HardwareEvent {
  type: 'dial_rotate' | 'dial_press' | 'button_press';
  deviceId: string;
  value?: number; // For dial rotation
  buttonId?: string; // For button press
}

// Settings
export interface Settings {
  // General
  autoSnap: boolean;
  autoSnapInterval: number; // minutes
  closeOthersOnRestore: boolean;
  
  // AI
  aiSuggestions: boolean;
  autoExecute: boolean;
  autoExecuteThreshold: number; // confidence threshold (0-1)
  
  // Storage
  maxContexts: number;
  storageLocation: 'local' | 'cloud';
  
  // Hardware
  snapButtonId: string;
  hapticFeedback: boolean;
  
  // Adapters
  enabledAdapters: string[];
}

// Default settings
export const defaultSettings: Settings = {
  autoSnap: false,
  autoSnapInterval: 30,
  closeOthersOnRestore: false,
  aiSuggestions: true,
  autoExecute: false,
  autoExecuteThreshold: 0.9,
  maxContexts: 50,
  storageLocation: 'local',
  snapButtonId: 'SNAP',
  hapticFeedback: true,
  enabledAdapters: ['vscode', 'chrome', 'terminal'],
};
