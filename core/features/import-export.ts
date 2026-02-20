/**
 * Import/Export Feature
 * Import from other tools, export contexts
 */

import type { ContextSnapshot, ContextSummary } from '../types';
import { getAllContexts, getContext } from '../storage/contexts';
import { saveContext } from '../storage/contexts';

interface ExportData {
  version: string;
  exportedAt: string;
  contexts: ContextSnapshot[];
  settings?: Record<string, any>;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

class ImportExportManager {
  
  async exportAllContexts(): Promise<ExportData> {
    const summaries = await getAllContexts();
    const contexts: ContextSnapshot[] = [];

    for (const summary of summaries) {
      const context = getContext(summary.id);
      if (context) {
        contexts.push(context);
      }
    }

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      contexts
    };
  }

  async exportToJSON(): Promise<string> {
    const data = await this.exportAllContexts();
    return JSON.stringify(data, null, 2);
  }

  async exportToFile(filePath: string): Promise<void> {
    const fs = require('fs');
    const json = await this.exportToJSON();
    fs.writeFileSync(filePath, json, 'utf-8');
    console.log(`[Export] Saved to ${filePath}`);
  }

  async importFromJSON(jsonString: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: []
    };

    try {
      const data: ExportData = JSON.parse(jsonString);
      
      if (!data.contexts || !Array.isArray(data.contexts)) {
        throw new Error('Invalid export format');
      }

      for (const context of data.contexts) {
        try {
          // Generate new ID to avoid conflicts
          context.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          context.name = `${context.name} (Imported)`;
          context.timestamp = Date.now();
          
          saveContext(context);
          result.imported++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import "${context.name}": ${error}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Parse error: ${error}`);
    }

    return result;
  }

  async importFromFile(filePath: string): Promise<ImportResult> {
    const fs = require('fs');
    const json = fs.readFileSync(filePath, 'utf-8');
    return this.importFromJSON(json);
  }

  // Import from other tools

  async importFromVSCodeWorkspaces(): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, failed: 0, errors: [] };
    
    // Find VSCode workspaces
    const path = require('path');
    const os = require('os');
    
    const workspaceDir = path.join(os.homedir(), 'Library/Application Support/Code/User/workspaceStorage');
    
    console.log('[Import] Scanning VSCode workspaces...');
    
    // This would scan workspace directories
    // For now, just a placeholder
    
    return result;
  }

  async importFromChromeSessions(): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, failed: 0, errors: [] };
    
    console.log('[Import] Scanning Chrome sessions...');
    
    return result;
  }

  async importFromRectangleSettings(filePath: string): Promise<ImportResult> {
    const result: ImportResult = { success: true, imported: 0, failed: 0, errors: [] };
    
    console.log('[Import] Importing Rectangle settings...');
    
    // Rectangle uses JSON plist format
    // This would parse and convert to contexts
    
    return result;
  }

  // Export formats

  async exportAsScript(contextId: string): Promise<string> {
    const context = getContext(contextId);
    if (!context) {
      throw new Error('Context not found');
    }

    const lines: string[] = [
      '#!/bin/bash',
      `# Context Flow - Restore Script`,
      `# Context: ${context.name}`,
      `# Generated: ${new Date().toISOString()}`,
      ''
    ];

    // Add app launch commands
    context.windows.forEach(window => {
      lines.push(`# Launch ${window.app}`);
      lines.push(`open -a "${window.app}"`);
      lines.push('');
    });

    return lines.join('\n');
  }

  async exportAsAppleScript(contextId: string): Promise<string> {
    const context = getContext(contextId);
    if (!context) {
      throw new Error('Context not found');
    }

    const lines: string[] = [
      `-- Context Flow - AppleScript`,
      `-- Context: ${context.name}`,
      ''
    ];

    context.windows.forEach(window => {
      lines.push(`tell application "${window.app}" to activate`);
    });

    return lines.join('\n');
  }

  // Backup/Restore

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `context-flow-backup-${timestamp}.json`;
    
    await this.exportToFile(fileName);
    
    return fileName;
  }

  async restoreFromBackup(filePath: string): Promise<ImportResult> {
    console.log(`[Import] Restoring from ${filePath}`);
    return this.importFromFile(filePath);
  }
}

export const importExportManager = new ImportExportManager();
export { ExportData, ImportResult };
