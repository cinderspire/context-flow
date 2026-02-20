/**
 * VSCode Adapter
 * Captures and restores VSCode workspace state
 */

import type { AppAdapter, WindowState, VSCodeState } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export class VSCodeAdapter implements AppAdapter {
  name = 'VSCode';
  apps = ['Code', 'Visual Studio Code', 'code'];

  async capture(window: WindowState): Promise<VSCodeState | null> {
    try {
      // Try to get workspace from window title
      // VSCode typically shows: "folderName - workspaceName - Visual Studio Code"
      const titleParts = window.title.split(' - ');
      const workspace = titleParts.length > 1 ? titleParts[titleParts.length - 2] : undefined;

      // Try to get open files using VSCode CLI
      const openFiles = await this.getOpenFiles();

      return {
        workspace,
        openFiles,
        activeFile: openFiles.find(f => f.active)?.path
      };
    } catch (error) {
      console.error('[VSCodeAdapter] Capture failed:', error);
      return null;
    }
  }

  async restore(window: WindowState, state: VSCodeState): Promise<void> {
    try {
      // Open workspace if available
      if (state.workspace) {
        const workspacePath = await this.findWorkspacePath(state.workspace);
        if (workspacePath) {
          await execAsync(`code "${workspacePath}"`);
          await this.delay(1500);
        }
      }

      // Open files
      if (state.openFiles && state.openFiles.length > 0) {
        for (const file of state.openFiles) {
          if (fs.existsSync(file.path)) {
            await execAsync(`code "${file.path}"`);
            await this.delay(200);
          }
        }
      }
    } catch (error) {
      console.error('[VSCodeAdapter] Restore failed:', error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await execAsync('code --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Try to get open files from VSCode
   * Note: This is limited without an extension
   */
  private async getOpenFiles(): Promise<Array<{ path: string; active?: boolean }>> {
    // Without a VSCode extension, we can't reliably get open files
    // This is a placeholder that would be enhanced with an extension
    return [];
  }

  /**
   * Find workspace path by name
   */
  private async findWorkspacePath(workspaceName: string): Promise<string | null> {
    // Common locations to check
    const commonPaths = [
      path.join(process.env.HOME || '', 'Projects', workspaceName),
      path.join(process.env.HOME || '', 'Documents', workspaceName),
      path.join(process.env.HOME || '', 'Workspace', workspaceName),
      path.join(process.env.HOME || '', workspaceName),
    ];

    for (const checkPath of commonPaths) {
      if (fs.existsSync(checkPath)) {
        return checkPath;
      }
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Register adapter
import { adapterRegistry } from './registry';
adapterRegistry.register(new VSCodeAdapter());
