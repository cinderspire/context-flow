/**
 * Context Storage Operations
 * JSON-based implementation for testing
 */

import type { ContextSnapshot, ContextSummary } from '../types';
import { 
  saveContextJson, 
  getContextJson, 
  getAllContextsJson, 
  deleteContextJson 
} from './json-database';

export function saveContext(snapshot: ContextSnapshot): void {
  saveContextJson(snapshot);
  console.log(`[Storage] Saved context: ${snapshot.name}`);
}

export function getContext(id: string): ContextSnapshot | null {
  return getContextJson(id);
}

export function getAllContexts(): ContextSummary[] {
  const contexts = getAllContextsJson();
  return contexts.map(rowToSummary);
}

export function getRecentContexts(limit: number = 10): ContextSummary[] {
  return getAllContexts()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function updateContext(snapshot: ContextSnapshot): void {
  saveContextJson(snapshot);
}

export function deleteContext(id: string): void {
  deleteContextJson(id);
  console.log(`[Storage] Deleted context: ${id}`);
}

export function searchContexts(query: string): ContextSummary[] {
  const all = getAllContextsJson();
  return all
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    .map(rowToSummary);
}

function rowToSummary(context: any): ContextSummary {
  return {
    id: context.id,
    name: context.name,
    emoji: context.emoji,
    timestamp: context.timestamp,
    lastRestored: context.lastRestored,
    restoreCount: context.restoreCount || 0,
    appCount: context.metadata?.appCount || context.windows?.length || 0,
    project: context.metadata?.project
  };
}
