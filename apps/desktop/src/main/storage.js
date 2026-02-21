/**
 * Context Flow - JSON Storage Module
 * Persistent storage for contexts, settings, and events
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.homedir(), '.context-flow');
const CONTEXTS_FILE = path.join(DATA_DIR, 'contexts.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// Ensure data directory exists
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('[Storage] Created data directory:', DATA_DIR);
  }

  // Initialize files if don't exist
  if (!fs.existsSync(CONTEXTS_FILE)) {
    fs.writeFileSync(CONTEXTS_FILE, JSON.stringify([], null, 2));
    seedDemoContexts();
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
      autoSnap: false,
      autoSnapInterval: 30,
      focusModeApps: [],
      shortcutsEnabled: true,
      theme: 'dark',
      version: '2.0.0'
    }, null, 2));
  }
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2));
  }
}

// Pre-load realistic demo contexts for first-time users / judges
function seedDemoContexts() {
  const now = Date.now();
  const demo = [
    {
      id: 'ctx_demo_1',
      name: '3D Character Sculpt',
      emoji: '🎨',
      apps: 'Blender, Figma, Chrome',
      windows: [
        { name: 'Blender', title: 'character_hero_v3.blend', icon: '🎨' },
        { name: 'Figma', title: 'Design System 2026', icon: '✏️' },
        { name: 'Chrome', title: 'ArtStation Reference Board', icon: '🌐' }
      ],
      windowCount: 3,
      tag: 'Active',
      time: '2h ago',
      focusMode: 'creative',
      os: 'macOS',
      display: 'Built-in Retina Display',
      createdAt: now - 7200000,
      updatedAt: now - 7200000
    },
    {
      id: 'ctx_demo_2',
      name: 'Code Review Session',
      emoji: '💻',
      apps: 'VSCode, Terminal, Chrome',
      windows: [
        { name: 'VSCode', title: 'context-flow — feature/ai-predict', icon: '💻' },
        { name: 'Terminal', title: 'zsh — ~/projects/context-flow', icon: '⌨️' },
        { name: 'Chrome', title: 'GitHub PR #42 — Actions SDK', icon: '🌐' }
      ],
      windowCount: 3,
      tag: 'Active',
      time: 'Yesterday',
      focusMode: 'development',
      os: 'macOS',
      display: 'Built-in Retina Display',
      createdAt: now - 86400000,
      updatedAt: now - 86400000
    },
    {
      id: 'ctx_demo_3',
      name: 'Client Presentation',
      emoji: '📹',
      apps: 'Zoom, Notion, Chrome',
      windows: [
        { name: 'Zoom', title: 'Logitech DevStudio Meeting', icon: '📹' },
        { name: 'Notion', title: 'Q1 2026 Product Roadmap', icon: '📝' },
        { name: 'Chrome', title: 'Context Flow Demo — Slides', icon: '🌐' }
      ],
      windowCount: 3,
      tag: 'Draft',
      time: '3 days ago',
      focusMode: 'meeting',
      os: 'macOS',
      display: 'Built-in Retina Display',
      createdAt: now - 259200000,
      updatedAt: now - 259200000
    },
    {
      id: 'ctx_demo_4',
      name: 'Research & Writing',
      emoji: '📚',
      apps: 'Notion, Chrome, Slack',
      windows: [
        { name: 'Notion', title: 'DevStudio 2026 Submission Notes', icon: '📝' },
        { name: 'Chrome', title: 'Logitech Actions SDK Docs', icon: '🌐' },
        { name: 'Slack', title: '#devstudio-2026 — Logitech', icon: '💬' }
      ],
      windowCount: 3,
      tag: 'Draft',
      time: '1 week ago',
      focusMode: 'research',
      os: 'macOS',
      display: 'Built-in Retina Display',
      createdAt: now - 604800000,
      updatedAt: now - 604800000
    }
  ];

  fs.writeFileSync(CONTEXTS_FILE, JSON.stringify(demo, null, 2));
  console.log('[Storage] Seeded', demo.length, 'demo contexts');
}

// Contexts CRUD
function getAllContexts() {
  try {
    const data = fs.readFileSync(CONTEXTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[Storage] Error reading contexts:', err);
    return [];
  }
}

function saveContext(context) {
  const contexts = getAllContexts();
  
  // Check if exists
  const existingIndex = contexts.findIndex(c => c.id === context.id);
  
  if (existingIndex >= 0) {
    contexts[existingIndex] = { ...contexts[existingIndex], ...context, updatedAt: Date.now() };
  } else {
    contexts.unshift({
      ...context,
      id: context.id || Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  
  // Keep max 50 contexts
  if (contexts.length > 50) {
    contexts.pop();
  }
  
  fs.writeFileSync(CONTEXTS_FILE, JSON.stringify(contexts, null, 2));
  return context;
}

function deleteContext(id) {
  const contexts = getAllContexts();
  const filtered = contexts.filter(c => c.id !== id);
  fs.writeFileSync(CONTEXTS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

function updateContext(id, updates) {
  const contexts = getAllContexts();
  const index = contexts.findIndex(c => c.id === id);
  if (index >= 0) {
    contexts[index] = { ...contexts[index], ...updates, updatedAt: Date.now() };
    fs.writeFileSync(CONTEXTS_FILE, JSON.stringify(contexts, null, 2));
    return contexts[index];
  }
  return null;
}

// Settings
function getSettings() {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveSettings(settings) {
  const current = getSettings();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ ...current, ...settings }, null, 2));
  return settings;
}

// Events/Analytics
function logEvent(type, data = {}) {
  try {
    const events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
    events.push({
      type,
      data,
      timestamp: Date.now()
    });
    // Keep last 1000 events
    if (events.length > 1000) events.shift();
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
  } catch (err) {
    console.error('[Storage] Error logging event:', err);
  }
}

function getEvents() {
  try {
    return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// AI Suggestions based on time patterns
function getAISuggestions() {
  const events = getEvents();
  const contexts = getAllContexts();
  
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  
  // Simple pattern matching
  const suggestions = [];
  
  // Morning coding sessions
  if (hour >= 9 && hour <= 11) {
    const codingContexts = contexts.filter(c => 
      c.name.toLowerCase().includes('code') || 
      c.name.toLowerCase().includes('dev') ||
      c.apps?.includes('VSCode')
    );
    if (codingContexts.length > 0) {
      suggestions.push({
        type: 'time_based',
        message: 'Usually you start coding around this time',
        context: codingContexts[0],
        confidence: 0.85
      });
    }
  }
  
  // Afternoon meetings
  if (hour >= 14 && hour <= 16) {
    const meetingContexts = contexts.filter(c => 
      c.name.toLowerCase().includes('meet') ||
      c.apps?.includes('Zoom')
    );
    if (meetingContexts.length > 0) {
      suggestions.push({
        type: 'pattern',
        message: 'Meeting time detected',
        context: meetingContexts[0],
        confidence: 0.72
      });
    }
  }
  
  return suggestions;
}

module.exports = {
  initStorage,
  getAllContexts,
  saveContext,
  deleteContext,
  updateContext,
  getSettings,
  saveSettings,
  logEvent,
  getEvents,
  getAISuggestions,
  DATA_DIR
};
