/**
 * Terminal Adapter
 * Captures and restores terminal state
 */

import type { AppAdapter, WindowState, TerminalState } from '../types';
import * as path from 'path';
import * as os from 'os';

export class TerminalAdapter implements AppAdapter {
  name = 'Terminal';
  apps = ['Terminal', 'iTerm2', 'Hyper', 'Warp'];

  async capture(window: WindowState): Promise<TerminalState | null> {
    // Terminal state capture requires shell integration
    // For MVP, we try to infer from window title
    
    const title = window.title;
    
    // Try to extract current directory from title
    // Many terminals show CWD in title
    const cwd = this.extractCwd(title);
    
    return {
      cwd: cwd || os.homedir(),
      shell: this.detectShell(title)
    };
  }

  async restore(window: WindowState, state: TerminalState): Promise<void> {
    // Terminal restoration is limited without deep integration
    // We can try to set the window title to indicate the CWD
    
    console.log('[TerminalAdapter] Would restore CWD:', state.cwd);
    
    // In a full implementation, we would:
    // 1. Use AppleScript (macOS) to send commands to Terminal
    // 2. Or use terminal's own scripting interface
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private extractCwd(title: string): string | undefined {
    // Try to extract path from terminal title
    // Common patterns:
    // - "user@host:~/path" (bash default)
    // - "path - Terminal" (some configs)
    // - Just the folder name
    
    // Pattern: user@host:~/path
    const sshPattern = title.match(/:~?\/([^"]+)/);
    if (sshPattern) {
      return path.join(os.homedir(), sshPattern[1]);
    }
    
    // Pattern: path - Terminal
    const dashPattern = title.match(/(.+)\s+-\s+(Terminal|iTerm|Hyper)/);
    if (dashPattern) {
      const potentialPath = dashPattern[1];
      if (potentialPath.startsWith('/') || potentialPath.startsWith('~')) {
        return potentialPath.replace(/^~/, os.homedir());
      }
    }
    
    return undefined;
  }

  private detectShell(title: string): string {
    if (title.includes('zsh')) return 'zsh';
    if (title.includes('bash')) return 'bash';
    if (title.includes('fish')) return 'fish';
    return 'unknown';
  }
}

// Register adapter
import { adapterRegistry } from './registry';
adapterRegistry.register(new TerminalAdapter());
