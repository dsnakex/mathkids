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
      // Service worker désactivé en dev (évite un cache parasite) ; actif au build.
      devOptions: { enabled: false },
      // Precache de tout le shell + contenu (JSON bundlé) + police : l'app
      // fonctionne 100 % hors ligne après la première visite.
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
      manifest: {
        id: '/',
        name: 'MathKids — les maths en s\'amusant',
        short_name: 'MathKids',
        description: "Apprendre les maths en s'amusant, du CP au CM2. Hors ligne, sans pub.",
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['education', 'kids'],
        background_color: '#FCF7EE',
        theme_color: '#C25A38',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
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
