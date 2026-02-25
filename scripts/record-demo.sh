#!/bin/bash
# Context Flow - Auto Demo Video Recorder
# Records screen + generates narration + combines with ffmpeg

set -e
VOICE="Samantha"
RATE=170
OUT_DIR="/Users/mac/Desktop/ContextFlowDemo"
mkdir -p "$OUT_DIR"

SAY="/usr/bin/say"

echo "🎬 Context Flow Demo Recorder"
echo "=============================="

# ── 1. GENERATE ALL NARRATION AUDIO CLIPS ────────────────────────────────────
echo "🎙 Generating narration..."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n01.aiff" \
  "Every day, you switch apps... one thousand, two hundred times. Each switch costs twenty-three seconds of mental recovery. That's five weeks per year... gone. Just getting back to where you were."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n02.aiff" \
  "Context Flow changes everything. With one button on your Logitech MX Creative Console..."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n03.aiff" \
  "Press SNAP. Your entire workspace is captured. Every app. Every file. Every window. In one second."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n04.aiff" \
  "Then... life happens. Messages. Emails. Distractions. Your context is shattered."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n05.aiff" \
  "But with Context Flow... just find your context... and click Restore."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n06.aiff" \
  "Boom. Everything is back. Exact windows. Exact tabs. Exact directory. One second."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n07.aiff" \
  "And it learns. The AI suggests the right context before you even think about it."

$SAY -v "$VOICE" -r $RATE -o "$OUT_DIR/n08.aiff" \
  "Context Flow. Built for the Logitech MX ecosystem. Available now on GitHub. Stay in flow."

echo "✅ Narration clips generated"

# ── 2. GET DURATIONS ──────────────────────────────────────────────────────────
get_dur() {
  ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$1" 2>/dev/null || echo "3.0"
}

D1=$(get_dur "$OUT_DIR/n01.aiff")
D2=$(get_dur "$OUT_DIR/n02.aiff")
D3=$(get_dur "$OUT_DIR/n03.aiff")
D4=$(get_dur "$OUT_DIR/n04.aiff")
D5=$(get_dur "$OUT_DIR/n05.aiff")
D6=$(get_dur "$OUT_DIR/n06.aiff")
D7=$(get_dur "$OUT_DIR/n07.aiff")
D8=$(get_dur "$OUT_DIR/n08.aiff")

echo "Clip durations: $D1 | $D2 | $D3 | $D4 | $D5 | $D6 | $D7 | $D8"

# ── 3. COMBINE ALL AUDIO INTO ONE TIMELINE ────────────────────────────────────
echo "🔊 Combining audio..."

# Convert all to wav first, then concat
for i in 01 02 03 04 05 06 07 08; do
  ffmpeg -y -i "$OUT_DIR/n${i}.aiff" -ar 44100 -ac 2 "$OUT_DIR/n${i}.wav" -loglevel quiet
done

# Concatenate with 0.4s silence between each
ffmpeg -y \
  -i "$OUT_DIR/n01.wav" -i "$OUT_DIR/n02.wav" -i "$OUT_DIR/n03.wav" \
  -i "$OUT_DIR/n04.wav" -i "$OUT_DIR/n05.wav" -i "$OUT_DIR/n06.wav" \
  -i "$OUT_DIR/n07.wav" -i "$OUT_DIR/n08.wav" \
  -filter_complex "\
    [0]apad=pad_dur=0.5[a0];\
    [1]apad=pad_dur=0.4[a1];\
    [2]apad=pad_dur=0.6[a2];\
    [3]apad=pad_dur=0.4[a3];\
    [4]apad=pad_dur=0.3[a4];\
    [5]apad=pad_dur=0.6[a5];\
    [6]apad=pad_dur=0.4[a6];\
    [7]apad=pad_dur=0.0[a7];\
    [a0][a1][a2][a3][a4][a5][a6][a7]concat=n=8:v=0:a=1[aout]" \
  -map "[aout]" "$OUT_DIR/narration_full.wav" -loglevel quiet

TOTAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT_DIR/narration_full.wav")
echo "✅ Total narration duration: ${TOTAL_DUR}s"

# ── 4. PREPARE DEMO SCENE ─────────────────────────────────────────────────────
echo "🖥  Setting up demo scene..."

# Kill old app instance
pkill -f "fixed-main.js" 2>/dev/null || true
sleep 1

# Clear contexts for fresh demo
rm -f ~/.context-flow/contexts.json

# Open Safari to a relevant URL
osascript << 'APPLESCRIPT'
tell application "Safari"
  activate
  open location "https://github.com/cinderspire/context-flow"
  delay 1
  set bounds of front window to {30, 80, 760, 520}
end tell
APPLESCRIPT

# Open Terminal
osascript << 'APPLESCRIPT'
tell application "Terminal"
  activate
  do script "cd '/Users/mac/Desktop/OmniFlow AI/context-flow' && git log --oneline -5"
  delay 0.5
  set bounds of front window to {30, 540, 760, 880}
end tell
APPLESCRIPT

sleep 2

# Start Context Flow app
cd "/Users/mac/Desktop/OmniFlow AI/context-flow/apps/desktop"
npx electron src/main/fixed-main.js &
APP_PID=$!
sleep 4

# Position Context Flow on the right
osascript << 'APPLESCRIPT'
tell application "System Events"
  tell process "Electron"
    set frontmost to true
    delay 0.3
    set position of front window to {780, 80}
    set size of front window to {480, 820}
  end tell
end tell
APPLESCRIPT

sleep 1
echo "✅ Scene ready"

# ── 5. RECORD SCREEN WHILE PLAYING NARRATION + DOING ACTIONS ─────────────────
echo "🔴 Starting screen recording + synchronized actions..."

