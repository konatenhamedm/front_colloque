import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    tanstackRouter({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts', autoCodeSplitting: true }),
    tailwindcss(),
    react(),
  ],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  build: { rollupOptions: { output: { manualChunks: (id: string) => (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') ? 'charts' : undefined) } } },
  // Port dédié (5173 est souvent pris par d'autres projets) — doit correspondre à FRONT_URL dans backend/.env
  server: { port: 5180, strictPort: true },
})
