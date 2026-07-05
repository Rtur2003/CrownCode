import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Vendor ayrımı: uygulama kodu değişince kütüphaneler önbellekte kalır
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/](gsap|lenis)[\\/]/.test(id)) return 'vendor-motion'
          if (/[\\/]ogl[\\/]/.test(id)) return 'vendor-webgl'
          return 'vendor-react'
        },
      },
    },
  },
})
