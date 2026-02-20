/**
 * Mock Window Manager
 * For testing without native dependencies
 */

export interface MockWindow {
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

class MockWindowManager {
  private windows: MockWindow[] = [
    {
      id: 1,
      app: 'Visual Studio Code',
      title: 'Context Flow - index.ts',
      bounds: { x: 100, y: 100, width: 1200, height: 800 },
      minimized: false,
      focused: true,
      visible: true
    },
    {
      id: 2,
      app: 'Terminal',
      title: 'zsh - context-flow',
      bounds: { x: 50, y: 50, width: 800, height: 400 },
      minimized: false,
      focused: false,
      visible: true
    },
    {
      id: 3,
      app: 'Google Chrome',
      title: 'Context Flow - DevStudio 2026',
      bounds: { x: 200, y: 150, width: 1000, height: 700 },
      minimized: false,
      focused: false,
      visible: true
    }
  ];

  getWindows(): MockWindow[] {
    return this.windows;
  }

  getActiveWindow(): MockWindow | null {
    return this.windows.find(w => w.focused) || null;
  }

  minimizeWindow(windowId: number): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.minimized = true;
      console.log(`[MockWM] Minimized: ${window.title}`);
    }
  }

  restoreWindow(windowId: number): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.minimized = false;
      console.log(`[MockWM] Restored: ${window.title}`);
    }
  }

  focusWindow(windowId: number): void {
    this.windows.forEach(w => w.focused = false);
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.focused = true;
      console.log(`[MockWM] Focused: ${window.title}`);
    }
  }

  setWindowBounds(windowId: number, bounds: MockWindow['bounds']): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.bounds = bounds;
      console.log(`[MockWM] Bounds set for: ${window.title}`);
    }
  }

  // Simulate app launch
  launchApp(appName: string): MockWindow {
    const newWindow: MockWindow = {
      id: Date.now(),
      app: appName,
      title: `${appName} - New Window`,
      bounds: { x: 100, y: 100, width: 800, height: 600 },
      minimized: false,
      focused: true,
      visible: true
    };
    this.windows.push(newWindow);
    console.log(`[MockWM] Launched: ${appName}`);
    return newWindow;
  }

  // Simulate window close
  closeWindow(windowId: number): void {
    this.windows = this.windows.filter(w => w.id !== windowId);
    console.log(`[MockWM] Closed window: ${windowId}`);
  }
}

export const mockWindowManager = new MockWindowManager();
