# Devpost Submission — Ready to Copy-Paste

> Deadline: Feb 25 2026 @ 19:00 GMT+3
> Category: MX Creative Console + MX Master 4 & Actions Ring

---

## PROJECT NAME
**Context Flow**

---

## TAGLINE (shown below project name — keep under 100 chars)
```
One button saves your entire workspace. One click restores it. Workflow teleportation.
```

---

## SHORT DESCRIPTION (500 chars max — copy this exactly)
```
Context Flow transforms your MX Creative Console into a workflow teleportation device. Press SNAP — your entire workspace (apps, files, window positions, tool states) is captured in 1 second. Twist the Actions Ring to browse saved contexts. Click to restore everything instantly. Powered by a local AI engine that learns your patterns and suggests the right context before you even think about it.
```
Character count: ~390 ✓

---

## VIDEO LINK
> Add your YouTube/Vimeo link here after recording

**Format:** `https://youtube.com/watch?v=YOUR_ID`

**What to show in 60 seconds:**
- 0:00 — Problem stat: "1,200 app switches/day, 23s each = 5 weeks/year lost"
- 0:08 — Press SNAP on Console → "Context Saved" animation
- 0:18 — Mess up the desktop (open random apps)
- 0:28 — Twist Actions Ring → browse contexts
- 0:34 — Click → BOOM, everything is back (teleport overlay)
- 0:45 — AI suggestion panel appears ("Morning Dev Session?")
- 0:52 — Show GitHub link
- 0:58 — "Context Flow. Stay in flow."

---

## GITHUB REPO
```
https://github.com/cinderspire/context-flow
```

---

## FULL DESCRIPTION
*(paste into the "About the project" field)*

### The Problem

Every knowledge worker faces the same invisible enemy: **context switching**.

- We switch apps **1,200 times per day**
- Each switch costs **23 seconds** of context recovery
- That's **5 weeks per year** lost to just getting back to where you were

When you're deep in a Blender sculpt and Slack pings you, you lose your viewport position, your brush settings, your mental model of the 3D space, and your creative flow state — all at once.

### The Solution

**Context Flow** turns your Logitech MX Creative Console and MX Master Actions Ring into a workflow teleportation device:

1. **Press SNAP** on your MX Creative Console → Your entire workspace is captured in 1 second
2. **Twist the Actions Ring** → Browse your saved contexts (3D Sculpt, Code Review, Client Call…)
3. **Click** → Instantly teleport back. Every app, every file, every setting. Perfectly restored.

### What Makes It Unique

Unlike macro tools that just open apps, Context Flow captures **semantic state**:
- Not just "VSCode is open" — but which workspace, which files, which Git branch
- Not just "Blender is running" — but which scene, which mode, which viewport
- Not just window positions — but the full mental context of what you were doing

Our local AI engine learns your patterns and proactively suggests the right context:
- "It's 9am Monday — want your Morning Dev Session?"
- "You have a Zoom call in 10 minutes — restore Meeting Prep?"

### How We Built It

**Desktop App:** Electron 34 (macOS)
- Main process handles window management via OS accessibility APIs
- Beautiful dark UI with animated snap/restore flow
- Local JSON storage — no database server required

**Context Engine:**
- App-specific adapters for deep state capture (VSCode, Chrome, Terminal, Figma)
- Generic window bounds adapter for any other app
- Staggered app launch orchestration for reliable restoration

**AI Prediction Engine:**
- Time-based pattern matching (morning = coding, afternoon = meetings)
- Context sequence analysis
- All processing runs locally — zero cloud dependency

**Hardware Integration:**
- Logitech Actions SDK bridge for MX Creative Console
- Custom ring interface mapping with context browsing
- Physical SNAP → digital snap metaphor

### Challenges We Overcame

1. **macOS SIGSEGV crashes** — Electron GPU conflicts on Apple Silicon. Solved by disabling hardware acceleration for the main process.
2. **App state heterogeneity** — Each app stores state differently. Built a 3-tier adapter architecture: deep/medium/generic.
3. **Reliable restore timing** — Apps load at different speeds. Built staggered orchestration with progress feedback.

### What's Next

- **Phase 2 (2027):** Cloud sync, predictive AI, productivity analytics
- **Phase 3 (2028):** Team shared contexts, enterprise templates
- **Phase 4 (2029):** VR bridge for Meta Quest, Logitech plugin marketplace

### Why This Wins

The MX Creative Console becomes essential — not as a macro pad, but as the physical control layer for human attention. Every user who installs Context Flow has a new reason to reach for their Logitech hardware 50+ times per day.

---

## BUILT WITH (tags to add on Devpost)
```
electron, javascript, node-js, macos, logitech-actions-sdk, ai, machine-learning, productivity
```

---

## TEAM
- **Solo project** by @cinderspire
- Full-stack developer specializing in human-computer interaction and productivity tooling

---

## ANSWERS TO COMMON FORM QUESTIONS

**What inspired you?**
> I lose hours every week switching contexts. I counted my app switches one day — 1,200+. It's a universal pain that no tool has solved well. The MX Creative Console felt like the perfect physical metaphor: one dedicated button to freeze and thaw your digital state.

**What did you learn?**
> Window management is harder than it looks. Each OS has quirks, and each app behaves differently. But the core insight was that users don't just want automation — they want to feel in control of their own attention. That shaped the entire design.

**What's next?**
> I'm building toward a Pro version with cloud sync and team collaboration. The dream: every Logitech device ships with 90 days of Context Flow Pro. It sells hardware by making it indispensable.
