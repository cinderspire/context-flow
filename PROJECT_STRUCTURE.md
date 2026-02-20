# 📁 Context Flow - Project Structure

```
context-flow/
├── 📄 README.md                      # Ana döküman
├── 📄 QUICKSTART.md                  # Hızlı başlangıç
├── 📄 PROJECT_STRUCTURE.md           # Bu dosya
├── 📄 LICENSE                        # MIT Lisans
├── 📄 package.json                   # Workspace config
├── 📄 .gitignore                     # Git ignore
│
├── 📁 apps/
│   └── desktop/                      # Electron uygulaması
│       ├── 📄 package.json           # App bağımlılıkları
│       ├── 📄 tsconfig.json          # TS config
│       ├── 📄 tsconfig.node.json     # Node TS config
│       ├── 📄 vite.main.config.ts    # Main process build
│       ├── 📄 vite.preload.config.ts # Preload build
│       ├── 📄 vite.renderer.config.ts # Renderer build
│       ├── 📄 electron-builder.yml   # Paketleme config
│       ├── 📄 tailwind.config.js     # Tailwind CSS
│       ├── 📄 postcss.config.js      # PostCSS
│       ├── 📄 .env                   # Environment
│       │
│       ├── 📁 src/
│       │   ├── 📁 main/
│       │   │   ├── 📄 index.ts       # Ana process
│       │   │   └── 📄 tray-icon.ts   # Tray ikonu
│       │   │
│       │   ├── 📁 preload/
│       │   │   └── 📄 index.ts       # IPC bridge
│       │   │
│       │   └── 📁 renderer/
│       │       ├── 📄 App.tsx        # Ana React bileşeni
│       │       ├── 📄 App.css        # Stiller
│       │       ├── 📄 main.tsx       # React entry
│       │       ├── 📄 index.html     # HTML template
│       │       ├── 📄 vite-env.d.ts  # Vite types
│       │       └── 📁 components/
│       │           ├── 📄 Header.tsx
│       │           ├── 📄 SnapButton.tsx
│       │           ├── 📄 Suggestions.tsx
│       │           └── 📄 ContextList.tsx
│       │
│       ├── 📁 build/                 # Build assets
│       └── 📁 resources/             # Resources
│
├── 📁 core/                          # Çekirdek motor
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 index.ts                   # Core exports
│   ├── 📄 types.ts                   # TypeScript tipleri
│   │
│   ├── 📁 engine/
│   │   ├── 📄 capture.ts             # Context capture
│   │   └── 📄 restore.ts             # Context restore
│   │
│   ├── 📁 adapters/
│   │   ├── 📄 registry.ts            # Adapter registry
│   │   ├── 📄 vscode.ts              # VSCode adapter
│   │   ├── 📄 chrome.ts              # Chrome adapter
│   │   └── 📄 terminal.ts            # Terminal adapter
│   │
│   ├── 📁 ai/
│   │   ├── 📄 naming.ts              # Context naming
│   │   └── 📄 predictor.ts           # AI prediction
│   │
│   └── 📁 storage/
│       ├── 📄 database.ts            # SQLite setup
│       ├── 📄 contexts.ts            # Context CRUD
│       └── 📄 events.ts              # Event storage
│
└── 📁 docs/                          # Yarışma dökümanları
    ├── 📄 VISION.md                  # Vizyon
    ├── 📄 ARCHITECTURE.md            # Mimari
    ├── 📄 PITCH.md                   # Video script
    └── 📄 SUBMISSION.md              # Submission

```

## Dosya Sayıları
- **TypeScript Dosyaları**: 25+
- **Konfigürasyon**: 10+
- **Toplam**: 35+ dosya

## Çalışma Akışı

1. **Main Process** (`src/main/index.ts`)
   - Electron uygulamasını başlatır
   - IPC handler'ları kurar
   - Database'i initialize eder

2. **Renderer Process** (`src/renderer/`)
   - React UI
   - User interactions
   - IPC calls to main

3. **Core Module** (`core/`)
   - Context capture/restore logic
   - App adapters
   - AI predictions
   - Database operations

## Build Akışı

```
1. Core build → dist/
2. Main build → dist/main/
3. Preload build → dist/preload/
4. Renderer build → dist/renderer/
5. Electron package → release/
```

---

**Tüm dosyalar hazır!** ✅
