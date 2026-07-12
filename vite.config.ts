/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Manifest minimal pour la Phase 0. Sera complété en Phase 6
      // (icônes définitives, écran de démarrage, précache complet).
      manifest: {
        name: 'MathKids',
        short_name: 'MathKids',
        description: "Apprendre les maths en s'amusant, du CP au CM2.",
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#FCF7EE',
        theme_color: '#C25A38',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // Permet d'écrire import ... from '@/engine/...' au lieu de chemins relatifs.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
  },
})
