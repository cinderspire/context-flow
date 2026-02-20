/**
 * Context Flow - Simple Working Version
 */

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
const path = require('path')

const DEMO_CONTEXTS = [
  { id: '1', name: '💻 Web Development', apps: 'VSCode, Terminal, Chrome', time: '2m ago' },
  { id: '2', name: '🎨 UI Design', apps: 'Figma, Chrome', time: '1h ago' },
  { id: '3', name: '📹 Meeting Prep', apps: 'Zoom, Notion', time: '3h ago' }
]

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 750,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 25px 20px;
      text-align: center;
    }
    .header h1 { font-size: 26px; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 20px; }
    .snap-btn {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 25px;
      transition: transform 0.2s;
    }
    .snap-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16,185,129,0.3); }
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
    }
    .context-item:hover { 
      background: rgba(255,255,255,0.1); 
      border-color: rgba(99,102,241,0.5);
      transform: translateX(4px);
    }
    .context-name { font-size: 16px; font-weight: 500; margin-bottom: 5px; }
    .context-meta { font-size: 12px; color: #94a3b8; }
    .shortcuts {
      margin-top: 25px;
      padding: 16px;
      background: rgba(99,102,241,0.1);
      border-radius: 12px;
      border: 1px solid rgba(99,102,241,0.2);
    }
    .shortcuts h3 { margin-bottom: 12px; font-size: 14px; color: #6366f1; }
    .shortcut-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    code {
      background: rgba(255,255,255,0.1);
      padding: 3px 8px;
      border-radius: 4px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌊 Context Flow</h1>
    <p>Switch Worlds. Keep Your Mind.</p>
  </div>
  
  <div class="content">
    <button class="snap-btn" onclick="snap()">
      📸 SNAP Current Context
    </button>
    
    <div class="section-title">📁 Demo Contexts (3)</div>
    
    <div id="list"></div>
    
    <div class="shortcuts">
      <h3>⌨️ Keyboard Shortcuts</h3>
      <div class="shortcut-row"><span>Quick Snap</span> <code>Cmd+Shift+S</code></div>
      <div class="shortcut-row"><span>Quick Restore</span> <code>Cmd+Shift+R</code></div>
      <div class="shortcut-row"><span>Toggle App</span> <code>Cmd+Shift+C</code></div>
      <div class="shortcut-row"><span>Focus Mode</span> <code>Cmd+Shift+F</code></div>
    </div>
  </div>

  <script>
    const contexts = ${JSON.stringify(DEMO_CONTEXTS)};
    
    function render() {
      document.getElementById('list').innerHTML = contexts.map(c => 
        '<div class="context-item" onclick="restore(\\''+c.id+'\\')">' +
        '<div class="context-name">'+c.name+'</div>' +
        '<div class="context-meta">'+c.apps+' • '+c.time+'</div>' +
        '</div>'
      ).join('');
    }
    
    function snap() {
      const name = '💼 Context ' + new Date().toLocaleTimeString();
      contexts.unshift({
        id: Date.now().toString(),
        name: name,
        apps: 'VSCode, Terminal, Chrome',
        time: 'Just now'
      });
      render();
      // Visual feedback
      const btn = document.querySelector('.snap-btn');
      btn.textContent = '✅ Saved!';
      setTimeout(() => btn.textContent = '📸 SNAP Current Context', 1500);
    }
    
    function restore(id) {
      const ctx = contexts.find(c => c.id === id);
      alert('🚀 Restoring: ' + ctx.name + '\\n\\nApps launching:\\n• VSCode\\n• Terminal\\n• Chrome');
    }
    
    render();
  </script>
</body>
</html>`

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))

  // Shortcuts
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    mainWindow.webContents.executeJavaScript('snap()')
  })
  
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow.webContents.executeJavaScript('restore("1")')
  })
  
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()
  console.log('✅ Context Flow is running!')
})

app.on('window-all-closed', () => { app.quit() })
app.on('will-quit', () => { globalShortcut.unregisterAll() })
