#!/usr/bin/env node

/**
 * Context Flow - Verification Script
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'apps/desktop/package.json',
  'apps/desktop/src/main/index.ts',
  'apps/desktop/src/preload/index.ts',
  'apps/desktop/src/renderer/App.tsx',
  'core/package.json',
  'core/types.ts',
  'core/index.ts',
  'docs/VISION.md',
  'docs/ARCHITECTURE.md',
  'docs/PITCH.md',
  'README.md'
];

console.log('🔍 Verifying Context Flow project...\n');

let passed = 0;
let failed = 0;

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
    passed++;
  } else {
    console.log(`❌ ${file}`);
    failed++;
  }
}

console.log(`\n${passed}/${requiredFiles.length} files verified`);

if (failed === 0) {
  console.log('\n🎉 Project verified successfully!');
} else {
  console.log(`\n⚠️ ${failed} files missing`);
  process.exit(1);
}
