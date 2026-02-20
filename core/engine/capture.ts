/**
 * Context Capture Engine
 * Captures complete workspace state for restoration
 */

import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import type { 
  ContextSnapshot, 
  WindowState, 
  AppState,
  ContextSummary 
} from '../types';
import { adapterRegistry } from '../adapters/registry';
import { generateContextName, detectProject, extractTags } from '../ai/naming';

// Window manager integration (will be injected from main process)
let windowManager: any = null;

export function setWindowManager(wm: any) {
  windowManager = wm;
}

/**
 * Capture current workspace state
 */
export async function captureContext(customName?: string): Promise<ContextSnapshot> {
  if (!windowManager) {
    throw new Error('Window manager not initialized');
  }

  console.log('[Capture] Starting context capture...');
  const startTime = Date.now();

  // 1. Get all visible windows
  const windows = await getAllWindows();
  console.log(`[Capture] Found ${windows.length} windows`);

  // 2. Capture app-specific states
  const appStates: Record<string, AppState> = {};
  
  for (const window of windows) {
    const adapter = adapterRegistry.getAdapter(window.app);
    if (adapter) {
      try {
        const state = await adapter.capture(window);
        if (state) {
          appStates[adapter.name.toLowerCase()] = state;
          console.log(`[Capture] Captured state for ${adapter.name}`);
        }
      } catch (error) {
        console.error(`[Capture] Failed to capture ${window.app}:`, error);
      }
    }
  }

  // 3. Generate context name using AI
  const name = customName || await generateContextName(appStates, windows);
  const project = detectProject(appStates);
  const tags = extractTags(appStates, windows);

  // 4. Create snapshot
  const snapshot: ContextSnapshot = {
    id: uuidv4(),
    name,
    emoji: getEmojiForContext(appStates, windows),
    timestamp: Date.now(),
    updatedAt: Date.now(),
    restoreCount: 0,
    windows: windows.map(w => ({
      ...w,
      // Don't store window IDs (they change)
      id: 0
    })),
    appStates,
    metadata: {
      project,
      tags,
      duration: 0,
      appCount: windows.length
    }
  };

  const duration = Date.now() - startTime;
  console.log(`[Capture] Context captured in ${duration}ms: ${name}`);

  return snapshot;
}

/**
 * Get all visible windows from window manager
 */
async function getAllWindows(): Promise<WindowState[]> {
  try {
    const windows = windowManager.getWindows();
    
    return windows
      .filter((w: any) => w.isVisible() && !w.isMinimized())
      .map((w: any) => {
        const info = w.getInfo();
        const bounds = w.getBounds();
        
        return {
          id: info.id,
          app: getAppName(info),
          title: info.title || 'Untitled',
          bounds: {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height
          },
          minimized: w.isMinimized(),
          focused: w.isFocused(),
          visible: w.isVisible()
        };
      })
      .filter((w: WindowState) => 
        // Filter out system windows
        w.title && 
        w.title !== '' && 
        !w.title.includes('Window Server') &&
        !w.app.includes('loginwindow')
      );
  } catch (error) {
    console.error('[Capture] Failed to get windows:', error);
    return [];
  }
}

/**
 * Extract app name from window info
 */
function getAppName(info: any): string {
  // Try to get app name from various sources
  if (info.owner?.name) {
    return info.owner.name;
  }
  if (info.processId) {
    // Could look up process name here
    return `app-${info.processId}`;
  }
  return 'Unknown';
}

/**
 * Get appropriate emoji for context
 */
function getEmojiForContext(appStates: Record<string, AppState>, windows: WindowState[]): string {
  // Priority order for emojis based on apps
  const appEmojis: Record<string, string> = {
    vscode: '💻',
    chrome: '🌐',
    photoshop: '🎨',
    figma: '🎨',
    blender: '🎭',
    terminal: '💿',
    slack: '💬',
    spotify: '🎵',
    default: '📁'
  };

  // Check app states first
  for (const [app, state] of Object.entries(appStates)) {
    if (appEmojis[app.toLowerCase()]) {
      return appEmojis[app.toLowerCase()];
    }
  }

  // Check window titles
  for (const window of windows) {
    const app = window.app.toLowerCase();
    for (const [key, emoji] of Object.entries(appEmojis)) {
      if (app.includes(key)) {
        return emoji;
      }
    }
  }

  return appEmojis.default;
}

/**
 * Convert snapshot to summary (for listing)
 */
export function toSummary(snapshot: ContextSnapshot): ContextSummary {
  return {
    id: snapshot.id,
    name: snapshot.name,
    emoji: snapshot.emoji,
    timestamp: snapshot.timestamp,
    lastRestored: snapshot.lastRestored,
    restoreCount: snapshot.restoreCount,
    appCount: snapshot.metadata.appCount,
    project: snapshot.metadata.project
  };
}
