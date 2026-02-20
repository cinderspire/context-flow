/**
 * Context Flow - Main Process
 * MOCK VERSION - No native dependencies
 */

import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, globalShortcut } from 'electron';
import * as path from 'path';

// Core imports
import { 
  saveContext, 
  getContext, 
  getAllContexts, 
  updateContext,
  deleteContext 
} from '../../../../core/storage/contexts';
import type { ContextSnapshot } from '../../../../core/types';
import { mockWindowManager } from '../../../../core/engine/mock-window-manager';

// Feature imports
import {
  autoSnapManager,
  focusModeManager,
  quickActionsManager,
  foldersManager,
  timerManager,
  contextDiffManager,
  templatesManager
} from '../../../../core/features';

// App state
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// Mock data for demo
const DEMO_CONTEXTS: ContextSnapshot[] = [
  {
    id: 'demo-1',
    name: 'Web Development',
    emoji: '💻',
    timestamp: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    restoreCount: 5,
    windows: [
      { id: 1, app: 'Visual Studio Code', title: 'index.ts - Context Flow', bounds: { x: 100, y: 100, width: 1200, height: 800 }, minimized: false, focused: true, visible: true },
      { id: 2, app: 'Terminal', title: 'zsh - context-flow', bounds: { x: 50, y: 50, width: 800, height: 400 }, minimized: false, focused: false, visible: true },
      { id: 3, app: 'Google Chrome', title: 'GitHub', bounds: { x: 200, y: 150, width: 1000, height: 700 }, minimized: false, focused: false, visible: true }
    ],
    appStates: { vscode: { workspace: 'context-flow', openFiles: [{ path: '/src/index.ts' }] } },
    metadata: { project: 'context-flow', tags: ['coding', 'development'], duration: 0, appCount: 3 }
  },
  {
    id: 'demo-2',
    name: 'UI Design',
    emoji: '🎨',
    timestamp: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    lastRestored: Date.now() - 1800000,
    restoreCount: 3,
    windows: [
      { id: 4, app: 'Figma', title: 'Design System', bounds: { x: 0, y: 0, width: 1400, height: 900 }, minimized: false, focused: true, visible: true },
      { id: 5, app: 'Google Chrome', title: 'Dribbble - Inspiration', bounds: { x: 100, y: 100, width: 1200, height: 800 }, minimized: false, focused: false, visible: true }
    ],
    appStates: {},
    metadata: { project: 'Design System', tags: ['design', 'ui'], duration: 0, appCount: 2 }
  },
  {
    id: 'demo-3',
    name: 'Meeting Prep',
    emoji: '📹',
    timestamp: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    restoreCount: 8,
    windows: [
      { id: 6, app: 'zoom.us', title: 'Zoom Meeting', bounds: { x: 200, y: 200, width: 800, height: 600 }, minimized: false, focused: true, visible: true },
      { id: 7, app: 'Notion', title: 'Meeting Notes', bounds: { x: 100, y: 100, width: 1000, height: 700 }, minimized: false, focused: false, visible: true },
      { id: 8, app: 'Calendar', title: 'Today', bounds: { x: 50, y: 50, width: 600, height: 500 }, minimized: false, focused: false, visible: true }
    ],
    appStates: {},
    metadata: { project: 'Meetings', tags: ['meeting', 'sync'], duration: 0, appCount: 3 }
  }
];

/**
 * Create main window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Register global keyboard shortcuts
 */
function registerGlobalShortcuts(): void {
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    handleQuickSnap();
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    handleQuickRestore();
  });

  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+F', () => {
    focusModeManager.toggle();
    mainWindow?.webContents.send('focus-mode-changed', focusModeManager.isFocused());
  });

  console.log('[Shortcuts] Global shortcuts registered');
}

/**
 * Create system tray
 */
