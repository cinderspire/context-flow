/**
 * Context Flow - Fixed Main Process v2.0
 * Full functionality: Storage, Window Manager, AI, Shortcuts
 * SIGSEGV fixes applied
 */

const { app, BrowserWindow, ipcMain, globalShortcut, Notification, dialog, clipboard } = require('electron');
const storage = require('./storage');
const windowManager = require('./window-manager');

// CRITICAL SIGSEGV FIXES
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-compositing');

let mainWindow = null;
let settings = {};

// Initialize on startup
function initialize() {
  console.log('[Main] ===========================================');
  console.log('[Main] Context Flow v2.0 - Logitech DevStudio 2026');
  console.log('[Main] ===========================================');
  
  storage.initStorage();
  settings = storage.getSettings();
  storage.logEvent('app_started', { version: '2.0.0' });
  
  console.log('[Main] Storage initialized at:', storage.DATA_DIR);
  console.log('[Main] Settings loaded:', Object.keys(settings));
}

function generateHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Context Flow</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0f;
      color: #f1f5f9;
      overflow-x: hidden;
      user-select: none;
    }
    /* Header */
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 28px 20px;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%; right: -20%;
      width: 200px; height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      filter: blur(60px);
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 44px; height: 44px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center; justify-content: center;
      font-size: 22px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }
    .logo-text h1 { font-size: 22px; font-weight: 700; }
    .logo-text span { font-size: 12px; opacity: 0.9; }
    .status-badge {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #34d399;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-badge::before {
      content: '';
      width: 6px; height: 6px;
      background: #34d399;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    /* Hardware device strip */
    .hw-strip {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .hw-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 500;
    }
    .hw-chip .dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #34d399;
      animation: pulse 2s infinite;
    }
    /* Teleport overlay */
    .teleport-overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(99,102,241,0.95) 0%, rgba(10,10,15,0.98) 100%);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    .teleport-overlay.show {
      opacity: 1;
      pointer-events: all;
    }
    .teleport-ring {
      width: 120px; height: 120px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .teleport-text {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
    }
    .teleport-sub {
      font-size: 13px;
      color: rgba(255,255,255,0.6);
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }
    .running-apps {
      display: flex;
      gap: 8px;
      font-size: 20px;
    }
    /* Content */
    .content { padding: 20px; padding-bottom: 80px; }
    /* AI Suggestions */
    .ai-panel {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 20px;
      display: none;
    }
    .ai-panel.show { display: block; animation: slideDown 0.3s ease; }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ai-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 13px;
      color: #a5b4fc;
    }
    .ai-suggestion {
      background: rgba(99, 102, 241, 0.2);
      border-radius: 10px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ai-suggestion:hover {
      background: rgba(99, 102, 241, 0.3);
      transform: translateX(4px);
    }
    /* Snap Button */
    .snap-btn {
      width: 100%;
      padding: 22px;
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      border: none;
      border-radius: 16px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      position: relative;
      overflow: hidden;
    }
    .snap-btn::before {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }
    .snap-btn:hover::before { left: 100%; }
    .snap-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
    }
    .snap-btn.saving {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
    }
    .snap-btn .icon { font-size: 24px; }
    /* Section */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      font-weight: 600;
    }
    .context-count {
      background: #6366f1;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }
    /* Context List */
    .context-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
    .context-item {
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 14px;
      position: relative;
      overflow: hidden;
    }
    .context-item::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #6366f1, #8b5cf6);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .context-item:hover {
      transform: translateX(6px);
      border-color: rgba(99, 102, 241, 0.3);
      background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(99, 102, 241, 0.1) 100%);
    }
    .context-item:hover::before { opacity: 1; }
    .context-emoji {
      width: 48px; height: 48px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      display: flex;
      align-items: center; justify-content: center;
      font-size: 26px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .context-info { flex: 1; min-width: 0; }
    .context-name {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .context-tag {
      font-size: 10px;
      padding: 2px 8px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border-radius: 6px;
      font-weight: 600;
    }
    .context-tag.draft { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .context-meta {
      font-size: 12px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .context-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .action-btn {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 8px 14px;
      color: #34d399;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .action-btn:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.4);
    }
    .action-btn.secondary {
      background: rgba(99, 102, 241, 0.1);
      border-color: rgba(99, 102, 241, 0.2);
      color: #818cf8;
    }
    .action-btn.secondary:hover {
      background: rgba(99, 102, 241, 0.2);
    }
    .action-btn.danger {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    /* Shortcuts Panel */
    .shortcuts-panel {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 14px;
      padding: 20px;
      margin-top: 20px;
    }
    .shortcuts-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 14px;
      color: #818cf8;
    }
    .shortcuts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .shortcut-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      font-size: 12px;
    }
    .shortcut-item span:first-child { color: #94a3b8; }
    code {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 3px 8px;
      border-radius: 5px;
      font-family: 'SF Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    /* Footer */
    .footer {
      margin-top: 24px;
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.08);
      text-align: center;
      font-size: 11px;
      color: #475569;
    }
    .footer-brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .badge {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      padding: 3px 10px;
      border-radius: 6px;
      color: white;
      font-weight: 600;
    }
    /* Status Bar */
    .status-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 10px 16px;
      background: rgba(10, 10, 15, 0.95);
      border-top: 1px solid rgba(99, 102, 241, 0.2);
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(10px);
    }
    .status-left {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #34d399;
    }
    .status-left::before {
      content: '';
      width: 8px; height: 8px;
      background: #34d399;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .status-right {
      color: #64748b;
      font-size: 11px;
    }
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
    }
    .empty-state .icon { font-size: 48px; margin-bottom: 12px; }
    .empty-state h3 { font-size: 16px; margin-bottom: 6px; color: #94a3b8; }
    .empty-state p { font-size: 13px; }
    /* Toast Notification */
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(15, 23, 42, 0.98);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 14px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(150%);
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 320px;
    }
    .toast.show { transform: translateX(0); }
    .toast-icon {
      width: 36px; height: 36px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center; justify-content: center;
      font-size: 18px;
    }
    .toast-content { flex: 1; }
    .toast-title { font-weight: 600; margin-bottom: 2px; }
    .toast-message { font-size: 12px; color: #94a3b8; }
    /* Context Menu */
    .context-menu {
      position: absolute;
      background: rgba(19, 19, 31, 0.98);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 6px;
      z-index: 100;
      display: none;
      min-width: 160px;
      backdrop-filter: blur(10px);
    }
    .context-menu.show { display: block; }
    .context-menu-item {
      padding: 10px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.2s;
    }
    .context-menu-item:hover { background: rgba(255,255,255,0.05); }
    .context-menu-item.danger { color: #f87171; }
    .context-menu-item.danger:hover { background: rgba(239, 68, 68, 0.1); }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-content">
      <div class="header-top">
        <div class="logo">
          <div class="logo-icon">🌊</div>
          <div class="logo-text">
            <h1>Context Flow</h1>
            <span>v2.0.0 • Beta</span>
          </div>
        </div>
        <div class="status-badge">Active</div>
      </div>
      <div class="running-apps" id="runningApps"></div>
      <div class="hw-strip">
        <div class="hw-chip"><span class="dot"></span> MX Creative Console</div>
        <div class="hw-chip"><span class="dot"></span> Actions Ring</div>
      </div>
    </div>
  </div>

  <!-- Teleport Overlay -->
  <div class="teleport-overlay" id="teleportOverlay">
    <div class="teleport-ring"></div>
    <div class="teleport-text">Teleporting Context...</div>
    <div class="teleport-sub" id="teleportSub">Launching applications</div>
  </div>

  <div class="content">
    <!-- AI Suggestions Panel -->
    <div class="ai-panel" id="aiPanel">
      <div class="ai-header">
        <span>🤖</span>
        <span>AI Suggestion</span>
      </div>
      <div class="ai-suggestion" id="aiSuggestion" onclick="applyAISuggestion()">
        <div style="font-weight: 600; margin-bottom: 4px;" id="aiTitle"></div>
        <div style="font-size: 12px; color: #94a3b8;" id="aiMessage"></div>
      </div>
    </div>

    <!-- Snap Button -->
    <button class="snap-btn" id="snapBtn" onclick="snapContext()">
      <span class="icon">📸</span>
      <span>SNAP CURRENT CONTEXT</span>
    </button>

    <!-- Contexts List -->
    <div class="section-header">
      <div class="section-title">
        <span>📁</span>
        <span>Saved Contexts</span>
      </div>
      <span class="context-count" id="contextCount">0</span>
    </div>

    <div class="context-list" id="contextList">
      <div class="empty-state">
        <div class="icon">📂</div>
        <h3>No Contexts Yet</h3>
        <p>Click SNAP to save your first context</p>
      </div>
    </div>

    <!-- Shortcuts -->
    <div class="shortcuts-panel">
      <div class="shortcuts-title">
        <span>⌨️</span>
        <span>Keyboard Shortcuts</span>
      </div>
      <div class="shortcuts-grid">
        <div class="shortcut-item"><span>Quick Snap</span><code>Cmd+Shift+S</code></div>
        <div class="shortcut-item"><span>Quick Restore</span><code>Cmd+Shift+R</code></div>
        <div class="shortcut-item"><span>Focus Mode</span><code>Cmd+Shift+F</code></div>
        <div class="shortcut-item"><span>Export Data</span><code>Cmd+Shift+E</code></div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">
        <span>Built for</span>
        <span class="badge">Logitech DevStudio 2026</span>
      </div>
      <div>MX Creative Console + Actions Ring</div>
    </div>
  </div>

  <div class="status-bar">
    <div class="status-left">
      <span>●</span>
      <span id="statusText">Ready</span>
    </div>
    <div class="status-right" id="statusRight">context-flow@2.0.0</div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast">
    <div class="toast-icon" id="toastIcon">✓</div>
    <div class="toast-content">
      <div class="toast-title" id="toastTitle">Success</div>
      <div class="toast-message" id="toastMessage">Operation completed</div>
    </div>
  </div>

  <!-- Context Menu -->
  <div class="context-menu" id="contextMenu">
    <div class="context-menu-item" onclick="renameContext()">
      <span>✏️</span> Rename
    </div>
    <div class="context-menu-item" onclick="duplicateContext()">
      <span>📋</span> Duplicate
    </div>
    <div class="context-menu-item" onclick="exportContext()">
      <span>⬇️</span> Export
    </div>
    <div class="context-menu-item danger" onclick="deleteContext()">
      <span>🗑️</span> Delete
    </div>
  </div>

  <script>
    const { ipcRenderer } = require('electron');
    let contexts = [];
    let runningApps = [];
    let selectedContextId = null;
    let aiSuggestions = [];

    // Initialize
    async function init() {
      await loadContexts();
      await loadRunningApps();
      await loadAISuggestions();
      setupKeyboardShortcuts();
      setupContextMenu();
      updateStatus('Ready');
    }

    async function loadContexts() {
      contexts = await ipcRenderer.invoke('get-contexts');
      renderContexts();
    }

    async function loadRunningApps() {
      runningApps = await ipcRenderer.invoke('get-running-apps');
      document.getElementById('runningApps').innerHTML = runningApps
        .map(a => \`<span title="\${a.name}">\${a.icon}</span>\`).join('');
    }

    async function loadAISuggestions() {
      aiSuggestions = await ipcRenderer.invoke('get-ai-suggestions');
      if (aiSuggestions.length > 0) {
        const suggestion = aiSuggestions[0];
        document.getElementById('aiTitle').textContent = suggestion.context.name;
        document.getElementById('aiMessage').textContent = suggestion.message;
        document.getElementById('aiPanel').classList.add('show');
      }
    }

    function renderContexts() {
      const list = document.getElementById('contextList');
      document.getElementById('contextCount').textContent = contexts.length;

      if (contexts.length === 0) {
        list.innerHTML = \`
          <div class="empty-state">
            <div class="icon">📂</div>
            <h3>No Contexts Yet</h3>
            <p>Click SNAP to save your first context</p>
          </div>
        \`;
        return;
      }

      list.innerHTML = contexts.map((ctx, index) => {
        const tagClass = ctx.tag === 'Draft' ? 'draft' : '';
        const tagHtml = ctx.tag ? \`<span class="context-tag \${tagClass}">\${ctx.tag}</span>\` : '';
        return \`
          <div class="context-item" data-id="\${ctx.id}" style="animation-delay: \${index * 0.05}s">
            <div class="context-emoji">\${ctx.emoji || '💼'}</div>
            <div class="context-info">
              <div class="context-name">
                \${ctx.name}
                \${tagHtml}
              </div>
              <div class="context-meta">\${ctx.apps || ctx.windows?.map(w => w.name).join(', ')} • \${ctx.time}</div>
            </div>
            <div class="context-actions">
              <button class="action-btn" onclick="event.stopPropagation(); restoreContext('\${ctx.id}')">▶ Restore</button>
              <button class="action-btn secondary" onclick="event.stopPropagation(); exportSingleContext('\${ctx.id}')">Export</button>
            </div>
          </div>
        \`;
      }).join('');

      // Add click handlers
      document.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', () => restoreContext(item.dataset.id));
        item.addEventListener('contextmenu', (e) => showContextMenu(e, item.dataset.id));
      });
    }

    async function snapContext() {
      const btn = document.getElementById('snapBtn');
      updateStatus('Analyzing windows...');
      
      btn.classList.add('saving');
      btn.innerHTML = '<span class="icon">⏳</span><span>ANALYZING...</span>';
      
      await delay(600);
      btn.innerHTML = '<span class="icon">💾</span><span>SAVING...</span>';
      
      const result = await ipcRenderer.invoke('snap-context');
      await loadContexts();
      
      btn.innerHTML = '<span class="icon">✅</span><span>SAVED!</span>';
      showToast('✓', 'Context Saved', result.name + ' captured with ' + result.windowCount + ' windows');
      updateStatus('Context saved');
      
      await delay(1200);
      btn.classList.remove('saving');
      btn.innerHTML = '<span class="icon">📸</span><span>SNAP CURRENT CONTEXT</span>';
      
      // Refresh AI suggestions
      await loadAISuggestions();
    }

    async function restoreContext(id) {
      const ctx = contexts.find(c => c.id === id);
      if (!ctx) return;

      // Show teleport overlay
      const overlay = document.getElementById('teleportOverlay');
      const sub = document.getElementById('teleportSub');
      sub.textContent = 'Launching ' + (ctx.apps || 'applications') + '...';
      overlay.classList.add('show');
      updateStatus('Teleporting to ' + ctx.name + '...');

      await delay(300);
      sub.textContent = 'Restoring window positions...';
      await delay(400);
      sub.textContent = 'Syncing app states...';
      await delay(400);
      sub.textContent = 'Done!';
      await delay(300);

      const result = await ipcRenderer.invoke('restore-context', id);

      overlay.classList.remove('show');
      showToast('🚀', 'Teleported!', ctx.name + ' — ' + result.restored + ' apps restored');
      updateStatus('Ready • Last restored: ' + ctx.name);
    }

    function exportSingleContext(id) {
      ipcRenderer.invoke('export-contexts');
      showToast('📋', 'Copied to Clipboard', 'Context data copied as JSON');
    }

    function showContextMenu(e, contextId) {
      e.preventDefault();
      selectedContextId = contextId;
      const menu = document.getElementById('contextMenu');
      menu.style.left = e.pageX + 'px';
      menu.style.top = e.pageY + 'px';
      menu.classList.add('show');
    }

    function setupContextMenu() {
      document.addEventListener('click', () => {
        document.getElementById('contextMenu').classList.remove('show');
      });
    }

    async function deleteContext() {
      if (!selectedContextId) return;
      await ipcRenderer.invoke('delete-context', selectedContextId);
      await loadContexts();
      showToast('🗑️', 'Deleted', 'Context removed');
    }

    async function duplicateContext() {
      if (!selectedContextId) return;
      await ipcRenderer.invoke('duplicate-context', selectedContextId);
      await loadContexts();
      showToast('📋', 'Duplicated', 'Context copied');
    }

    function renameContext() {
      if (!selectedContextId) return;
      const ctx = contexts.find(c => c.id === selectedContextId);
      const newName = prompt('Rename context:', ctx?.name);
      if (newName) {
        ipcRenderer.invoke('rename-context', selectedContextId, newName);
        loadContexts();
      }
    }

    function exportContext() {
      exportSingleContext(selectedContextId);
    }

    function applyAISuggestion() {
      if (aiSuggestions.length > 0) {
        restoreContext(aiSuggestions[0].context.id);
      }
    }

    function setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (!e.metaKey) return;
        
        if (e.shiftKey) {
          switch(e.key.toLowerCase()) {
            case 's':
              e.preventDefault();
              snapContext();
              break;
            case 'r':
              e.preventDefault();
              if (contexts.length > 0) restoreContext(contexts[0].id);
              break;
            case 'e':
              e.preventDefault();
              exportSingleContext(contexts[0]?.id);
              break;
          }
        }
      });
    }

    function showToast(icon, title, message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastIcon').textContent = icon;
      document.getElementById('toastTitle').textContent = title;
      document.getElementById('toastMessage').textContent = message;
      
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function updateStatus(text) {
      document.getElementById('statusText').textContent = text;
    }

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Start
    init();
  </script>
</body>
</html>`;
}

// IPC Handlers
ipcMain.handle('get-contexts', () => {
  return storage.getAllContexts();
});

ipcMain.handle('snap-context', async () => {
  const context = await windowManager.captureContext();
  return context;
});

ipcMain.handle('restore-context', async (_, id) => {
  return await windowManager.restoreContext(id);
});

ipcMain.handle('delete-context', (_, id) => {
  storage.deleteContext(id);
  storage.logEvent('context_deleted', { contextId: id });
  return true;
});

ipcMain.handle('duplicate-context', (_, id) => {
  const contexts = storage.getAllContexts();
  const ctx = contexts.find(c => c.id === id);
  if (ctx) {
    const newCtx = { ...ctx, id: Date.now().toString(), name: ctx.name + ' (Copy)', createdAt: Date.now() };
    storage.saveContext(newCtx);
    storage.logEvent('context_duplicated', { originalId: id });
  }
  return true;
});

ipcMain.handle('rename-context', (_, id, newName) => {
  storage.updateContext(id, { name: newName });
  storage.logEvent('context_renamed', { contextId: id });
  return true;
});

ipcMain.handle('get-running-apps', () => {
  return windowManager.getRunningApps();
});

ipcMain.handle('get-ai-suggestions', () => {
  return storage.getAISuggestions();
});

ipcMain.handle('export-contexts', () => {
  const data = windowManager.exportContexts();
  clipboard.writeText(data);
  
  new Notification({
    title: 'Context Flow',
    body: 'Contexts exported to clipboard',
    silent: true
  }).show();
  
  return true;
});

// Create window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 850,
    minWidth: 420,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(generateHTML()));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// App lifecycle
app.whenReady().then(() => {
  initialize();
  createWindow();
  
  // Register shortcuts
  setTimeout(() => {
    globalShortcut.register('CommandOrControl+Shift+S', () => {
      console.log('[Shortcut] Quick Snap');
      mainWindow?.webContents.executeJavaScript('snapContext()');
    });
    
    globalShortcut.register('CommandOrControl+Shift+R', () => {
      console.log('[Shortcut] Quick Restore');
      mainWindow?.webContents.executeJavaScript(`
        if (contexts.length > 0) restoreContext(contexts[0].id)
      `);
    });
    
    globalShortcut.register('CommandOrControl+Shift+E', () => {
      console.log('[Shortcut] Export');
      mainWindow?.webContents.executeJavaScript(`
        if (contexts.length > 0) exportSingleContext(contexts[0].id)
      `);
    });
    
    console.log('[Main] Shortcuts: Cmd+Shift+S, R, E');
  }, 1500);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  storage.logEvent('app_closed', {});
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('[Main] Uncaught Exception:', err);
  storage.logEvent('error', { type: 'uncaughtException', message: err.message });
});
