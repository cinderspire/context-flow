/**
 * Context Flow - Core Module
 * Export all core functionality
 */

// Types
export * from './types';

// Engine
export { captureContext, setWindowManager } from './engine/capture';
export { restoreContext, setDependencies } from './engine/restore';

// Storage
export { initDatabase, getDatabase, closeDatabase } from './storage/database';
export {
  saveContext,
  getContext,
  getAllContexts,
  getRecentContexts,
  updateContext,
  deleteContext,
  searchContexts
} from './storage/contexts';
export {
  saveEvent,
  getRecentEvents,
  getEventsByContext,
  getEventsByTimeBucket,
  getAnalyticsSummary,
  cleanupOldEvents
} from './storage/events';

// AI
export {
  generateContextName,
  detectProject,
  extractTags
} from './ai/naming';
export {
  generateSuggestions,
  recordEvent
} from './ai/predictor';

// Adapters
export { adapterRegistry } from './adapters/registry';

// Features
export * from './features';

// Integrations
export * from './integrations';