function createTray(): void {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show Context Flow', 
      click: () => mainWindow?.show() 
    },
    { type: 'separator' },
    {
      label: 'Quick Snap',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: () => handleQuickSnap()
    },
    {
      label: 'Quick Restore Last',
      accelerator: 'CmdOrCtrl+Shift+R',
      click: () => handleQuickRestore()
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Context Flow');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}

/**
 * Handle quick snap
 */
async function handleQuickSnap(): Promise<void> {
  try {
    const windows = mockWindowManager.getWindows();
    const snapshot: ContextSnapshot = {
      id: `snap-${Date.now()}`,
      name: `Workspace ${new Date().toLocaleTimeString()}`,
      emoji: '💼',
      timestamp: Date.now(),
      updatedAt: Date.now(),
      restoreCount: 0,
      windows: windows.map(w => ({ ...w, id: 0 })),
      appStates: {},
      metadata: { tags: [], duration: 0, appCount: windows.length }
    };
    
    saveContext(snapshot);
    timerManager.startSession(snapshot.id);
    
    mainWindow?.webContents.send('context-saved', snapshot);
    
    console.log('[Main] Quick snap saved:', snapshot.name);
  } catch (error) {
    console.error('[Main] Quick snap failed:', error);
  }
}

/**
 * Handle quick restore
 */
async function handleQuickRestore(): Promise<void> {
  try {
    const contexts = await getAllContexts();
    const lastContext = contexts.find(c => c.lastRestored);
    
    if (lastContext) {
      await handleRestore(lastContext.id);
    }
  } catch (error) {
    console.error('[Main] Quick restore failed:', error);
  }
}

/**
 * Handle restore
 */
async function handleRestore(id: string): Promise<void> {
  try {
    const snapshot = getContext(id);
    if (!snapshot) return;
    
    // Launch apps (mock)
    snapshot.windows.forEach(window => {
      mockWindowManager.launchApp(window.app);
    });
    
    updateContext(snapshot);
    timerManager.startSession(snapshot.id);
    
    mainWindow?.webContents.send('context-restored', snapshot);
    console.log('[Main] Context restored:', snapshot.name);
    
  } catch (error) {
    console.error('[Main] Restore failed:', error);
  }
}

/**
 * IPC Handlers
 */
function setupIPC(): void {
  // Capture
  ipcMain.handle('capture-context', async (_, name?: string) => {
    try {
      const windows = mockWindowManager.getWindows();
      const snapshot: ContextSnapshot = {
        id: `snap-${Date.now()}`,
        name: name || `Context ${new Date().toLocaleTimeString()}`,
        emoji: '💼',
        timestamp: Date.now(),
        updatedAt: Date.now(),
        restoreCount: 0,
        windows: windows.map(w => ({ ...w, id: 0 })),
        appStates: {},
        metadata: { tags: [], duration: 0, appCount: windows.length }
      };
      
      saveContext(snapshot);
      timerManager.startSession(snapshot.id);
      
      return { success: true, snapshot };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  // Restore
  ipcMain.handle('restore-context', async (_, id: string) => {
    await handleRestore(id);
    return { success: true };
  });

  // Get contexts
  ipcMain.handle('get-contexts', () => getAllContexts());
  ipcMain.handle('get-context', (_, id: string) => getContext(id));
  ipcMain.handle('delete-context', (_, id: string) => {
    deleteContext(id);
    return { success: true };
  });

  // Folders
  ipcMain.handle('get-folders', () => foldersManager.getFolders());
  ipcMain.handle('create-folder', (_, name: string, emoji: string, color: string) => {
    return foldersManager.createFolder(name, emoji, color);
  });
  ipcMain.handle('add-to-folder', (contextId: string, folderId: string) => {
    foldersManager.addContextToFolder(contextId, folderId);
    return { success: true };
  });

  // Timer
  ipcMain.handle('get-timer-session', () => timerManager.getCurrentSession());
  ipcMain.handle('get-timer-duration', () => timerManager.getCurrentSessionDuration());
  ipcMain.handle('get-daily-progress', () => timerManager.getDailyGoalProgress());

  // Focus
  ipcMain.handle('toggle-focus-mode', () => {
    focusModeManager.toggle();
    return { isFocused: focusModeManager.isFocused() };
  });
  ipcMain.handle('get-focus-status', () => ({
    isFocused: focusModeManager.isFocused(),
    elapsed: timerManager.getCurrentSessionDuration()
  }));

  // Templates
  ipcMain.handle('get-templates', () => templatesManager.getAllTemplates());
  ipcMain.handle('apply-template', (_, templateId: string) => {
    templatesManager.applyTemplate(templateId);
    return { success: true };
  });

  // Suggestions
  ipcMain.handle('get-suggestions', async () => {
    return [];
  });
}

/**
 * App lifecycle
 */
app.whenReady().then(() => {
  // Load demo data
  DEMO_CONTEXTS.forEach(ctx => saveContext(ctx));
  console.log('[Main] Loaded', DEMO_CONTEXTS.length, 'demo contexts');
  
  foldersManager.loadFromStorage();
  timerManager.loadSessions();
  
  createWindow();
  createTray();
  setupIPC();
  registerGlobalShortcuts();

  // Start auto-snap
  autoSnapManager.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  globalShortcut.unregisterAll();
  autoSnapManager.stop();
  timerManager.saveSessions();
  timerManager.endSession();
});

app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});

console.log('[Main] Context Flow MOCK version starting...');
