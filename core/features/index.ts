/**
 * Context Flow - Features Module
 * Export all feature modules
 */

// Auto Snap
export { autoSnapManager, AutoSnapConfig } from './auto-snap';

// Keyboard Shortcuts
export { shortcutManager, ShortcutConfig } from './keyboard-shortcuts';

// Focus Mode
export { focusModeManager, FocusModeConfig } from './focus-mode';

// Quick Actions
export { quickActionsManager, QuickAction, ActionSet } from './quick-actions';

// Context Folders
export { foldersManager, Folder, FolderConfig } from './context-folders';

// Context Timer
export { timerManager, TimerSession, DailyStats } from './context-timer';

// Context Diff
export { contextDiffManager, ContextDiff, WindowDiff, AppStateDiff } from './context-diff';

// Templates
export { templatesManager, ContextTemplate } from './context-templates';

// Import/Export
export { importExportManager, ExportData, ImportResult } from './import-export';
