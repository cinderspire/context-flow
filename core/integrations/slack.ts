/**
 * Slack/Teams Integration
 * Sync status with context changes
 */

interface SlackStatus {
  text: string;
  emoji: string;
  expiration?: number;
}

interface SlackConfig {
  enabled: boolean;
  autoUpdateStatus: boolean;
  showContextName: boolean;
  dndDuringFocus: boolean;
}

const DEFAULT_CONFIG: SlackConfig = {
  enabled: false,
  autoUpdateStatus: true,
  showContextName: true,
  dndDuringFocus: true
};

class SlackIntegration {
  private config: SlackConfig;
  private token: string | null = null;

  constructor(config: Partial<SlackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setToken(token: string): void {
    this.token = token;
  }

  async updateStatus(status: SlackStatus): Promise<void> {
    if (!this.config.enabled || !this.token) return;
    console.log(`[Slack] Updating status: ${status.emoji} ${status.text}`);
  }

  async clearStatus(): Promise<void> {
    await this.updateStatus({ text: '', emoji: '' });
  }

  async enableDoNotDisturb(minutes: number = 25): Promise<void> {
    if (!this.config.dndDuringFocus || !this.token) return;
    console.log(`[Slack] Enabling DND for ${minutes} minutes`);
  }

  async disableDoNotDisturb(): Promise<void> {
    if (!this.token) return;
    console.log('[Slack] Disabling DND');
  }

  async onContextEnter(contextName: string): Promise<void> {
    if (this.config.autoUpdateStatus) {
      await this.updateStatus({ text: `Working on: ${contextName}`, emoji: ':computer:' });
    }
  }

  async onContextExit(): Promise<void> {
    await this.clearStatus();
    await this.disableDoNotDisturb();
  }

  updateConfig(config: Partial<SlackConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const slackIntegration = new SlackIntegration();
export { SlackStatus, SlackConfig };
