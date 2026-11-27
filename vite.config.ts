import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'https://localhost:38443',
        changeOrigin: true,
        secure: false, // Dev proxy only: local backend uses its own TLS certificate.
        headers: {
          'X-Forwarded-Proto': 'https',
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const authHeader = proxyReq.getHeader('authorization')
            if (authHeader) {
              // Ngăn lỗi "Credentials identify different actors" khi browser còn lưu cookie cũ khác actor với Bearer token
              proxyReq.removeHeader('cookie')
            }
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            // Log response nếu có lỗi
            if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
              console.log(`[PROXY RES] ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
            }
          })
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
