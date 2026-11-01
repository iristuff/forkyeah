/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Fork Yeah',
        short_name: 'Fork Yeah',
        description: 'Learn real dishes from around the world. Earn XP, collect passport stamps, cook with an AI sous chef.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#FFFCF3',
        background_color: '#FFE27A', // Android's launch screen: same yellow as our splash
        categories: ['food', 'education', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // iPhone launch images are read once when the app is installed: don't precache them
        globIgnores: ['splash/**'],
        navigateFallback: '/index.html',
        // AI endpoints and the Firebase sign-in handler (/__/auth, proxied by vercel.json)
        // must always hit the network, never the app shell or the cache
        navigateFallbackDenylist: [/^\/api\//, /^\/__\//],
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    passWithNoTests: true,
  },
});
