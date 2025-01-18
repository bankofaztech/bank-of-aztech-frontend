import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/bankofaztech.github.io/',
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
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'web3-vendor': ['ethers', '@wagmi/core', '@rainbow-me/rainbowkit'],
          'ui-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled']
        }
      }
    }
  }
}) 