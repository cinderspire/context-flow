# 📝 DevStudio 2026 Submission - Context Flow

---

## 📋 Submission Form Answers

### Project Name
**Context Flow**

### Tagline / Elevator Pitch
> "Switch Worlds. Keep Your Mind. One button to save and instantly restore your entire workspace - apps, files, tools, and state. It's not a macro, it's workflow teleportation."

---

## 🎯 Description

### The Problem
Every knowledge worker faces the same invisible enemy: **context switching**. 

- We switch apps **1,200 times per day**
- Each switch costs **23 seconds** of recovery time
- That's **5 weeks per year** lost just getting back to where we were

When you jump from Blender to Slack to check a message, you lose:
- Your viewport position
- Your brush settings
- Your mental model of the 3D space
- Your creative flow state

### The Solution
**Context Flow** transforms your Logitech MX Creative Console and MX Master Actions Ring into a workflow teleportation device:

1. **Press SNAP** on your Console → Your entire workspace is captured in 1 second
2. **Twist the Actions Ring** → Browse your saved contexts with haptic feedback
3. **Click** → Instantly teleport back. Every app, every file, every setting. Perfectly restored.

### Key Innovation
Unlike traditional macro tools, Context Flow captures **semantic state**:
- Not just window positions, but which file is open in VSCode
- Not just "Blender is running," but which scene, which mode, which viewport
- Not just browser tabs, but scroll positions and form inputs

Our AI engine learns your patterns and suggests the right context before you even think about it.

---

## 🛠️ How We Built It

### Architecture
**Desktop App:** Electron + React + TypeScript
- Main process handles system-level window management
- Renderer provides beautiful, native-feeling UI
- SQLite for local state storage (privacy-first)

**Context Engine:**
- `node-window-manager` for cross-platform window control
- Custom App Adapters for deep state capture:
  - VSCode: Workspace, open files, cursor position via Extension API
  - Chrome: Tabs, scroll positions via Extension
  - Terminal: Current working directory via shell integration
  - Figma: Open file via deep links
  - Generic fallback: Window bounds for any app

**AI Prediction Engine:**
- Local TensorFlow.js for pattern learning
- Time-based, app-sequence, and calendar-based predictions
- Zero cloud dependency for AI processing

**Hardware Integration:**
- Logitech Actions SDK for MX Creative Console
- Custom ring interface mapping
- Haptic feedback for context navigation

### Tech Stack
| Component | Technology |
|-----------|-----------|
| Desktop Framework | Electron 28 |
| Frontend | React 18, TypeScript, Tailwind CSS |
| State Management | Zustand |
| Database | SQLite (better-sqlite3) |
| AI/ML | TensorFlow.js |
| Window Management | node-window-manager |
| Build | Vite, electron-builder |

---

## ⚡ Challenges We Ran Into

### 1. App-Specific State Capture
**Challenge:** Each application stores its internal state differently. VSCode has rich APIs, but Photoshop requires CEP scripting, and some apps have no API at all.

**Solution:** We built an adapter architecture with three tiers:
- **Deep Adapters:** Full state capture/restore (VSCode, Chrome)
- **Medium Adapters:** Partial state (Figma, Terminal)
- **Generic Adapter:** Window position only (fallback for any app)

### 2. Window Restoration Timing
**Challenge:** Restoring a context requires launching apps, waiting for them to load, then restoring state. Apps load at different speeds.

**Solution:** Smart orchestration with retry logic and state polling. We also show a progress UI so users know restoration is in progress.

### 3. Cross-Platform Differences
**Challenge:** Window management APIs differ significantly between macOS and Windows.

**Solution:** Abstracted platform layer with OS-specific implementations. macOS uses Accessibility APIs, Windows uses Win32 APIs.

### 4. Actions SDK Integration
**Challenge:** First-time integration with Logitech's Actions SDK required understanding the event model.

**Solution:** Built a bridge layer that translates SDK events to our internal event system, enabling rapid iteration.

