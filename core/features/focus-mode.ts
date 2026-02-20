/**
 * Focus Mode Feature
 * Distraction-free workspace mode
 */

interface FocusModeConfig {
  enabled: boolean;
  allowedApps: string[];
  blockedApps: string[];
  hideNotifications: boolean;
  minDurationMinutes: number;
}

const DEFAULT_FOCUS_CONFIG: FocusModeConfig = {
  enabled: false,
  allowedApps: [],
  blockedApps: ['Slack', 'Discord', 'Telegram', 'WhatsApp', 'Twitter'],
  hideNotifications: true,
  minDurationMinutes: 25 // Pomodoro style
};

class FocusModeManager {
  private config: FocusModeConfig;
  private isActive: boolean = false;
  private startTime: number = 0;
  private originalWindows: Array<{ app: string; minimized: boolean }> = [];

  constructor(config: Partial<FocusModeConfig> = {}) {
    this.config = { ...DEFAULT_FOCUS_CONFIG, ...config };
  }

  async activate(contextId?: string): Promise<void> {
    if (this.isActive) return;

    console.log('[FocusMode] Activating...');
    
    this.isActive = true;
    this.startTime = Date.now();

    // Save current window states
    await this.saveWindowStates();

    // Minimize blocked apps
    await this.minimizeBlockedApps();

    // Hide notifications
    if (this.config.hideNotifications) {
      this.enableDoNotDisturb();
    }

    // Start focus timer
    this.startFocusTimer();

    console.log('[FocusMode] Activated');
  }

  async deactivate(): Promise<void> {
    if (!this.isActive) return;

    console.log('[FocusMode] Deactivating...');

    // Restore original window states
    await this.restoreWindowStates();

    // Re-enable notifications
    if (this.config.hideNotifications) {
      this.disableDoNotDisturb();
    }

    this.isActive = false;
    
    // Calculate focus duration
    const duration = (Date.now() - this.startTime) / 1000 / 60;
    console.log(`[FocusMode] Session ended. Duration: ${duration.toFixed(1)} minutes`);

    // Record analytics
    this.recordFocusSession(duration);
  }

  toggle(): void {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  isFocused(): boolean {
    return this.isActive;
  }

  getElapsedTime(): number {
    if (!this.isActive) return 0;
    return Date.now() - this.startTime;
  }

  private async saveWindowStates(): Promise<void> {
    // Save which apps are currently visible/minimized
    this.originalWindows = [];
    // Implementation would use window manager
  }

  private async minimizeBlockedApps(): Promise<void> {
    // Minimize distracting apps
    for (const app of this.config.blockedApps) {
      console.log(`[FocusMode] Minimizing: ${app}`);
      // Implementation would use window manager
    }
  }

  private async restoreWindowStates(): Promise<void> {
    // Restore apps to their original state
    for (const window of this.originalWindows) {
      console.log(`[FocusMode] Restoring: ${window.app}`);
    }
  }

  private enableDoNotDisturb(): void {
    // macOS: defaults -currentHost write ~/Library/Preferences/ByHost/com.apple.notificationcenterui doNotDisturb -boolean true
    console.log('[FocusMode] Do Not Disturb enabled');
  }

  private disableDoNotDisturb(): void {
    console.log('[FocusMode] Do Not Disturb disabled');
  }

  private startFocusTimer(): void {
    if (this.config.minDurationMinutes > 0) {
      setTimeout(() => {
        this.notifyFocusComplete();
      }, this.config.minDurationMinutes * 60 * 1000);
    }
  }

  private notifyFocusComplete(): void {
    // Show notification that focus time is complete
    console.log('[FocusMode] Focus session complete!');
    // Could play sound or show notification
  }

  private recordFocusSession(durationMinutes: number): void {
    // Record to analytics
    console.log(`[FocusMode] Recording session: ${durationMinutes} minutes`);
  }

  setAllowedApps(apps: string[]): void {
    this.config.allowedApps = apps;
  }

  setBlockedApps(apps: string[]): void {
    this.config.blockedApps = apps;
  }
}

export const focusModeManager = new FocusModeManager();
export { FocusModeConfig };
