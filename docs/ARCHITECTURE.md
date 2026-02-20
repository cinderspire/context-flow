# 🏗️ Context Flow - Teknik Mimari

## Genel Bakış

Context Flow, Electron tabanlı bir desktop uygulaması olarak geliştirilmiştir. Temel bileşenleri:

- **Main Process:** Node.js + Electron - Sistem seviyesi işlemler
- **Renderer Process:** React + TypeScript - Kullanıcı arayüzü
- **Context Engine:** State capture/restore mantığı
- **App Adapters:** Uygulama-spesifik entegrasyonlar
- **AI Engine:** Pattern recognition ve öneriler
- **Hardware Bridge:** Logitech Actions SDK entegrasyonu

---

## Sistem Mimarisî

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CONTEXT FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     MAIN PROCESS (Node.js)                   │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Context   │  │    App      │  │    AI Prediction    │  │   │
│  │  │   Engine    │  │  Adapters   │  │      Engine         │  │   │
│  │  │             │  │             │  │                     │  │   │
│  │  │ • Capture   │  │ • VSCode    │  │ • Pattern Learner   │  │   │
│  │  │ • Restore   │  │ • Chrome    │  │ • Time Analyzer     │  │   │
│  │  │ • Manager   │  │ • Terminal  │  │ • Suggestion Gen    │  │   │
│  │  │             │  │ • Figma     │  │                     │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │   │
│  │         │                │                    │             │   │
│  │         └────────────────┼────────────────────┘             │   │
│  │                          ▼                                  │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │              State Storage (SQLite)                  │   │   │
│  │  │  • Context snapshots                                 │   │   │
│  │  │  • App states                                        │   │   │
│  │  │  • User preferences                                  │   │   │
│  │  │  • Analytics data                                    │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │           Hardware Bridge (Logitech SDK)            │   │   │
│  │  │  • MX Creative Console events                       │   │   │
│  │  │  • MX Master Actions Ring                           │   │   │
│  │  │  • Haptic feedback control                          │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              │ IPC                                  │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   RENDERER PROCESS (React)                   │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │   │
│  │  │    Main      │  │   Timeline   │  │   Settings       │   │   │
│  │  │    UI        │  │   View       │  │   Panel          │   │   │
│  │  │              │  │              │  │                  │   │   │
│  │  │ • Snap button│  │ • Context    │  │ • Preferences    │   │   │
│  │  │ • Context    │  │   history    │  │ • App configs    │   │   │
│  │  │   list       │  │ • Analytics  │  │ • Shortcuts      │   │   │
│  │  │ • Ring HUD   │  │              │  │                  │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Context Engine

### State Capture Flow

```typescript
// 1. Trigger: SNAP button pressed
async function captureContext(): Promise<ContextSnapshot> {
  
  // 2. Get all visible windows
  const windows = await windowManager.getWindows();
  
  // 3. For each window, get app-specific state
  const appStates = await Promise.all(
    windows.map(async (window) => {
      const adapter = getAdapter(window.app);
      return adapter ? await adapter.capture(window) : null;
    })
  );
  
  // 4. Build snapshot
  const snapshot: ContextSnapshot = {
    id: generateId(),
    timestamp: Date.now(),
    name: generateName(appStates), // AI-powered naming
    windows: windows.map(w => ({
      app: w.app,
      title: w.title,
      bounds: w.bounds,
      minimized: w.minimized,
      focused: w.focused
    })),
    appStates: mergeAppStates(appStates),
    metadata: {
      project: detectProject(appStates),
      tags: extractTags(appStates),
      duration: 0 // Will be updated on restore
    }
  };
  
  // 5. Save to storage
  await storage.save(snapshot);
  
  return snapshot;
}
```

### State Restore Flow

```typescript
async function restoreContext(snapshotId: string): Promise<void> {
  const snapshot = await storage.get(snapshotId);
  
  // 1. Close/minimize current windows (optional)
  if (settings.closeOthers) {
    await windowManager.minimizeAll();
  }
  
  // 2. Restore each window
  for (const window of snapshot.windows) {
    // Check if app is running
    let appWindow = await windowManager.findWindow(window.app, window.title);
    
    if (!appWindow) {
      // Launch app
      await launchApp(window.app);
      appWindow = await waitForWindow(window.app, 5000);
    }
    
    // Restore window state
    if (appWindow) {
      await appWindow.setBounds(window.bounds);
      if (window.minimized) {
        await appWindow.minimize();
      } else if (window.focused) {
        await appWindow.focus();
      }
      
      // Restore app-specific state via adapter
      const adapter = getAdapter(window.app);
      if (adapter && snapshot.appStates[window.app]) {
        await adapter.restore(appWindow, snapshot.appStates[window.app]);
      }
    }
  }
  
  // 3. Update metadata
  snapshot.metadata.lastRestored = Date.now();
  snapshot.metadata.restoreCount++;
  await storage.update(snapshot);
}
```

---

## App Adapter System

### Adapter Interface

