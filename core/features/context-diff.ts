/**
 * Context Diff Feature
 * Compare two contexts to see differences
 */

import type { ContextSnapshot, WindowState, AppState } from '../types';
import { getContext } from '../storage/contexts';

interface WindowDiff {
  type: 'added' | 'removed' | 'modified';
  app: string;
  title: string;
  details: string;
}

interface AppStateDiff {
  app: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

interface ContextDiff {
  contextA: string;
  contextB: string;
  windowDiffs: WindowDiff[];
  appStateDiffs: AppStateDiff[];
  summary: {
    appsAdded: number;
    appsRemoved: number;
    appsModified: number;
    totalChanges: number;
  };
}

class ContextDiffManager {
  
  async compare(contextAId: string, contextBId: string): Promise<ContextDiff | null> {
    const contextA = getContext(contextAId);
    const contextB = getContext(contextBId);

    if (!contextA || !contextB) {
      console.error('[Diff] One or both contexts not found');
      return null;
    }

    const windowDiffs = this.compareWindows(contextA.windows, contextB.windows);
    const appStateDiffs = this.compareAppStates(contextA.appStates, contextB.appStates);

    const summary = {
      appsAdded: windowDiffs.filter(d => d.type === 'added').length,
      appsRemoved: windowDiffs.filter(d => d.type === 'removed').length,
      appsModified: windowDiffs.filter(d => d.type === 'modified').length + appStateDiffs.length,
      totalChanges: windowDiffs.length + appStateDiffs.reduce((sum, d) => sum + d.changes.length, 0)
    };

    return {
      contextA: contextA.name,
      contextB: contextB.name,
      windowDiffs,
      appStateDiffs,
      summary
    };
  }

  private compareWindows(windowsA: WindowState[], windowsB: WindowState[]): WindowDiff[] {
    const diffs: WindowDiff[] = [];
    
    // Find removed windows
    windowsA.forEach(windowA => {
      const match = windowsB.find(w => 
        w.app === windowA.app && w.title === windowA.title
      );
      
      if (!match) {
        diffs.push({
          type: 'removed',
          app: windowA.app,
          title: windowA.title,
          details: 'Window was closed'
        });
      }
    });

    // Find added windows
    windowsB.forEach(windowB => {
      const match = windowsA.find(w => 
        w.app === windowB.app && w.title === windowB.title
      );
      
      if (!match) {
        diffs.push({
          type: 'added',
          app: windowB.app,
          title: windowB.title,
          details: 'New window opened'
        });
      }
    });

    // Find modified windows
    windowsA.forEach(windowA => {
      const windowB = windowsB.find(w => 
        w.app === windowA.app && w.title === windowA.title
      );
      
      if (windowB) {
        const changes: string[] = [];
        
        if (windowA.bounds.x !== windowB.bounds.x || 
            windowA.bounds.y !== windowB.bounds.y) {
          changes.push('Position changed');
        }
        
        if (windowA.bounds.width !== windowB.bounds.width || 
            windowA.bounds.height !== windowB.bounds.height) {
          changes.push('Size changed');
        }
        
        if (windowA.minimized !== windowB.minimized) {
          changes.push(windowB.minimized ? 'Minimized' : 'Restored');
        }

        if (changes.length > 0) {
          diffs.push({
            type: 'modified',
            app: windowA.app,
            title: windowA.title,
            details: changes.join(', ')
          });
        }
      }
    });

    return diffs;
  }

  private compareAppStates(statesA: Record<string, AppState>, statesB: Record<string, AppState>): AppStateDiff[] {
    const diffs: AppStateDiff[] = [];

    Object.keys(statesB).forEach(app => {
      const stateA = statesA[app];
      const stateB = statesB[app];

      if (!stateA) {
        diffs.push({
          app,
          changes: [{ field: 'state', oldValue: null, newValue: 'initialized' }]
        });
        return;
      }

      const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

      // Compare VSCode state
      if (app === 'vscode') {
        if (stateA.workspace !== stateB.workspace) {
          changes.push({
            field: 'workspace',
            oldValue: stateA.workspace,
            newValue: stateB.workspace
          });
        }

        const filesA = (stateA.openFiles || []).map((f: any) => f.path).join(',');
        const filesB = (stateB.openFiles || []).map((f: any) => f.path).join(',');
        if (filesA !== filesB) {
          changes.push({
            field: 'openFiles',
            oldValue: `${(stateA.openFiles || []).length} files`,
            newValue: `${(stateB.openFiles || []).length} files`
          });
        }
      }

      // Compare Chrome state
      if (app === 'chrome') {
        const tabsA = (stateA.tabs || []).length;
        const tabsB = (stateB.tabs || []).length;
        if (tabsA !== tabsB) {
          changes.push({
            field: 'tabs',
            oldValue: `${tabsA} tabs`,
            newValue: `${tabsB} tabs`
          });
        }
      }

      if (changes.length > 0) {
        diffs.push({ app, changes });
      }
    });

    return diffs;
  }

  formatDiffForDisplay(diff: ContextDiff): string {
    const lines: string[] = [
      `Comparing: ${diff.contextA} vs ${diff.contextB}`,
      ``,
      `Summary:`,
      `  ${diff.summary.appsAdded} apps added`,
      `  ${diff.summary.appsRemoved} apps removed`,
      `  ${diff.summary.appsModified} apps modified`,
      `  ${diff.summary.totalChanges} total changes`,
      ``,
      `Changes:`
    ];

    diff.windowDiffs.forEach(d => {
      const icon = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : '~';
      lines.push(`  ${icon} [${d.app}] ${d.title}`);
      lines.push(`     ${d.details}`);
    });

    return lines.join('\n');
  }
}

export const contextDiffManager = new ContextDiffManager();
export { ContextDiff, WindowDiff, AppStateDiff };
