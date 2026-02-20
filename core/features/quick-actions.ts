/**
 * Quick Actions Feature
 * Automated actions when switching contexts
 */

interface QuickAction {
  id: string;
  name: string;
  type: 'open_url' | 'play_music' | 'run_command' | 'set_status' | 'open_file';
  config: Record<string, any>;
  enabled: boolean;
}

interface ActionSet {
  contextId: string;
  onEnter: QuickAction[];
  onExit: QuickAction[];
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'focus_playlist',
    name: 'Play Focus Playlist',
    type: 'play_music',
    config: { playlist: 'Focus', app: 'Spotify' },
    enabled: false
  },
  {
    id: 'dnd_mode',
    name: 'Enable Do Not Disturb',
    type: 'set_status',
    config: { status: 'dnd' },
    enabled: true
  },
  {
    id: 'open_dashboard',
    name: 'Open Project Dashboard',
    type: 'open_url',
    config: { url: 'https://linear.app' },
    enabled: false
  }
];

class QuickActionsManager {
  private actionSets: Map<string, ActionSet> = new Map();
  private templates: QuickAction[] = [...DEFAULT_ACTIONS];

  constructor() {}

  async executeOnEnter(contextId: string): Promise<void> {
    const actionSet = this.actionSets.get(contextId);
    if (!actionSet) return;

    console.log(`[QuickActions] Executing enter actions for ${contextId}`);
    
    for (const action of actionSet.onEnter) {
      if (action.enabled) {
        await this.executeAction(action);
      }
    }
  }

  async executeOnExit(contextId: string): Promise<void> {
    const actionSet = this.actionSets.get(contextId);
    if (!actionSet) return;

    console.log(`[QuickActions] Executing exit actions for ${contextId}`);
    
    for (const action of actionSet.onExit) {
      if (action.enabled) {
        await this.executeAction(action);
      }
    }
  }

  private async executeAction(action: QuickAction): Promise<void> {
    console.log(`[QuickActions] Executing: ${action.name}`);

    switch (action.type) {
      case 'open_url':
        await this.openURL(action.config.url);
        break;
      
      case 'play_music':
        await this.playMusic(action.config);
        break;
      
      case 'run_command':
        await this.runCommand(action.config.command);
        break;
      
      case 'set_status':
        await this.setStatus(action.config);
        break;
      
      case 'open_file':
        await this.openFile(action.config.path);
        break;
    }
  }

  private async openURL(url: string): Promise<void> {
    // Open URL in default browser
    const { exec } = require('child_process');
    const cmd = process.platform === 'darwin' ? `open "${url}"` : `start "${url}"`;
    exec(cmd);
  }

  private async playMusic(config: { playlist: string; app: string }): Promise<void> {
    // Control Spotify/Apple Music
    console.log(`[QuickActions] Playing ${config.playlist} on ${config.app}`);
  }

  private async runCommand(command: string): Promise<void> {
    const { exec } = require('child_process');
    exec(command);
  }

  private async setStatus(config: { status: string; message?: string }): Promise<void> {
    // Set Slack/Teams status
    console.log(`[QuickActions] Setting status: ${config.status}`);
  }

  private async openFile(path: string): Promise<void> {
    const { exec } = require('child_process');
    const cmd = process.platform === 'darwin' ? `open "${path}"` : `start "${path}"`;
    exec(cmd);
  }

  addActionToContext(contextId: string, action: QuickAction, when: 'enter' | 'exit'): void {
    if (!this.actionSets.has(contextId)) {
      this.actionSets.set(contextId, { contextId, onEnter: [], onExit: [] });
    }

    const actionSet = this.actionSets.get(contextId)!;
    if (when === 'enter') {
      actionSet.onEnter.push(action);
    } else {
      actionSet.onExit.push(action);
    }
  }

  removeAction(contextId: string, actionId: string): void {
    const actionSet = this.actionSets.get(contextId);
    if (!actionSet) return;

    actionSet.onEnter = actionSet.onEnter.filter(a => a.id !== actionId);
    actionSet.onExit = actionSet.onExit.filter(a => a.id !== actionId);
  }

  getTemplates(): QuickAction[] {
    return [...this.templates];
  }

  createCustomAction(name: string, type: QuickAction['type'], config: Record<string, any>): QuickAction {
    return {
      id: `custom_${Date.now()}`,
      name,
      type,
      config,
      enabled: true
    };
  }
}

export const quickActionsManager = new QuickActionsManager();
export { QuickAction, ActionSet };