---

## 🏆 Accomplishments We're Proud Of

### 1. Sub-Second Snap Speed
Despite capturing complex multi-app states, our snap operation completes in under 1 second. Users don't feel interrupted.

### 2. True "Teleportation" Experience
The restore experience feels magical. One click, and your entire digital environment reconfigures itself instantly.

### 3. Privacy-First AI
All machine learning runs locally. No user data leaves their device, addressing enterprise privacy concerns.

### 4. Hardware-Software Harmony
The integration between MX Creative Console (capture) and MX Master Actions Ring (navigation) creates an intuitive, physical-digital workflow.

### 5. Real Working Demo
This isn't a concept video. We built working software that you can install and use today.

---

## 📚 What We Learned

### Technical Insights
- **Window management is harder than it looks.** Each OS has quirks, and each app behaves differently.
- **State serialization is fragile.** Apps update frequently, breaking our adapters. We need versioning.
- **Electron is viable for system tools.** With proper native modules, it can do things we previously thought required native apps.

### User Experience Insights
- **Users want control, not automation.** Auto-execute features sound good, but users prefer suggestions with confirmation.
- **Context naming matters.** AI-generated names based on content are more useful than timestamps.
- **Visual feedback is crucial.** Users need to see that a snap was successful, or they'll snap multiple times.

### Business Insights
- **This is a workflow tool, not a window manager.** Positioning matters - we're selling time savings, not features.
- **Hardware bundling opportunity.** Logitech could bundle 3 months of Context Flow Pro with new devices.
- **Enterprise potential is huge.** Standardized dev environments are a pain point for every engineering team.

---

## 🚀 What's Next for Context Flow

### Near Term (3 months)
- [ ] **More App Adapters:** Photoshop, Illustrator, Blender, Unity
- [ ] **Cloud Sync:** Encrypted cross-device synchronization
- [ ] **Analytics Dashboard:** Personal productivity insights

### Medium Term (6-12 months)
- [ ] **Team Features:** Shared contexts, team templates
- [ ] **Plugin SDK:** Third-party adapter marketplace
- [ ] **Mobile Companion:** iOS/Android app for context notifications

### Long Term (1-2 years)
- [ ] **VR Bridge:** Seamless 2D↔3D context switching for Meta Quest
- [ ] **Enterprise Suite:** SSO, audit logs, on-premise deployment
- [ ] **AI Co-pilot:** Proactive workspace optimization suggestions

---

## 🔗 Links

### Video Demo
**YouTube:** *(link will be added after recording — deadline Feb 25)*

### Try It Out
**GitHub:** [github.com/cinderspire/context-flow](https://github.com/cinderspire/context-flow)

### Supporting Materials
- **Architecture Deep Dive:** [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **Vision Roadmap:** [docs/VISION.md](VISION.md)
- **Pitch Script:** [docs/PITCH.md](PITCH.md)

---

## 🎨 Assets

### Screenshots
1. **Main UI:** Context browser with timeline view
2. **Snap Animation:** Visual feedback on capture
3. **Ring Interface:** Actions Ring context selection
4. **Settings:** App adapter configuration
5. **Analytics:** Personal productivity dashboard

### Logos
- **Primary Logo:** `assets/logo-primary.svg`
- **Icon:** `assets/icon-512x512.png`
- **Social Banner:** `assets/social-banner.jpg`

---

## 👥 Team

| Name | Role | Contribution |
|------|------|--------------|
| cinderspire | Founder & Full-Stack Developer | Core architecture, UI, AI engine, hardware integration |

---

## 🙏 Acknowledgments

- **Logitech** for the amazing MX ecosystem and Actions SDK
- **DevStudio 2026** for the opportunity to build
- **Electron community** for the excellent framework
- **Our beta testers** for invaluable feedback

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 📞 Contact

**GitHub:** [@cinderspire](https://github.com/cinderspire)

---

**"Stop switching apps. Start switching contexts."**
