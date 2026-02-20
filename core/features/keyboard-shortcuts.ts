/**
 * Keyboard Shortcuts Feature
 * Global shortcuts for quick actions
 */

interface ShortcutConfig {
  quickSnap: string;
  quickRestore: string;
  showApp: string;
  focusMode: string;
  cycleContexts: string;
}

const DEFAULT_SHORTCUTS: ShortcutConfig = {
  quickSnap: 'CommandOrControl+Shift+S',
  quickRestore: 'CommandOrControl+Shift+R',
  showApp: 'CommandOrControl+Shift+C',
  focusMode: 'CommandOrControl+Shift+F',
  cycleContexts: 'CommandOrControl+Shift+Tab'
};

class KeyboardShortcutManager {
  private shortcuts: ShortcutConfig;
  private callbacks: Map<string, () => void> = new Map();

  constructor(shortcuts: Partial<ShortcutConfig> = {}) {
    this.shortcuts = { ...DEFAULT_SHORTCUTS, ...shortcuts };
  }

  registerCallback(name: string, callback: () => void): void {
    this.callbacks.set(name, callback);
  }

  trigger(name: string): void {
    const callback = this.callbacks.get(name);
    if (callback) {
      callback();
    }
  }

  getShortcuts(): ShortcutConfig {
    return { ...this.shortcuts };
  }

  updateShortcuts(shortcuts: Partial<ShortcutConfig>): void {
    this.shortcuts = { ...this.shortcuts, ...shortcuts };
  }
}

export const shortcutManager = new KeyboardShortcutManager();
export { ShortcutConfig };
