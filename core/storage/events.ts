/**
 * Event Storage Operations
 * JSON-based for testing
 */

import type { UserEvent } from '../types';
import { saveEventJson, getRecentEventsJson } from './json-database';

export function saveEvent(event: UserEvent): void {
  saveEventJson(event);
}

export function getRecentEvents(limit: number = 100): UserEvent[] {
  return getRecentEventsJson(limit);
}

export function getEventsByContext(contextId: string): UserEvent[] {
  return getRecentEventsJson(1000).filter(e => e.contextId === contextId);
}

export function getEventsByTimeBucket(timeBucket: string, dayOfWeek?: number): UserEvent[] {
  return getRecentEventsJson(1000).filter(e => {
    if (e.timeBucket !== timeBucket) return false;
    if (dayOfWeek !== undefined && e.dayOfWeek !== dayOfWeek) return false;
    return true;
  });
}

export function getAnalyticsSummary(): {
  totalEvents: number;
  totalContexts: number;
  mostActiveHour: number;
  mostUsedContext?: string;
} {
  const events = getRecentEventsJson(10000);
  const contexts = new Set(events.map(e => e.contextId).filter(Boolean));
  
  const contextCounts: Record<string, number> = {};
  events.forEach(e => {
    if (e.contextId) {
      contextCounts[e.contextId] = (contextCounts[e.contextId] || 0) + 1;
    }
  });
  
  const mostUsed = Object.entries(contextCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  return {
    totalEvents: events.length,
    totalContexts: contexts.size,
    mostActiveHour: 0,
    mostUsedContext: mostUsed
  };
}

export function cleanupOldEvents(daysToKeep: number = 90): void {
  // JSON version - no cleanup needed for MVP
  console.log('[Storage] Cleanup not implemented in JSON mode');
}
