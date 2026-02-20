/**
 * Context Folders Feature
 * Organize contexts into folders/categories
 */

import type { ContextSummary } from '../types';
import { getAllContexts } from '../storage/contexts';

interface Folder {
  id: string;
  name: string;
  emoji: string;
  color: string;
  contextIds: string[];
  order: number;
}

interface FolderConfig {
  folders: Folder[];
  uncategorizedVisible: boolean;
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'work', name: 'Work', emoji: '💼', color: '#6366f1', contextIds: [], order: 0 },
  { id: 'personal', name: 'Personal', emoji: '🏠', color: '#10b981', contextIds: [], order: 1 },
  { id: 'system', name: 'System', emoji: '⚙️', color: '#6b7280', contextIds: [], order: 2 }
];

class ContextFoldersManager {
  private folders: Map<string, Folder> = new Map();
  private uncategorizedVisible: boolean = true;

  constructor() {
    // Load default folders
    DEFAULT_FOLDERS.forEach(folder => {
      this.folders.set(folder.id, folder);
    });
  }

  createFolder(name: string, emoji: string = '📁', color: string = '#6366f1'): Folder {
    const folder: Folder = {
      id: `folder_${Date.now()}`,
      name,
      emoji,
      color,
      contextIds: [],
      order: this.folders.size
    };

    this.folders.set(folder.id, folder);
    this.saveToStorage();
    
    return folder;
  }

  deleteFolder(folderId: string, moveToUncategorized: boolean = true): void {
    const folder = this.folders.get(folderId);
    if (!folder) return;

    if (moveToUncategorized) {
      // Contexts will become uncategorized
    }

    this.folders.delete(folderId);
    this.saveToStorage();
  }

  addContextToFolder(contextId: string, folderId: string): void {
    // Remove from other folders first
    this.folders.forEach(folder => {
      folder.contextIds = folder.contextIds.filter(id => id !== contextId);
    });

    const folder = this.folders.get(folderId);
    if (folder) {
      folder.contextIds.push(contextId);
      this.saveToStorage();
    }
  }

  removeContextFromFolder(contextId: string, folderId: string): void {
    const folder = this.folders.get(folderId);
    if (folder) {
      folder.contextIds = folder.contextIds.filter(id => id !== contextId);
      this.saveToStorage();
    }
  }

  moveContext(contextId: string, fromFolderId: string | null, toFolderId: string): void {
    if (fromFolderId) {
      this.removeContextFromFolder(contextId, fromFolderId);
    }
    this.addContextToFolder(contextId, toFolderId);
  }

  getFolders(): Folder[] {
    return Array.from(this.folders.values()).sort((a, b) => a.order - b.order);
  }

  getFolder(folderId: string): Folder | undefined {
    return this.folders.get(folderId);
  }

  getContextsInFolder(folderId: string): string[] {
    const folder = this.folders.get(folderId);
    return folder ? [...folder.contextIds] : [];
  }

  async getOrganizedContexts(): Promise<Map<string, ContextSummary[]>> {
    const allContexts = await getAllContexts();
    const contextMap = new Map(allContexts.map(c => [c.id, c]));
    
    const organized = new Map<string, ContextSummary[]>();

    // Add folders
    this.getFolders().forEach(folder => {
      const contexts = folder.contextIds
        .map(id => contextMap.get(id))
        .filter((c): c is ContextSummary => c !== undefined);
      organized.set(folder.name, contexts);
    });

    // Add uncategorized
    if (this.uncategorizedVisible) {
      const categorizedIds = new Set(
        Array.from(this.folders.values()).flatMap(f => f.contextIds)
      );
      const uncategorized = allContexts.filter(c => !categorizedIds.has(c.id));
      organized.set('Uncategorized', uncategorized);
    }

    return organized;
  }

  reorderFolders(folderIds: string[]): void {
    folderIds.forEach((id, index) => {
      const folder = this.folders.get(id);
      if (folder) {
        folder.order = index;
      }
    });
    this.saveToStorage();
  }

  renameFolder(folderId: string, newName: string): void {
    const folder = this.folders.get(folderId);
    if (folder) {
      folder.name = newName;
      this.saveToStorage();
    }
  }

  setUncategorizedVisible(visible: boolean): void {
    this.uncategorizedVisible = visible;
  }

  private saveToStorage(): void {
    // Persist to database
    const config: FolderConfig = {
      folders: this.getFolders(),
      uncategorizedVisible: this.uncategorizedVisible
    };
    // Implementation would save to settings
    console.log('[Folders] Saved configuration');
  }

  loadFromStorage(): void {
    // Load from database
    console.log('[Folders] Loaded configuration');
  }
}

export const foldersManager = new ContextFoldersManager();
export { Folder, FolderConfig };