```typescript
interface AppAdapter {
  name: string;
  apps: string[]; // Process names
  
  // Capture app-specific state
  capture(window: Window): Promise<AppState>;
  
  // Restore app-specific state
  restore(window: Window, state: AppState): Promise<void>;
  
  // Check if adapter is available
  isAvailable(): Promise<boolean>;
}

// Example: VSCode Adapter
class VSCodeAdapter implements AppAdapter {
  name = 'VSCode';
  apps = ['Code', 'Visual Studio Code'];
  
  async capture(window: Window): Promise<VSCodeState> {
    // Use VSCode CLI or extension API
    const workspace = await this.getWorkspace();
    const openFiles = await this.getOpenFiles();
    const cursorPosition = await this.getCursorPosition();
    
    return {
      workspace,
      openFiles,
      cursorPosition,
      extensions: await this.getActiveExtensions()
    };
  }
  
  async restore(window: Window, state: VSCodeState): Promise<void> {
    // Open workspace
    await exec(`code "${state.workspace}"`);
    
    // Wait for load
    await delay(1000);
    
    // Open files
    for (const file of state.openFiles) {
      await exec(`code "${file.path}"`);
    }
    
    // Restore cursor position
    await this.setCursorPosition(state.cursorPosition);
  }
}
```

### Supported Adapters (MVP)

| Adapter | Capture | Restore | Method |
|---------|---------|---------|--------|
| Generic | Window bounds | Bounds only | node-window-manager |
| VSCode | Workspace, files, cursor | Full restore | CLI + Extension |
| Chrome | Tabs, scroll positions | Tab restore | Extension API |
| Terminal | CWD, history | CWD only | Shell integration |
| Figma | Open file, zoom | File open | Deep link |

---

## AI Prediction Engine

### Pattern Learning

```typescript
class PatternLearner {
  private db: Database;
  
  // Learn from user behavior
  async learn(event: UserEvent): Promise<void> {
    await this.db.events.insert({
      timestamp: event.timestamp,
      type: event.type,
      context: event.contextId,
      apps: event.activeApps,
      timeOfDay: getTimeBucket(event.timestamp),
      dayOfWeek: event.timestamp.getDay()
    });
  }
  
  // Predict next context
  async predict(currentState: CurrentState): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    
    // Time-based prediction
    const timePrediction = await this.predictByTime();
    if (timePrediction) predictions.push(timePrediction);
    
    // App sequence prediction
    const sequencePrediction = await this.predictBySequence(
      currentState.recentApps
    );
    if (sequencePrediction) predictions.push(sequencePrediction);
    
    // Calendar-based prediction
    const calendarPrediction = await this.predictByCalendar();
    if (calendarPrediction) predictions.push(calendarPrediction);
    
    // Sort by confidence
    return predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Top 3
  }
  
  private async predictByTime(): Promise<Prediction | null> {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Query historical patterns
    const patterns = await this.db.events
      .where('timeOfDay').equals(getTimeBucket(new Date()))
      .where('dayOfWeek').equals(day)
      .groupBy('context')
      .count();
    
    // Find most common context for this time
    const topContext = Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topContext && topContext[1] > 3) {
      return {
        contextId: topContext[0],
        confidence: Math.min(topContext[1] / 10, 0.95),
        reason: `Usually work on this at ${getTimeLabel(hour)}`
      };
    }
    
    return null;
  }
}
```

### Suggestion Algorithm

```typescript
interface Suggestion {
  contextId: string;
  priority: number; // 0-1
  label: string;
  emoji: string;
  reason: string;
  autoExecute: boolean;
}

async function generateSuggestions(
  currentState: CurrentState,
  learnedPatterns: Pattern[]
): Promise<Suggestion[]> {
  
  const suggestions: Suggestion[] = [];
  
  // Get recent contexts
  const recentContexts = await storage.getRecent(5);
  
  // AI predictions
  const predictions = await aiEngine.predict(currentState);
  
  // Merge and score
  for (const prediction of predictions) {
    const context = await storage.get(prediction.contextId);
    
    suggestions.push({
      contextId: context.id,
      priority: prediction.confidence,
      label: context.name,
      emoji: context.emoji,
      reason: prediction.reason,
      autoExecute: prediction.confidence > 0.9 && settings.autoExecute
    });
  }
  
  // Add manual contexts if room
  if (suggestions.length < 5) {
    const manualContexts = recentContexts
      .filter(c => !suggestions.find(s => s.contextId === c.id))
      .slice(0, 5 - suggestions.length);
    
    for (const context of manualContexts) {
      suggestions.push({
        contextId: context.id,
        priority: 0.5,
        label: context.name,
        emoji: context.emoji,
        reason: 'Recently used',
        autoExecute: false
      });
    }
  }
  
  return suggestions.sort((a, b) => b.priority - a.priority);
}
```

---

## Hardware Integration

### Logitech Actions SDK Bridge

