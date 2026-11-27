/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import process from 'node:process'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL

    if (!apiUrl?.trim()) {
      throw new Error('VITE_API_URL es obligatoria para compilar la aplicación.')
    }

    let parsedApiUrl
    try {
      parsedApiUrl = new URL(apiUrl)
    } catch {
      throw new Error('VITE_API_URL debe ser una URL absoluta HTTP o HTTPS.')
    }

    if (parsedApiUrl.protocol !== 'http:' && parsedApiUrl.protocol !== 'https:') {
      throw new Error('VITE_API_URL debe usar el protocolo HTTP o HTTPS.')
    }
  }

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      // Las pruebas no deben depender de un .env local: si no hay VITE_API_URL se usa una URL ficticia.
      env: { VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000' },
      setupFiles: './src/test/setup.js',
    },
  }
})
