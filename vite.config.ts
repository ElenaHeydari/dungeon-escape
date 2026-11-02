import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  base: '/dungeon-escape/',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      devOptions: {
        enabled: false,
      },

      manifest: {
        name: 'Dungeon Escape',
        short_name: 'Dungeon Escape',
        description: 'Explore dangerous dungeons, defeat enemies and escape!',
        theme_color: '#151923',
        background_color: '#151923',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/dungeon-escape/',
        scope: '/dungeon-escape/',

        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        navigateFallback: 'index.html',
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,webmanifest}',
        ],
      },
    }),
  ],
})
