# 🚀 Context Flow - Quick Start

## Geliştirme Ortamı Kurulumu

### 1. Gereksinimler
- Node.js 18+ 
- npm veya yarn
- macOS (geliştirme için) / Windows / Linux

### 2. Kurulum

```bash
# Projeye git
cd context-flow

# Bağımlılıkları yükle
npm install

# Core modülü build et
cd core && npm run build && cd ..

# Uygulamayı başlat
cd apps/desktop && npm run dev
```

### 3. Build Alma

```bash
# Tümünü build et
npm run build

# Paketle (macOS)
npm run package
```

## Özellikler

### 🎯 Core Features
- ✅ **Context Snap**: Tek tıkla workspace kaydet
- ✅ **Context Restore**: Anında geri yükle
- ✅ **AI Suggestions**: Akıllı öneriler
- ✅ **Hardware Integration**: Logitech MX desteği

### 📱 Desteklenen Uygulamalar
- ✅ VSCode
- ✅ Chrome
- ✅ Terminal
- ⚠️ Figma (beta)
- ⚠️ Photoshop (alpha)

## Sorun Giderme

### "node-window-manager" hatası
```bash
npm rebuild
```

### "better-sqlite3" hatası
```bash
cd apps/desktop && npm run postinstall
```

## Demo Senaryosu

1. VSCode + Terminal + Chrome aç
2. Context Flow'da "SNAP" butonuna bas
3. Diğer uygulamalara geç
4. Context Flow'dan kaydedileni seç ve geri yükle
5. Tüm pencereler eski haline döner!

---

**Hazır!** 🎉
