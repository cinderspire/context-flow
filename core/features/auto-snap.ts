/**
 * Auto Snap Feature
 * Automatically captures context based on triggers
 */

import type { ContextSnapshot } from '../types';
import { captureContext } from '../engine/capture';
import { saveContext } from '../storage/contexts';
import { recordEvent } from '../ai/predictor';

interface AutoSnapConfig {
  enabled: boolean;
  intervalMinutes: number;
  onProjectChange: boolean;
  onAppSwitch: boolean;
  onGitBranchChange: boolean;
  minIntervalSeconds: number;
}

const DEFAULT_CONFIG: AutoSnapConfig = {
  enabled: true,
  intervalMinutes: 30,
  onProjectChange: true,
  onAppSwitch: false,
  onGitBranchChange: true,
  minIntervalSeconds: 300 // 5 minutes
};

class AutoSnapManager {
  private config: AutoSnapConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private lastSnapTime: number = 0;
  private lastProject: string | null = null;
  private lastGitBranch: string | null = null;

  constructor(config: Partial<AutoSnapConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(): void {
    if (!this.config.enabled) return;

    console.log('[AutoSnap] Started');
    
    // Time-based auto-snap
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.checkAndSnap();
    }, this.config.intervalMinutes * 60 * 1000);

    // Watch for project changes
    if (this.config.onProjectChange) {
      this.watchProjectChanges();
    }

    // Watch for git branch changes
    if (this.config.onGitBranchChange) {
      this.watchGitChanges();
    }
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[AutoSnap] Stopped');
  }

  async checkAndSnap(): Promise<void> {
    const now = Date.now();
    
    // Check minimum interval
    if (now - this.lastSnapTime < this.config.minIntervalSeconds * 1000) {
      return;
    }

    // Check if user is active
    const isActive = await this.checkUserActivity();
    if (!isActive) {
      return;
    }

    await this.performSnap('time_based');
  }

  async performSnap(reason: string): Promise<ContextSnapshot | null> {
    try {
      console.log(`[AutoSnap] Performing snap: ${reason}`);
      
      const snapshot = await captureContext(`Auto: ${reason}`);
      saveContext(snapshot);
      await recordEvent('auto_snap', snapshot.id);
      
      this.lastSnapTime = Date.now();
      
      // Notify UI
      this.notifyUI('context-auto-saved', { snapshot, reason });
      
      return snapshot;
    } catch (error) {
      console.error('[AutoSnap] Failed:', error);
      return null;
    }
  }

  private async watchProjectChanges(): Promise<void> {
    setInterval(async () => {
      const currentProject = await this.detectActiveProject();
      
      if (currentProject && currentProject !== this.lastProject) {
        console.log(`[AutoSnap] Project changed: ${this.lastProject} -> ${currentProject}`);
        await this.performSnap('project_change');
        this.lastProject = currentProject;
      }
    }, 10000);
  }

  private async watchGitChanges(): Promise<void> {
    setInterval(async () => {
      const currentBranch = await this.detectGitBranch();
      
      if (currentBranch && currentBranch !== this.lastGitBranch) {
        console.log(`[AutoSnap] Git branch changed: ${this.lastGitBranch} -> ${currentBranch}`);
        await this.performSnap('git_branch_change');
        this.lastGitBranch = currentBranch;
      }
    }, 5000);
  }

  private async detectActiveProject(): Promise<string | null> {
    return null;
  }

  private async detectGitBranch(): Promise<string | null> {
    return null;
  }

  private async checkUserActivity(): Promise<boolean> {
    return true;
  }

  private notifyUI(channel: string, data: any): void {
    if (typeof process !== 'undefined' && process.send) {
      process.send({ channel, data });
    }
  }

  updateConfig(config: Partial<AutoSnapConfig>): void {
    this.config = { ...this.config, ...config };
    this.stop();
    this.start();
  }
}

export const autoSnapManager = new AutoSnapManager();
export { AutoSnapConfig };
