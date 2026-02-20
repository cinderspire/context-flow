/**
 * Context Flow - Simple Main Process (JS)
 * Minimal working version without native deps
 */

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// Demo data
const DEMO_CONTEXTS = [
  { id: '1', name: '💻 Web Development', apps: 'VSCode, Terminal, Chrome', time: '2m ago' },
  { id: '2', name: '🎨 UI Design', apps: 'Figma, Chrome', time: '1h ago' },
  { id: '3', name: '📹 Meeting Prep', apps: 'Zoom, Notion', time: '3h ago' }
];

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  // Simple HTML content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 0;
      overflow-x: hidden;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 { font-size: 28px; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 25px; }
    .snap-btn {
      width: 100%;
      padding: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 14px;
      color: white;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 25px;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .snap-btn:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    .snap-btn.saving {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }
    .context-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .context-item:hover { 
      background: rgba(255,255,255,0.1); 
      border-color: rgba(99, 102, 241, 0.5);
      transform: translateX(4px);
    }
    .context-emoji { font-size: 28px; }
    .context-info { flex: 1; }
    .context-name { font-size: 16px; font-weight: 500; margin-bottom: 4px; }
    .context-meta { font-size: 12px; color: #94a3b8; }
    .context-actions { display: flex; gap: 8px; }
    .action-btn {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 6px;
      padding: 6px 12px;
      color: #34d399;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }
    .shortcuts {
      margin-top: 25px;
      padding: 16px;
      background: rgba(99,102,241,0.1);
      border-radius: 12px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .shortcuts h3 { margin-bottom: 12px; font-size: 14px; color: #6366f1; }
    .shortcut-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    code {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .notification {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 10px;
      padding: 14px 28px;
      font-size: 14px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: all 0.3s;
      z-index: 1000;
    }
    .notification.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌊 Context Flow</h1>
    <p>Switch Worlds. Keep Your Mind.</p>
  </div>
  
  <div class="content">
    <button class="snap-btn" id="snapBtn">
      📸 SNAP Current Context
    </button>
    
    <div class="section-title">📁 Saved Contexts (<span id="count">3</span>)</div>
    
    <div id="context-list"></div>
    
    <div class="shortcuts">
      <h3>⌨️ Keyboard Shortcuts</h3>
      <div class="shortcut-row"><span>Quick Snap</span><code>Cmd+Shift+S</code></div>
      <div class="shortcut-row"><span>Quick Restore</span><code>Cmd+Shift+R</code></div>
      <div class="shortcut-row"><span>Toggle App</span><code>Cmd+Shift+C</code></div>
      <div class="shortcut-row"><span>Focus Mode</span><code>Cmd+Shift+F</code></div>
    </div>
  </div>

  <div class="notification" id="notification"></div>

  <script>
    const { ipcRenderer } = require('electron');
    let contexts = ${JSON.stringify(DEMO_CONTEXTS)};
    
    function showNotification(msg) {
      const n = document.getElementById('notification');
      n.textContent = msg;
      n.classList.add('show');
      setTimeout(() => n.classList.remove('show'), 2000);
    }
    
    function renderContexts() {
      const list = document.getElementById('context-list');
      document.getElementById('count').textContent = contexts.length;
      list.innerHTML = contexts.map(ctx => \`
        <div class="context-item" onclick="restoreContext('\${ctx.id}')">
          <span class="context-emoji">\${ctx.name.split(' ')[0]}</span>
          <div class="context-info">
            <div class="context-name">\${ctx.name.substring(2)}</div>
            <div class="context-meta">\${ctx.apps} • \${ctx.time}</div>
          </div>
          <div class="context-actions">
            <button class="action-btn">▶ Restore</button>
          </div>
        </div>
      \`).join('');
    }
    
    async function snapContext() {
      const btn = document.getElementById('snapBtn');
      btn.classList.add('saving');
      btn.textContent = '⏳ Saving...';
      
      const result = await ipcRenderer.invoke('snap-context');
      contexts.unshift(result);
      renderContexts();
      
      btn.textContent = '✅ Saved!';
      showNotification('Context saved: ' + result.name);
      
      setTimeout(() => {
        btn.classList.remove('saving');
        btn.textContent = '📸 SNAP Current Context';
      }, 1500);
    }
    
    async function restoreContext(id) {
      const ctx = contexts.find(c => c.id === id);
      showNotification('🚀 Restoring: ' + (ctx?.name || 'Context'));
      await ipcRenderer.invoke('restore-context', id);
      setTimeout(() => showNotification('✅ Apps launched!'), 500);
    }
    
    document.getElementById('snapBtn').addEventListener('click', snapContext);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        snapContext();
      }
    });
    
    renderContexts();
  </script>
</body>
</html>
  `;

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
  
  // Register shortcuts
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow?.webContents.executeJavaScript('document.getElementById("snapBtn").click()');
  });
  
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow?.webContents.executeJavaScript('showNotification("🚀 Quick Restore: Web Development")');
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// IPC handlers
ipcMain.handle('snap-context', () => {
  return { 
    id: Date.now().toString(),
    name: '💼 Context ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    apps: 'VSCode, Terminal, Chrome',
    time: 'Just now'
  };
});

ipcMain.handle('restore-context', (_, id) => {
  console.log('Restoring context:', id);
  return { success: true };
});

app.whenReady().then(() => {
  createWindow();
  console.log('✅ Context Flow is running!');
  console.log('🎯 Press Cmd+Shift+S for Quick Snap');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
