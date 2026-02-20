/**
 * Context Flow - Window Manager (Mock for Demo)
 * Simulates macOS window operations for Logitech DevStudio 2026
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const storage = require('./storage');

const execAsync = promisify(exec);

// Mock window data representing actual macOS apps
const MOCK_WINDOWS = [
  { id: 1, app: 'Code', name: 'VSCode', title: 'context-flow-demo.html — context-flow', icon: '💻', pid: 1234 },
  { id: 2, app: 'Terminal', name: 'Terminal', title: 'zsh — 80x24', icon: '⌨️', pid: 1235 },
  { id: 3, app: 'Google Chrome', name: 'Chrome', title: 'localhost:3000', icon: '🌐', pid: 1236 },
  { id: 4, app: 'Figma', name: 'Figma', title: 'Context Flow UI.fig', icon: '🎨', pid: 1237 },
  { id: 5, app: 'Notion', name: 'Notion', title: 'DevStudio 2026 Submission', icon: '📝', pid: 1238 },
  { id: 6, app: 'zoom.us', name: 'Zoom', title: 'Zoom Meeting', icon: '📹', pid: 1239 },
  { id: 7, app: 'Slack', name: 'Slack', title: '#devstudio-2026', icon: '💬', pid: 1240 },
  { id: 8, app: 'Tableau', name: 'Tableau', title: 'Sales Dashboard 2026', icon: '📊', pid: 1241 }
];

// Get currently "active" windows (simulated)
function getActiveWindows() {
  // Simulate different sets based on time
  const hour = new Date().getHours();
  
  if (hour >= 9 && hour < 12) {
    // Morning: Coding setup
    return [MOCK_WINDOWS[0], MOCK_WINDOWS[1], MOCK_WINDOWS[2]];
  } else if (hour >= 14 && hour < 17) {
    // Afternoon: Design/Meetings
    return [MOCK_WINDOWS[3], MOCK_WINDOWS[4], MOCK_WINDOWS[6]];
  } else {
    // Default: Mixed
    return [MOCK_WINDOWS[0], MOCK_WINDOWS[1], MOCK_WINDOWS[4]];
  }
}

// Capture current context
async function captureContext(name = null) {
  const windows = getActiveWindows();
  const timestamp = Date.now();
  
  const context = {
    id: `ctx_${timestamp}`,
    name: name || `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    emoji: detectEmoji(windows),
    windows: windows.map(w => ({
      app: w.app,
      name: w.name,
      title: w.title,
      icon: w.icon,
      pid: w.pid
    })),
    apps: windows.map(w => w.name).join(', '),
    windowCount: windows.length,
    timestamp,
    time: 'Just now',
    tag: 'Active',
    os: 'macOS',
    display: 'Built-in Retina Display'
  };
  
  // Save to storage
  storage.saveContext(context);
  storage.logEvent('context_captured', { contextId: context.id, windowCount: windows.length });
  
  // Simulate focus mode detection
  if (windows.some(w => w.name === 'VSCode' || w.name === 'Terminal')) {
    context.focusMode = 'development';
  } else if (windows.some(w => w.name === 'Figma')) {
    context.focusMode = 'design';
  }
  
  return context;
}

// Restore context (simulated)
async function restoreContext(contextId) {
  const contexts = storage.getAllContexts();
  const context = contexts.find(c => c.id === contextId);
  
  if (!context) {
    throw new Error('Context not found');
  }
  
  console.log('[WindowManager] Restoring context:', context.name);
  console.log('[WindowManager] Apps to launch:', context.apps);
  
  // Simulate app launching delay
  const launchSequence = context.windows.map((w, i) => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`[WindowManager] Launched: ${w.name} - ${w.title}`);
        resolve(w);
      }, i * 300); // Stagger launches
    });
  });
  
  await Promise.all(launchSequence);
  
  storage.logEvent('context_restored', { contextId, apps: context.apps });
  
  return {
    success: true,
    restored: context.windows.length,
    apps: context.windows.map(w => w.name)
  };
}

// Detect appropriate emoji based on window types
function detectEmoji(windows) {
  const apps = windows.map(w => w.name);
  
  if (apps.includes('VSCode') || apps.includes('Terminal')) return '💻';
  if (apps.includes('Figma')) return '🎨';
  if (apps.includes('Zoom')) return '📹';
  if (apps.includes('Tableau') || apps.includes('Excel')) return '📊';
  if (apps.includes('Notion') && apps.includes('Chrome')) return '📚';
  return '💼';
}

// Get running apps for status bar
function getRunningApps() {
  return getActiveWindows().map(w => ({
    name: w.name,
    icon: w.icon,
    isActive: true
  }));
}

// Simulate window focus
async function focusApp(appName) {
  console.log('[WindowManager] Focusing app:', appName);
  storage.logEvent('app_focused', { app: appName });
  return { success: true, app: appName };
}

// Toggle window visibility (minimize/restore simulation)
async function toggleWindow(appName) {
  console.log('[WindowManager] Toggling window:', appName);
  return { success: true, app: appName, action: 'toggled' };
}

// Export/Import contexts
function exportContexts() {
  const contexts = storage.getAllContexts();
  const exportData = {
    version: '1.0.0',
    exportedAt: Date.now(),
    contexts,
    stats: {
      total: contexts.length,
      byTag: contexts.reduce((acc, c) => {
        acc[c.tag || 'untagged'] = (acc[c.tag || 'untagged'] || 0) + 1;
        return acc;
      }, {})
    }
  };
  
  return JSON.stringify(exportData, null, 2);
}

function importContexts(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    if (data.contexts && Array.isArray(data.contexts)) {
      data.contexts.forEach(ctx => {
        ctx.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        storage.saveContext(ctx);
      });
      return { success: true, imported: data.contexts.length };
    }
    throw new Error('Invalid format');
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  getActiveWindows,
  captureContext,
  restoreContext,
  getRunningApps,
  focusApp,
  toggleWindow,
  exportContexts,
  importContexts,
  MOCK_WINDOWS
};
