/**
 * Chrome Adapter
 * Captures and restores Chrome browser state
 */

import type { AppAdapter, WindowState, ChromeState } from '../types';

export class ChromeAdapter implements AppAdapter {
  name = 'Chrome';
  apps = ['Google Chrome', 'Chrome', 'Chromium'];

  async capture(window: WindowState): Promise<ChromeState | null> {
    // Chrome state capture requires an extension
    // For MVP, we capture basic info from window title
    
    const title = window.title;
    
    // Try to extract domain from title
    // Chrome titles typically end with " - Google Chrome" or similar
    const domain = this.extractDomain(title);
    
    return {
      tabs: [{
        url: domain || 'about:blank',
        title: title.replace(/ - (Google Chrome|Chromium)$/, ''),
        active: true
      }]
    };
  }

  async restore(window: WindowState, state: ChromeState): Promise<void> {
    // Chrome restoration would require:
    // 1. Chrome extension to communicate with native app
    // 2. Or use Chrome's session restore APIs
    
    // For MVP, we can at least ensure Chrome is launched
    // Full tab restoration requires extension
    
    console.log('[ChromeAdapter] Would restore tabs:', state.tabs.length);
  }

  async isAvailable(): Promise<boolean> {
    return true; // Chrome is usually available
  }

  private extractDomain(title: string): string | undefined {
    // Try to extract domain from title
    // Many sites put domain in title like "Page Title - example.com"
    const match = title.match(/ - ([\w.-]+\.[a-zA-Z]{2,})/);
    return match ? `https://${match[1]}` : undefined;
  }
}

// Register adapter
import { adapterRegistry } from './registry';
adapterRegistry.register(new ChromeAdapter());
