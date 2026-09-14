import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy: the browser talks only to the Vite origin (localhost:3000),
// and Vite forwards each /svc/* prefix to the matching Spring Boot service.
// This removes all CORS concerns during development.
const svc = (target) => ({
  target,
  changeOrigin: true,
  rewrite: (p) => p.replace(/^\/svc\/[^/]+/, ''),
})

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/svc/product': svc('http://localhost:8081'),
      '/svc/inventory': svc('http://localhost:8082'),
      '/svc/order': svc('http://localhost:8083'),
      '/svc/recommendation': svc('http://localhost:8084'),
      '/svc/user': svc('http://localhost:8085'),
    },
  },
})
