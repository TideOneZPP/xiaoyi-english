import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'

const textbookRoot = resolve(process.cwd(), 'textbooks')
const contentTypes = {
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
}

function localTextbooks() {
  const middleware = (req, res, next) => {
    try {
      const requestPath = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '')
      const filePath = resolve(textbookRoot, requestPath)
      if (filePath !== textbookRoot && !filePath.startsWith(`${textbookRoot}${sep}`)) return next()
      if (!existsSync(filePath) || !statSync(filePath).isFile()) return next()
      res.setHeader('Content-Type', contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream')
      res.setHeader('Cache-Control', extname(filePath).toLowerCase() === '.json' ? 'no-cache' : 'public, max-age=86400')
      createReadStream(filePath).pipe(res)
    } catch {
      next()
    }
  }
  return {
    name: 'local-textbooks',
    configureServer(server) { server.middlewares.use('/textbooks', middleware) },
    configurePreviewServer(server) { server.middlewares.use('/textbooks', middleware) },
  }
}

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
  },
  plugins: [
    react(),
    localTextbooks(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icon.svg',
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'pwa-64x64.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
      ],
      manifest: {
        name: '小译同学 · 英语同步练',
        short_name: '小译同学',
        description: '打开即用的译林版英语静态课本点读与原句练习工具',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        background_color: '#f3f6fb',
        theme_color: '#5668d8',
        orientation: 'any',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json}'],
        globIgnores: ['textbooks/**'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/textbooks\/data\/books\/.*\/pages\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'xiaoyi-textbook-pages-v1',
              expiration: { maxEntries: 180, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/textbooks\/data\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'xiaoyi-textbook-data-v1',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 220, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
