import { defineConfig } from 'electron-vite'
import path from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist/preload'
    }
  },
  renderer: {
    root: path.join(__dirname, 'src/renderer'),
    build: {
      outDir: 'dist/renderer'
    }
  }
})
