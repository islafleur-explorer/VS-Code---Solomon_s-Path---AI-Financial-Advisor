import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the base path to match your repository name
  base: '/VS-Code---Solomon_s-Path---AI-Financial-Advisor/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})