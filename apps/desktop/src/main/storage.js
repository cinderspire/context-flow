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
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
      autoSnap: false,
      autoSnapInterval: 30,
      focusModeApps: [],
      shortcutsEnabled: true,
      theme: 'dark',
      version: '1.0.0'
    }, null, 2));
  }
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2));
  }
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
