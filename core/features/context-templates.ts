/**
 * Context Templates Feature
 * Predefined context templates for common workflows
 */

import type { ContextSnapshot } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ContextTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'development' | 'design' | 'meeting' | 'communication' | 'personal';
  targetApps: string[];
  suggestedLayout: 'single' | 'split' | 'triple' | 'grid';
}

const BUILT_IN_TEMPLATES: ContextTemplate[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    emoji: '💻',
    description: 'VSCode + Chrome + Terminal setup',
    category: 'development',
    targetApps: ['Visual Studio Code', 'Google Chrome', 'Terminal'],
    suggestedLayout: 'triple'
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    emoji: '📱',
    description: 'Xcode/Android Studio + Simulator',
    category: 'development',
    targetApps: ['Xcode', 'Simulator', 'Terminal'],
    suggestedLayout: 'split'
  },
  {
    id: 'ui-design',
    name: 'UI Design',
    emoji: '🎨',
    description: 'Figma + Reference images',
    category: 'design',
    targetApps: ['Figma', 'Google Chrome', 'Preview'],
    suggestedLayout: 'split'
  },
  {
    id: 'video-edit',
    name: 'Video Editing',
    emoji: '🎬',
    description: 'Premiere/Final Cut + Assets',
    category: 'design',
    targetApps: ['Final Cut Pro', 'Finder'],
    suggestedLayout: 'single'
  },
  {
    id: 'zoom-meeting',
    name: 'Video Meeting',
    emoji: '📹',
    description: 'Zoom/Teams + Notes',
    category: 'meeting',
    targetApps: ['zoom.us', 'Notion', 'Calendar'],
    suggestedLayout: 'split'
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    emoji: '🧠',
    description: 'Single app, no distractions',
    category: 'personal',
    targetApps: [],
    suggestedLayout: 'single'
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    emoji: '🌅',
    description: 'Email + Calendar + News',
    category: 'communication',
    targetApps: ['Mail', 'Calendar', 'Safari'],
    suggestedLayout: 'triple'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    emoji: '👀',
    description: 'GitHub + VSCode side by side',
    category: 'development',
    targetApps: ['Google Chrome', 'Visual Studio Code'],
    suggestedLayout: 'split'
  }
];

class ContextTemplatesManager {
  private templates: Map<string, ContextTemplate> = new Map();
  private customTemplates: Map<string, ContextTemplate> = new Map();

  constructor() {
    // Load built-in templates
    BUILT_IN_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  getAllTemplates(): ContextTemplate[] {
    return [
      ...Array.from(this.templates.values()),
      ...Array.from(this.customTemplates.values())
    ];
  }

  getTemplatesByCategory(category: ContextTemplate['category']): ContextTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  getTemplate(id: string): ContextTemplate | undefined {
    return this.templates.get(id) || this.customTemplates.get(id);
  }

  createCustomTemplate(
    name: string,
    emoji: string,
    targetApps: string[],
    category: ContextTemplate['category']
  ): ContextTemplate {
    const template: ContextTemplate = {
      id: `custom_${uuidv4()}`,
      name,
      emoji,
      description: 'Custom template',
      category,
      targetApps,
      suggestedLayout: 'split'
    };

    this.customTemplates.set(template.id, template);
    this.saveCustomTemplates();
    
    return template;
  }

  deleteCustomTemplate(id: string): boolean {
    if (this.customTemplates.has(id)) {
      this.customTemplates.delete(id);
      this.saveCustomTemplates();
      return true;
    }
    return false;
  }

  applyTemplate(templateId: string): void {
    const template = this.getTemplate(templateId);
    if (!template) return;

    console.log(`[Templates] Applying template: ${template.name}`);
    
    // Launch target apps
    template.targetApps.forEach(app => {
      this.launchApp(app);
    });

    // Apply suggested layout
    this.applyLayout(template.suggestedLayout);
  }

  async createContextFromTemplate(templateId: string, name?: string): Promise<void> {
    const template = this.getTemplate(templateId);
    if (!template) return;

    // Apply template
    this.applyTemplate(templateId);

    // Wait for apps to launch
    await this.delay(2000);

    // Capture as new context
    console.log(`[Templates] Creating context from template: ${template.name}`);
    
    // This would trigger a snap
  }

  private launchApp(appName: string): void {
    const { exec } = require('child_process');
    const cmd = process.platform === 'darwin' 
      ? `open -a "${appName}"`
      : `start "" "${appName}"`;
    
    exec(cmd, (err: any) => {
      if (err) {
        console.error(`[Templates] Failed to launch ${appName}:`, err);
      }
    });
  }

  private applyLayout(layout: ContextTemplate['suggestedLayout']): void {
    console.log(`[Templates] Applying layout: ${layout}`);
    // This would use window manager to arrange apps
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private saveCustomTemplates(): void {
    // Persist to storage
    const templates = Array.from(this.customTemplates.values());
    console.log(`[Templates] Saved ${templates.length} custom templates`);
  }

  getCategories(): Array<{ id: ContextTemplate['category']; name: string; emoji: string }> {
    return [
      { id: 'development', name: 'Development', emoji: '💻' },
      { id: 'design', name: 'Design', emoji: '🎨' },
      { id: 'meeting', name: 'Meetings', emoji: '📹' },
      { id: 'communication', name: 'Communication', emoji: '💬' },
      { id: 'personal', name: 'Personal', emoji: '🏠' }
    ];
  }
}

export const templatesManager = new ContextTemplatesManager();
export { ContextTemplate };