RECORDING="$OUT_DIR/screen_raw.mov"

# Start screen recording in background using ffmpeg avfoundation
ffmpeg -y -f avfoundation -r 30 -i "Capture screen 0" \
  -vcodec libx264 -preset ultrafast -crf 23 \
  "$RECORDING" -loglevel quiet &
SCREEN_PID=$!
sleep 2.5  # let recording stabilize

# ─ SCENE 1: Show problem (n01 — ~9s) ─────────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "Every day, you switch apps... one thousand, two hundred times. Each switch costs twenty-three seconds of mental recovery. That's five weeks per year... gone. Just getting back to where you were." &
SAY_PID=$!

# Visually show busy desktop — click around Terminal and Safari
sleep 1
osascript -e 'tell application "Terminal" to activate' 2>/dev/null
sleep 1.5
osascript -e 'tell application "Safari" to activate' 2>/dev/null
sleep 1.5
osascript -e 'tell application "Terminal" to activate' 2>/dev/null
wait $SAY_PID
sleep 0.5

# ─ SCENE 2: Introduce solution (n02 — ~3s) ────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "Context Flow changes everything. With one button on your Logitech MX Creative Console..." &
SAY_PID=$!
osascript -e 'tell application "System Events" to tell process "Electron" to set frontmost to true' 2>/dev/null
wait $SAY_PID
sleep 0.3

# ─ SCENE 3: SNAP (n03 — ~4s) ─────────────────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "Press SNAP. Your entire workspace is captured. Every app. Every file. Every window. In one second." &
SAY_PID=$!

sleep 0.8
# Click SNAP button via AppleScript
osascript << 'APPLESCRIPT'
tell application "System Events"
  tell process "Electron"
    set frontmost to true
    delay 0.3
    -- Click SNAP button (approximate position)
    click at {1020, 310}
  end tell
end tell
APPLESCRIPT

wait $SAY_PID
sleep 1.2  # let toast appear

# ─ SCENE 4: Chaos (n04 — ~4s) ────────────────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "Then... life happens. Messages. Emails. Distractions. Your context is shattered." &
SAY_PID=$!

sleep 0.5
osascript -e 'tell application "Safari" to activate' 2>/dev/null
sleep 0.5
osascript << 'APPLESCRIPT'
tell application "Safari"
  open location "https://devstudiologitech2026.devpost.com"
end tell
APPLESCRIPT
sleep 1
osascript -e 'tell application "Terminal" to activate' 2>/dev/null
sleep 0.5
osascript -e 'tell application "Finder" to activate' 2>/dev/null
wait $SAY_PID
sleep 0.3

# ─ SCENE 5: Navigate to restore (n05 — ~3s) ──────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "But with Context Flow... just find your context... and click Restore." &
SAY_PID=$!

osascript -e 'tell application "System Events" to tell process "Electron" to set frontmost to true' 2>/dev/null
wait $SAY_PID
sleep 0.5

# ─ SCENE 6: RESTORE (n06 — ~4s) ─────────────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "Boom. Everything is back. Exact windows. Exact tabs. Exact directory. One second." &
SAY_PID=$!

sleep 0.5
# Click first Restore button in the list
osascript << 'APPLESCRIPT'
tell application "System Events"
  tell process "Electron"
    set frontmost to true
    delay 0.2
    click at {1100, 495}
  end tell
end tell
APPLESCRIPT

wait $SAY_PID
sleep 2.5  # let teleport overlay + app restore complete

# ─ SCENE 7: AI (n07 — ~3.5s) ─────────────────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "And it learns. The AI suggests the right context before you even think about it." &
SAY_PID=$!

osascript -e 'tell application "System Events" to tell process "Electron" to set frontmost to true' 2>/dev/null
wait $SAY_PID
sleep 0.4

# ─ SCENE 8: Close (n08 — ~5s) ────────────────────────────────────────────────
$SAY -v "$VOICE" -r $RATE \
  "Context Flow. Built for the Logitech MX ecosystem. Available now on GitHub. Stay in flow." &
SAY_PID=$!

# Show app nicely centered
osascript << 'APPLESCRIPT'
tell application "System Events"
  tell process "Electron"
    set frontmost to true
    set position of front window to {390, 80}
    set size of front window to {500, 850}
  end tell
end tell
APPLESCRIPT

wait $SAY_PID
sleep 1.5

# ── STOP RECORDING ────────────────────────────────────────────────────────────
kill $SCREEN_PID 2>/dev/null || true
sleep 1.5
echo "✅ Screen recording stopped"

# Kill app
kill $APP_PID 2>/dev/null || true

# Wait for ffmpeg to flush and close the recording file
sleep 2

# ── 6. COMBINE VIDEO + NARRATION AUDIO ───────────────────────────────────────
echo "🎞  Combining video and audio with ffmpeg..."

ffmpeg -y \
  -i "$RECORDING" \
  -i "$OUT_DIR/narration_full.wav" \
  -map 0:v \
  -map 1:a \
  -c:v libx264 -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -shortest \
  -movflags +faststart \
  "$OUT_DIR/context-flow-demo.mp4" \
  -loglevel warning

echo ""
echo "══════════════════════════════════════════"
echo "✅ DEMO VIDEO HAZIR!"
echo "   $OUT_DIR/context-flow-demo.mp4"
ls -lh "$OUT_DIR/context-flow-demo.mp4"
echo "══════════════════════════════════════════"
echo ""
echo "Şimdi yap:"
echo "  1. Videoyu izle → open '$OUT_DIR/context-flow-demo.mp4'"
echo "  2. YouTube'a yükle"
echo "  3. Linki Devpost'a yapıştır"
