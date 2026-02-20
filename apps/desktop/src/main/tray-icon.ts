/**
 * Tray Icon Generator
 * Creates a simple icon for the system tray
 */

import { nativeImage } from 'electron';

export function createTrayIcon(): nativeImage {
  // Create a 16x16 icon programmatically
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return nativeImage.createEmpty();
  }
  
  // Draw a simple circle
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Convert to nativeImage
  const dataUrl = canvas.toDataURL();
  return nativeImage.createFromDataURL(dataUrl);
}

// Fallback icon using a simple Buffer
export function createFallbackIcon(): nativeImage {
  // 16x16 PNG data for a simple blue square
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x10,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0xF3, 0xFF,
    0x61, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x60, 0x18, 0x05, 0xA3,
    0x60, 0x14, 0x00, 0x00, 0x01, 0x0D, 0x00, 0x49,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return nativeImage.createFromBuffer(pngData);
}
