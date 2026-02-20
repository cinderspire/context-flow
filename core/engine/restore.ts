/**
 * Context Restore Engine
 * Restores workspace state from snapshot
 */

import type { ContextSnapshot, WindowState, AppState } from '../types';
import { adapterRegistry } from '../adapters/registry';
import { getSettings } from './settings';

let windowManager: any = null;
let exec: any = null;

export function setDependencies(wm: any, execute: any) {
  windowManager = wm;
  exec = execute;
}

/**
 * Restore workspace from snapshot
 */
export async function restoreContext(snapshot: ContextSnapshot): Promise<void> {
  if (!windowManager) {
    throw new Error('Window manager not initialized');
  }

  console.log(`[Restore] Restoring context: ${snapshot.name}`);
  const startTime = Date.now();

  const settings = await getSettings();

  // 1. Close/minimize current windows if setting enabled
  if (settings.closeOthersOnRestore) {
    await minimizeAllWindows();
  }

  // 2. Restore each window
  const restorePromises = snapshot.windows.map(async (windowState) => {
    try {
      await restoreWindow(windowState, snapshot.appStates);
    } catch (error) {
      console.error(`[Restore] Failed to restore window ${windowState.title}:`, error);
    }
  });

  await Promise.all(restorePromises);

  // 3. Update snapshot metadata
  snapshot.lastRestored = Date.now();
  snapshot.restoreCount++;

  const duration = Date.now() - startTime;
  console.log(`[Restore] Context restored in ${duration}ms`);
}

/**
 * Restore a single window
 */
async function restoreWindow(
  windowState: WindowState, 
  appStates: Record<string, AppState>
): Promise<void> {
  // Try to find existing window
  let window = await findExistingWindow(windowState);

  // If not found, launch the app
  if (!window) {
    window = await launchAndFindWindow(windowState);
  }

  if (!window) {
    console.warn(`[Restore] Could not find or launch ${windowState.app}`);
    return;
  }

  // Restore window position and state
  try {
    // Set bounds
    window.setBounds(windowState.bounds);

    // Handle minimized state
    if (windowState.minimized) {
      window.minimize();
    } else {
      window.restore();
    }

    // Focus if it was focused
    if (windowState.focused) {
      window.focus();
    }

    console.log(`[Restore] Restored window: ${windowState.title}`);

    // Restore app-specific state via adapter
    const adapter = adapterRegistry.getAdapter(windowState.app);
    if (adapter && appStates[adapter.name.toLowerCase()]) {
      const appState = appStates[adapter.name.toLowerCase()];
      
      // Wait a bit for app to be ready
      await delay(500);
      
      try {
        await adapter.restore(windowState, appState);
        console.log(`[Restore] Restored ${adapter.name} state`);
      } catch (error) {
        console.error(`[Restore] Adapter failed for ${adapter.name}:`, error);
      }
    }
  } catch (error) {
    console.error(`[Restore] Error restoring window ${windowState.title}:`, error);
  }
}

/**
 * Find existing window matching the state
 */
async function findExistingWindow(windowState: WindowState): Promise<any | null> {
  try {
    const windows = windowManager.getWindows();
    
    // Try to match by app name and window title
    const match = windows.find((w: any) => {
      const info = w.getInfo();
      const appName = getAppName(info);
      
      // Match by app name and similar title
      return appName.toLowerCase() === windowState.app.toLowerCase() &&
             (info.title === windowState.title || 
              info.title.includes(windowState.title) ||
              windowState.title.includes(info.title));
    });

    return match || null;
  } catch (error) {
    console.error('[Restore] Error finding window:', error);
    return null;
  }
}

/**
 * Launch app and find its window
 */
async function launchAndFindWindow(windowState: WindowState): Promise<any | null> {
  try {
    // Launch app
    const appPath = getAppLaunchPath(windowState.app);
    if (appPath) {
      console.log(`[Restore] Launching ${windowState.app}...`);
      
      if (exec) {
        exec(`open -a "${appPath}"`, (error: any) => {
          if (error) {
            console.error(`[Restore] Failed to launch ${appPath}:`, error);
          }
        });
      }

      // Wait for app to launch
      await delay(2000);

      // Try to find the new window
      return await findExistingWindow(windowState);
    }
  } catch (error) {
    console.error(`[Restore] Error launching ${windowState.app}:`, error);
  }

  return null;
}

/**
 * Get launch path for common apps
 */
function getAppLaunchPath(appName: string): string | null {
  const appMap: Record<string, string> = {
    'Code': 'Visual Studio Code',
    'Visual Studio Code': 'Visual Studio Code',
    'chrome': 'Google Chrome',
    'Google Chrome': 'Google Chrome',
    'Safari': 'Safari',
    'terminal': 'Terminal',
    'Terminal': 'Terminal',
    'Spotify': 'Spotify',
    'Slack': 'Slack'
  };

  return appMap[appName] || appName;
}

/**
 * Minimize all visible windows
 */
async function minimizeAllWindows(): Promise<void> {
  try {
    const windows = windowManager.getWindows();
    for (const window of windows) {
      if (window.isVisible() && !window.isMinimized()) {
        window.minimize();
      }
    }
  } catch (error) {
    console.error('[Restore] Error minimizing windows:', error);
  }
}

/**
 * Get app name from window info
 */
function getAppName(info: any): string {
  if (info.owner?.name) {
    return info.owner.name;
  }
  return 'Unknown';
}

/**
 * Utility: delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
