/**
 * JSON Database - SQLite alternative for testing
 * Stores data in JSON files
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const DATA_DIR = path.join(os.homedir(), '.context-flow');
const CONTEXTS_FILE = path.join(DATA_DIR, 'contexts.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DataStore {
  contexts: any[];
  events: any[];
  settings: Record<string, any>;
}

let data: DataStore = {
  contexts: [],
  events: [],
  settings: {}
};

// Load data
function loadData(): void {
  try {
    if (fs.existsSync(CONTEXTS_FILE)) {
      data.contexts = JSON.parse(fs.readFileSync(CONTEXTS_FILE, 'utf-8'));
    }
    if (fs.existsSync(EVENTS_FILE)) {
      data.events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      data.settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
    console.log('[JSON DB] Loaded', data.contexts.length, 'contexts');
  } catch (error) {
    console.error('[JSON DB] Load error:', error);
  }
}

// Save data
function saveData(): void {
  try {
    fs.writeFileSync(CONTEXTS_FILE, JSON.stringify(data.contexts, null, 2));
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(data.events, null, 2));
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data.settings, null, 2));
  } catch (error) {
    console.error('[JSON DB] Save error:', error);
  }
}

// Contexts
export function saveContextJson(context: any): void {
  const existingIndex = data.contexts.findIndex(c => c.id === context.id);
  if (existingIndex >= 0) {
    data.contexts[existingIndex] = context;
  } else {
    data.contexts.push(context);
  }
  saveData();
}

export function getContextJson(id: string): any | null {
  return data.contexts.find(c => c.id === id) || null;
}

export function getAllContextsJson(): any[] {
  return [...data.contexts];
}

export function deleteContextJson(id: string): void {
  data.contexts = data.contexts.filter(c => c.id !== id);
  saveData();
}

// Events
export function saveEventJson(event: any): void {
  event.id = Date.now();
  data.events.push(event);
  saveData();
}

export function getRecentEventsJson(limit: number = 100): any[] {
  return data.events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

// Initialize
loadData();

console.log('[JSON DB] Initialized at', DATA_DIR);
