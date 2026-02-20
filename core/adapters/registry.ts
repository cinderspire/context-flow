/**
 * App Adapter Registry
 * Manages app-specific adapters for state capture/restore
 */

import type { AppAdapter, WindowState, AppState } from '../types';

class AdapterRegistry {
  private adapters: Map<string, AppAdapter> = new Map();
  private appMappings: Map<string, string> = new Map();

  /**
   * Register an adapter
   */
  register(adapter: AppAdapter): void {
    this.adapters.set(adapter.name.toLowerCase(), adapter);
    
    // Map all app names to this adapter
    for (const app of adapter.apps) {
      this.appMappings.set(app.toLowerCase(), adapter.name.toLowerCase());
    }
    
    console.log(`[AdapterRegistry] Registered: ${adapter.name}`);
  }

  /**
   * Get adapter for an app
   */
  getAdapter(appName: string): AppAdapter | null {
    const normalizedName = appName.toLowerCase();
    
    // Direct match
    if (this.adapters.has(normalizedName)) {
      return this.adapters.get(normalizedName)!;
    }
    
    // Check app mappings
    const adapterName = this.appMappings.get(normalizedName);
    if (adapterName) {
      return this.adapters.get(adapterName) || null;
    }
    
    // Partial match
    for (const [key, adapter] of this.adapters) {
      for (const app of adapter.apps) {
        if (normalizedName.includes(app.toLowerCase()) || 
            app.toLowerCase().includes(normalizedName)) {
          return adapter;
        }
      }
    }
    
    return null;
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): AppAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Check if adapter exists for app
   */
  hasAdapter(appName: string): boolean {
    return this.getAdapter(appName) !== null;
  }
}

// Singleton instance
export const adapterRegistry = new AdapterRegistry();

// Generic fallback adapter (window position only)
class GenericAdapter implements AppAdapter {
  name = 'Generic';
  apps = ['*']; // Catch-all

  async capture(window: WindowState): Promise<AppState | null> {
    // Generic adapter doesn't capture app-specific state
    return null;
  }

  async restore(window: WindowState, state: AppState): Promise<void> {
    // Generic adapter doesn't restore app-specific state
    // Window position is handled by the restore engine
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

// Register generic adapter
adapterRegistry.register(new GenericAdapter());