```typescript
class LogitechBridge {
  private sdk: ActionsSDK;
  private eventEmitter: EventEmitter;
  
  async initialize(): Promise<void> {
    // Initialize Actions SDK
    this.sdk = new ActionsSDK({
      appId: 'com.contextflow.desktop',
      appName: 'Context Flow'
    });
    
    // Register handlers
    this.sdk.on('dialRotate', this.handleDialRotate);
    this.sdk.on('dialPress', this.handleDialPress);
    this.sdk.on('buttonPress', this.handleButtonPress);
    
    await this.sdk.connect();
  }
  
  private handleDialRotate(event: DialEvent): void {
    // Map dial rotation to context navigation
    const direction = event.value > 0 ? 'next' : 'prev';
    this.eventEmitter.emit('navigate', direction);
    
    // Haptic feedback
    this.sdk.sendHaptic({ type: 'tick', intensity: 0.3 });
  }
  
  private handleDialPress(): void {
    // Confirm selection
    this.eventEmitter.emit('select');
    this.sdk.sendHaptic({ type: 'confirm', intensity: 0.7 });
  }
  
  private handleButtonPress(event: ButtonEvent): void {
    if (event.buttonId === 'SNAP') {
      this.eventEmitter.emit('snap');
      this.sdk.sendHaptic({ type: 'success', intensity: 0.8 });
      
      // Visual feedback on console display (if supported)
      this.sdk.setDisplay({
        text: 'Context Saved!',
        icon: 'checkmark',
        duration: 2000
      });
    }
  }
  
  // Update Actions Ring display
  async updateRingDisplay(suggestions: Suggestion[]): Promise<void> {
    await this.sdk.setRingOptions(
      suggestions.map(s => ({
        label: `${s.emoji} ${s.label}`,
        priority: s.priority,
        color: s.autoExecute ? '#00FF00' : '#FFFFFF'
      }))
    );
  }
}
```

---

## Storage Schema

```sql
-- Context snapshots
CREATE TABLE contexts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    last_restored INTEGER,
    restore_count INTEGER DEFAULT 0,
    window_state JSON NOT NULL,
    app_states JSON,
    metadata JSON
);

-- User events for AI learning
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'snap', 'restore', 'switch', etc.
    context_id TEXT,
    active_apps JSON,
    time_bucket TEXT, -- 'morning', 'afternoon', 'evening', 'night'
    day_of_week INTEGER,
    FOREIGN KEY (context_id) REFERENCES contexts(id)
);

-- User preferences
CREATE TABLE preferences (
    key TEXT PRIMARY KEY,
    value JSON NOT NULL
);

-- App adapter configurations
CREATE TABLE app_configs (
    app_name TEXT PRIMARY KEY,
    enabled BOOLEAN DEFAULT 1,
    config JSON
);
```

---

## API Surface

### Main Process API

```typescript
// contextAPI.ts
interface ContextAPI {
  // Core operations
  capture(name?: string): Promise<ContextSnapshot>;
  restore(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<ContextSummary[]>;
  
  // Search
  search(query: string): Promise<ContextSummary[]>;
  getRecent(limit: number): Promise<ContextSummary[]>;
  
  // AI
  getSuggestions(): Promise<Suggestion[]>;
  enableAutoExecute(enabled: boolean): void;
}

// settingsAPI.ts
interface SettingsAPI {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  getAll(): Promise<Settings>;
}

// hardwareAPI.ts
interface HardwareAPI {
  getDevices(): Promise<Device[]>;
  calibrate(deviceId: string): Promise<void>;
  testHaptic(deviceId: string): Promise<void>;
}
```

---

## Güvenlik ve Gizlilik

### Veri Yönetimi

```
┌─────────────────────────────────────────────────────────┐
│                    DATA LIFECYCLE                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CAPTURE                                                │
│  ├── Window titles (may contain sensitive info)        │
│  ├── File paths (may reveal project names)             │
│  └── App states (content depends on adapter)           │
│                                                         │
│  STORAGE OPTIONS                                        │
│  ├── Local Only (default)                              │
│  │   └── SQLite database, never leaves device          │
│  │                                                      │
│  ├── Encrypted Cloud (Pro feature)                     │
│  │   └── E2E encryption, user holds keys               │
│  │                                                      │
│  └── Shared Contexts (Team feature)                    │
│      └── Explicit share, anonymized where possible     │
│                                                         │
│  AI PROCESSING                                          │
│  └── All ML runs locally (TensorFlow.js)               │
│      No data sent to cloud for AI                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Performans Hedefleri

| Metric | Target | Implementation |
|--------|--------|----------------|
| Snap time | < 2s | Async capture, parallel adapters |
| Restore time | < 3s | Smart app launching, parallel restore |
| Memory usage | < 200MB | Efficient state storage |
| CPU (idle) | < 1% | Event-driven architecture |
| Storage per context | < 500KB | Compression, selective storage |

---

## Build ve Dağıtım

```yaml
# electron-builder.yml
appId: com.contextflow.desktop
productName: Context Flow
copyright: Copyright © 2026 Context Flow

files:
  - dist/**
  - node_modules/**
  - package.json

mac:
  category: public.app-category.productivity
  target:
    - dmg
    - zip

win:
  target:
    - nsis
    - portable

linux:
  target:
    - AppImage
    - deb

publish:
  provider: github
  owner: contextflow
  repo: context-flow
```

---

**"Technical excellence enables magical experiences."**
