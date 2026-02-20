/**
 * Context Flow - Simple Main Process
 * Minimal working version without native deps
 */

import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import path from 'path'

// Demo data
const DEMO_CONTEXTS = [
  { id: '1', name: '💻 Web Development', apps: 'VSCode, Terminal, Chrome', time: '2m ago' },
  { id: '2', name: '🎨 UI Design', apps: 'Figma, Chrome', time: '1h ago' },
  { id: '3', name: '📹 Meeting Prep', apps: 'Zoom, Notion', time: '3h ago' }
]

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/simple-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

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
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 20px;
      text-align: center;
    }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 20px; }
    .snap-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .snap-btn:hover { transform: translateY(-2px); }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .context-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 10px;
      cursor: pointer;
    }
    .context-item:hover { background: rgba(255,255,255,0.1); }
    .context-name { font-size: 16px; font-weight: 500; margin-bottom: 5px; }
    .context-meta { font-size: 12px; color: #94a3b8; }
    .shortcuts {
      margin-top: 20px;
      padding: 15px;
      background: rgba(99,102,241,0.1);
      border-radius: 10px;
    }
    .shortcuts h3 { margin-bottom: 10px; font-size: 14px; }
    .shortcuts code {
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌊 Context Flow</h1>
    <p>Switch Worlds. Keep Your Mind.</p>
  </div>
  
  <div class="content">
    <button class="snap-btn" onclick="window.snapContext()">
      📸 SNAP Current Context
    </button>
    
    <div class="section-title">📁 Saved Contexts (3)</div>
    
    <div id="context-list"></div>
    
    <div class="shortcuts">
      <h3>⌨️ Keyboard Shortcuts</h3>
      <p><code>Cmd+Shift+S</code> Quick Snap</p>
      <p><code>Cmd+Shift+R</code> Quick Restore</p>
      <p><code>Cmd+Shift+C</code> Toggle App</p>
      <p><code>Cmd+Shift+F</code> Focus Mode</p>
    </div>
  </div>

  <script>
    const contexts = ${JSON.stringify(DEMO_CONTEXTS)};
    
    function renderContexts() {
      const list = document.getElementById('context-list');
      list.innerHTML = contexts.map(ctx => \`
        <div class="context-item" onclick="window.restoreContext('\${ctx.id}')">
          <div class="context-name">\${ctx.name}</div>
          <div class="context-meta">\${ctx.apps} • \${ctx.time}</div>
        </div>
      \`).join('');
    }
    
    window.snapContext = async () => {
      const result = await window.api.snap();
      alert('Context saved: ' + result.name);
      renderContexts();
    };
    
    window.restoreContext = async (id) => {
      await window.api.restore(id);
      alert('Context restored! Apps: VSCode, Terminal, Chrome');
    };
    
    renderContexts();
  </script>
</body>
</html>
  `

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent))
  
  // Register shortcuts
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow?.webContents.executeJavaScript('window.snapContext()')
  })
  
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    alert('Quick Restore: Web Development')
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// IPC handlers
ipcMain.handle('snap-context', () => {
  return { 
    id: Date.now().toString(),
    name: '💼 Context ' + new Date().toLocaleTimeString(),
    apps: 'VSCode, Terminal, Chrome',
    time: 'Just now'
  }
})

ipcMain.handle('restore-context', (_, id) => {
  console.log('Restoring context:', id)
  return { success: true }
})

app.whenReady().then(() => {
  createWindow()
  console.log('✅ Context Flow is running!')
  console.log('🎯 Press Cmd+Shift+S for Quick Snap')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
