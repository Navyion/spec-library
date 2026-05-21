import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.nl.go.kr',
        changeOrigin: true,
        rewrite: function(path) {
          return path.replace(/^\/api/, '/NL/search/openApi');
        }
      }
    }
  }
})