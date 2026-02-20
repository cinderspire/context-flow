/**
 * AI Naming & Tagging
 * Generates intelligent names and tags for contexts
 */

import type { WindowState, AppState } from '../types';

/**
 * Generate context name based on app states and windows
 */
export async function generateContextName(
  appStates: Record<string, AppState>,
  windows: WindowState[]
): Promise<string> {
  const candidates: string[] = [];

  // Check VSCode workspace
  if (appStates.vscode?.workspace) {
    candidates.push(appStates.vscode.workspace);
  }

  // Check active file in VSCode
  if (appStates.vscode?.activeFile) {
    const filename = appStates.vscode.activeFile.split('/').pop();
    if (filename) {
      candidates.push(filename.replace(/\.(js|ts|jsx|tsx|py|html|css)$/, ''));
    }
  }

  // Check Chrome domain
  if (appStates.chrome?.tabs?.[0]) {
    const url = appStates.chrome.tabs[0].url;
    const domain = extractDomain(url);
    if (domain && domain !== 'about:blank') {
      candidates.push(domain);
    }
  }

  // Check Terminal CWD
  if (appStates.terminal?.cwd) {
    const folder = appStates.terminal.cwd.split('/').pop();
    if (folder && folder !== process.env.USER) {
      candidates.push(folder);
    }
  }

  // Use window titles as fallback
  if (candidates.length === 0) {
    for (const window of windows) {
      const cleanTitle = cleanWindowTitle(window.title, window.app);
      if (cleanTitle && cleanTitle.length > 2) {
        candidates.push(cleanTitle);
        break;
      }
    }
  }

  // Add timestamp if no good name found
  if (candidates.length === 0) {
    return `Workspace ${formatTime(new Date())}`;
  }

  // Pick best candidate and add time
  const bestName = candidates[0];
  const timeLabel = getTimeLabel();
  
  return `${bestName} ${timeLabel}`;
}

/**
 * Detect project name from app states
 */
export function detectProject(
  appStates: Record<string, AppState>
): string | undefined {
  // Priority: VSCode workspace > Terminal CWD > undefined
  
  if (appStates.vscode?.workspace) {
    return appStates.vscode.workspace;
  }
  
  if (appStates.terminal?.cwd) {
    const parts = appStates.terminal.cwd.split('/');
    // Return last non-home folder
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] && parts[i] !== process.env.USER && parts[i] !== 'Users') {
        return parts[i];
      }
    }
  }
  
  return undefined;
}

/**
 * Extract tags from context
 */
export function extractTags(
  appStates: Record<string, AppState>,
  windows: WindowState[]
): string[] {
  const tags: string[] = [];

  // App-based tags
  const activeApps = Object.keys(appStates);
  
  if (activeApps.includes('vscode')) tags.push('coding');
  if (activeApps.includes('chrome')) tags.push('web');
  if (activeApps.includes('terminal')) tags.push('terminal');
  
  // File type tags from VSCode
  if (appStates.vscode?.openFiles) {
    const extensions = new Set<string>();
    for (const file of appStates.vscode.openFiles) {
      const ext = file.path.split('.').pop();
      if (ext) extensions.add(ext);
    }
    
    if (extensions.has('js') || extensions.has('ts')) tags.push('javascript');
    if (extensions.has('py')) tags.push('python');
    if (extensions.has('md')) tags.push('docs');
    if (extensions.has('json')) tags.push('config');
  }

  // Time-based tag
  const hour = new Date().getHours();
  if (hour < 12) tags.push('morning');
  else if (hour < 18) tags.push('afternoon');
  else tags.push('evening');

  return [...new Set(tags)];
}

/**
 * Clean window title for name generation
 */
function cleanWindowTitle(title: string, app: string): string | null {
  // Remove app names from title
  const appPatterns = [
    / - (Google Chrome|Chromium)$/,
    / - Visual Studio Code$/,
    / - Terminal$/,
    / - Safari$/,
    / - Spotify$/,
    / - Slack$/,
  ];

  let cleaned = title;
  for (const pattern of appPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove common suffixes
  cleaned = cleaned
    .replace(/ - \w+@\w+$/g, '') // SSH sessions
    .replace(/^\d+\s+/, '') // Leading numbers
    .trim();

  // Return null if too short or generic
  if (cleaned.length < 3 || cleaned === app) {
    return null;
  }

  return cleaned;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Format time for naming
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get time label
 */
function getTimeLabel(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 14) return 'Lunch';
  if (hour >= 14 && hour < 18) return 'Afternoon';
  if (hour >= 18 && hour < 22) return 'Evening';
  return 'Night';
}
