/**
 * AI Prediction Engine
 * Suggests contexts based on learned patterns
 */

import type { ContextSuggestion, UserEvent, ContextSnapshot } from '../types';
import { getRecentEvents } from '../storage/events';
import { getAllContexts } from '../storage/contexts';

/**
 * Generate context suggestions based on current state
 */
export async function generateSuggestions(): Promise<ContextSuggestion[]> {
  const suggestions: ContextSuggestion[] = [];
  
  // Get all contexts
  const contexts = await getAllContexts();
  if (contexts.length === 0) {
    return [];
  }

  // Time-based prediction
  const timeSuggestion = await predictByTime(contexts);
  if (timeSuggestion) {
    suggestions.push(timeSuggestion);
  }

  // Recent usage prediction
  const recentSuggestion = await predictByRecency(contexts);
  if (recentSuggestion && !suggestions.find(s => s.contextId === recentSuggestion.contextId)) {
    suggestions.push(recentSuggestion);
  }

  // Pattern-based prediction (requires history)
  const patternSuggestion = await predictByPattern(contexts);
  if (patternSuggestion && !suggestions.find(s => s.contextId === patternSuggestion.contextId)) {
    suggestions.push(patternSuggestion);
  }

  // Add frequently used contexts
  const frequentContexts = contexts
    .filter(c => !suggestions.find(s => s.contextId === c.id))
    .sort((a, b) => b.restoreCount - a.restoreCount)
    .slice(0, 2);

  for (const context of frequentContexts) {
    suggestions.push({
      contextId: context.id,
      label: context.name,
      emoji: context.emoji,
      priority: 0.5,
      confidence: 0.5,
      reason: 'Frequently used',
      autoExecute: false
    });
  }

  // Sort by priority
  return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

/**
 * Predict based on time of day
 */
async function predictByTime(contexts: any[]): Promise<ContextSuggestion | null> {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  
  // Get events for this time bucket
  const timeBucket = getTimeBucket(hour);
  const events = await getRecentEvents(100);
  
  // Filter events for similar time
  const similarTimeEvents = events.filter(e => 
    e.timeBucket === timeBucket && 
    e.dayOfWeek === day
  );

  if (similarTimeEvents.length < 3) {
    return null;
  }

  // Find most common context
  const contextCounts: Record<string, number> = {};
  for (const event of similarTimeEvents) {
    if (event.contextId) {
      contextCounts[event.contextId] = (contextCounts[event.contextId] || 0) + 1;
    }
  }

  const topContextId = Object.entries(contextCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!topContextId) {
    return null;
  }

  const context = contexts.find(c => c.id === topContextId);
  if (!context) {
    return null;
  }

  const confidence = Math.min(contextCounts[topContextId] / 10, 0.95);

  return {
    contextId: context.id,
    label: context.name,
    emoji: context.emoji,
    priority: confidence,
    confidence,
    reason: `You usually work on this in the ${timeBucket}`,
    autoExecute: confidence > 0.9
  };
}

/**
 * Predict based on recent usage
 */
async function predictByRecency(contexts: any[]): Promise<ContextSuggestion | null> {
  // Sort by last restored
  const sorted = contexts
    .filter(c => c.lastRestored)
    .sort((a, b) => b.lastRestored - a.lastRestored);

  if (sorted.length === 0) {
    return null;
  }

  const mostRecent = sorted[0];
  
  // Don't suggest if used in last 10 minutes
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  if (mostRecent.lastRestored > tenMinutesAgo) {
    return null;
  }

  return {
    contextId: mostRecent.id,
    label: mostRecent.name,
    emoji: mostRecent.emoji,
    priority: 0.6,
    confidence: 0.6,
    reason: 'Recently used',
    autoExecute: false
  };
}

/**
 * Predict based on usage patterns
 */
async function predictByPattern(contexts: any[]): Promise<ContextSuggestion | null> {
  // Simple pattern: if context A was followed by context B multiple times
  // This is a simplified version - full implementation would use sequence analysis
  
  const events = await getRecentEvents(50);
  
  if (events.length < 10) {
    return null;
  }

  // Look for sequences
  const sequences: Record<string, string[]> = {};
  
  for (let i = 0; i < events.length - 1; i++) {
    const current = events[i].contextId;
    const next = events[i + 1].contextId;
    
    if (current && next && current !== next) {
      if (!sequences[current]) {
        sequences[current] = [];
      }
      sequences[current].push(next);
    }
  }

  // Find most recent context
  const recentEvents = events.filter(e => e.type === 'restore');
  if (recentEvents.length === 0) {
    return null;
  }

  const currentContextId = recentEvents[0].contextId;
  if (!currentContextId || !sequences[currentContextId]) {
    return null;
  }

  // Find most common next context
  const nextContexts = sequences[currentContextId];
  const counts: Record<string, number> = {};
  
  for (const id of nextContexts) {
    counts[id] = (counts[id] || 0) + 1;
  }

  const topNextId = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!topNextId || counts[topNextId] < 2) {
    return null;
  }

  const context = contexts.find(c => c.id === topNextId);
  if (!context) {
    return null;
  }

  const confidence = Math.min(counts[topNextId] / 5, 0.9);

  return {
    contextId: context.id,
    label: context.name,
    emoji: context.emoji,
    priority: confidence * 0.9,
    confidence,
    reason: 'Often follows your current context',
    autoExecute: false
  };
}

/**
 * Get time bucket
 */
function getTimeBucket(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Record user event for learning
 */
export async function recordEvent(
  type: UserEvent['type'],
  contextId?: string,
  activeApps: string[] = []
): Promise<void> {
  const { saveEvent } = await import('../storage/events');
  const { getDatabase } = await import('../storage/database');
  
  // Ensure database is initialized
  getDatabase();
  
  const hour = new Date().getHours();
  
  const event: UserEvent = {
    timestamp: Date.now(),
    type,
    contextId,
    activeApps,
    timeBucket: getTimeBucket(hour),
    dayOfWeek: new Date().getDay()
  };

  await saveEvent(event);
}
