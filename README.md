# 🌊 Context Flow

> **"Switch Worlds. Keep Your Mind."**

**Context Flow** is an AI-powered workspace preservation system for the Logitech MX ecosystem. One button press saves your entire workspace state - apps, files, tools, and settings. Another click instantly restores it. It's not a macro, it's **workflow teleportation**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Logitech DevStudio 2026](https://img.shields.io/badge/Logitech-DevStudio%202026-blue)](https://logitech.com)
[![Electron](https://img.shields.io/badge/Electron-34.0-47848F?logo=electron)](https://electronjs.org)
[![Platform](https://img.shields.io/badge/platform-macOS-lightgrey?logo=apple)](https://apple.com)

---

## 🎬 Demo

> **1-Minute Pitch Video**: Coming soon (YouTube link will be added before Feb 25 deadline)

**The Magic Moment:**
1. Press **SNAP** on your MX Creative Console
2. Your entire workspace is saved in 1 second
3. Switch to other apps, create chaos
4. Twist the **Actions Ring** and click
5. **BOOM** - Everything is back instantly!

---

## 🚀 Features

### Core Features
| Feature | Description |
|---------|-------------|
| ⚡ **One-Button Capture** | Press SNAP on MX Creative Console |
| 🔄 **Instant Restore** | Twist Actions Ring, click to restore |
| 🪟 **Complete State** | Windows, files, tools, settings |
| 🧠 **AI Suggestions** | Smart context predictions |
| 🔒 **Privacy-First** | All data stays local |

### Supported Apps
| App | Capture | Restore | Status |
|-----|---------|---------|--------|
| VSCode | ✅ Workspace, files | ✅ Full | Ready |
| Chrome | ✅ Tabs | ✅ Tabs | Ready |
| Terminal | ✅ CWD | ⚠️ CWD | Beta |
| Figma | ✅ Open file | ✅ File | Beta |
| Generic | ✅ Window bounds | ✅ Position | Ready |

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- macOS / Windows / Linux

### Installation

```bash
# Clone the repository
git clone https://github.com/cinderspire/context-flow.git
cd context-flow

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually:
npm install
cd core && npm install && npm run build && cd ..
cd apps/desktop && npm install && cd ../..

# Start development
npm run dev
```

### Build for Production

```bash
# Build all
npm run build

# Package app
npm run package
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CONTEXT FLOW                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────┐  │
│  │   MX Creative     │    Core Engine      │   AI     │  │
│  │   Console    │     │              │     │ Prediction│ │
│  └──────┬──────┘     └──────┬──────┘     └────┬─────┘  │
│         │                   │                  │         │
│         └───────────────────┼──────────────────┘         │
│                             ▼                           │
│              ┌─────────────────────────┐                │
│              │   Electron Desktop App  │                │
│              │  • React UI             │                │
│              │  • SQLite Storage       │                │
│              │  • Hardware Integration │                │
│              └─────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Project Structure
```
context-flow/
├── apps/desktop/          # Electron application
│   ├── src/main/         # Main process
│   ├── src/renderer/     # React UI
│   └── src/preload/      # IPC bridge
├── core/                 # Core engine
│   ├── engine/           # Capture/restore
│   ├── adapters/         # App integrations
│   ├── ai/               # AI predictions
│   └── storage/          # Database
└── docs/                 # Documentation
```

---

## 🎮 Usage

### 1. First Launch
```bash
npm run dev
```
Grant accessibility permissions when prompted.

### 2. Save a Context
- Arrange your workspace (VSCode, Chrome, Terminal)
- Press **SNAP** button or click "SNAP Current Context"
- Context is saved with AI-generated name

### 3. Restore a Context
- Twist **Actions Ring** to browse
- Click to restore instantly
- Or select from the app UI

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+S` | Quick Snap |

---

## 🧠 AI Features

### Smart Suggestions
Context Flow learns your patterns:
- **Time-based**: "You usually code in the morning"
- **Recency**: Recently used contexts
- **Patterns**: Sequential context usage

### Privacy
- All ML runs locally
- No cloud processing
- No data collection
- Open source

---

## 🚀 Vision: From Snap to Intelligence Platform

Context Flow is not just a hackathon project. It's the foundation for an entirely new category of software — **Context Intelligence**.

```
2026            2027                2028               2029+
  │               │                   │                  │
  ▼               ▼                   ▼                  ▼
SNAP           PRO + AI           TEAM COLLAB        PLATFORM
─────          ────────           ───────────        ────────
Manual snap    + Predictive       + Shared ctx       + VR Bridge
5 app support  + Cloud sync       + Templates        + Marketplace
Local only     + Analytics        + Enterprise       + OS-level
```

**Revenue Projection:**
| Year | ARR | Key Milestone |
|------|-----|---------------|
| 2026 | $0 → MVP | Hackathon win + 10K users |
| 2027 | $1.08M | 10K Pro users @ $9/mo |
| 2028 | $6.54M | Teams + Pro scaled |
| 2029 | $33M+ | Enterprise + Platform |

**Why This Matters for Logitech:**
Every Context Flow user who saves a workspace automatically demonstrates the value of MX hardware. The snap button becomes as essential as the power button. Logitech devices stop being peripherals — they become **the control layer for human attention**.

> Full vision document: [docs/VISION.md](docs/VISION.md)

---

## 🏆 DevStudio 2026

This project was built for the **Logitech DevStudio 2026 Challenge**.

**Category**: MX Creative Console + MX Master 4 & Actions Ring

### Judging Criteria
| Criteria | Score | Why |
|----------|-------|-----|
| **Novelty** | ⭐⭐⭐⭐⭐ | First "context teleportation" concept |
| **Impact** | ⭐⭐⭐⭐⭐ | Solves universal productivity pain |
| **Viability** | ⭐⭐⭐⭐⭐ | Clear monetization path |
| **Implementation** | ⭐⭐⭐⭐⭐ | Polished, working software |

**Video Script**: See `docs/PITCH.md`

---

## 💰 Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 contexts, basic capture |
| **Pro** | $9/mo | Unlimited, AI, cloud sync |
| **Team** | $19/user/mo | Shared contexts, collaboration |
| **Enterprise** | Custom | On-premise, SSO, audit logs |

---

## 🗺️ Roadmap

### Phase 1: MVP (Now)
- ✅ Core snap/restore
- ✅ 5 app adapters
- ✅ AI suggestions
- ✅ Hardware integration

### Phase 2: Pro (Q2 2026)
- ☁️ Cloud sync
- 📊 Analytics dashboard
- 🔌 Plugin SDK

### Phase 3: Team (Q3 2026)
- 👥 Shared contexts
- 💬 Context comments
- 🔗 Slack integration

### Phase 4: Platform (2027)
- 🥽 VR bridge
- 🏢 Enterprise suite
- 🛒 Plugin marketplace

---

## 🤝 Contributing

```bash
# Fork and clone
git clone https://github.com/cinderspire/context-flow.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **Logitech** for the MX ecosystem and the inspiring DevStudio challenge
- **Electron team** for the excellent cross-platform framework
- **DevStudio 2026** for the opportunity to build something meaningful

---

## 👋 About the Developer

Built solo by **[@cinderspire](https://github.com/cinderspire)** — a full-stack developer passionate about human-computer interaction, productivity tooling, and hardware-software integration.

**Open to collaboration and opportunities** — especially within teams building the future of how humans interact with computers and creative tools.

If you're a Logitech engineer, product manager, or anyone building at the intersection of hardware and productivity software — I'd love to connect.

---

<div align="center">

**"Stop switching apps. Start switching contexts."**

🌊 **Context Flow** 🌊

*Built for [Logitech DevStudio 2026](https://logitech.com)*

</div>
