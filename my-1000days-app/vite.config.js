import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 서버
  server: {
    host: true,        // 또는 '0.0.0.0'
    port: 5173,
  },

  // 절대경로 설정
  resolve:{
    alias:[
      { find:"@", replacement:"/src"},
      { find:"@page", replacement:"src/page"}
    ]
  }
})
