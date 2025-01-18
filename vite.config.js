import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'owl-icon.svg'],
      manifest: {
        name: 'Bank of Aztech',
        short_name: 'BOFA',
        description: 'Bank of Aztech dApp',
        theme_color: '#805AD5',
        background_color: '#1A202C',
        icons: [
          {
            src: 'owl-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      buffer: 'buffer/'
    }
  },
  define: {
    'process.env': {},
    global: {}
  }
}) 