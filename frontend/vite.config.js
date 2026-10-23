import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/** Writes robots.txt at build time so the sitemap URL matches VITE_SITE_URL. */
function robotsTxt(siteUrl) {
  return {
    name: 'robots-txt',
    apply: 'build',
    generateBundle() {
      const lines = ['User-agent: *', 'Disallow: /admin']
      if (siteUrl) lines.push('', `Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml`)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${lines.join('\n')}\n` })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // In development the SPA and Laravel share one origin through this proxy,
  // so Sanctum's session cookie and CSRF token work without CORS.
  const backend = env.DEV_BACKEND_URL || 'http://localhost:8000'

  return {
    plugins: [react(), tailwindcss(), robotsTxt(env.VITE_SITE_URL)],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: backend, changeOrigin: false },
        '/sanctum': { target: backend, changeOrigin: false },
        '/storage': { target: backend, changeOrigin: true },
        '/sitemap.xml': { target: backend, changeOrigin: true },
      },
    },
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // Keep the admin panel (and its editor) out of the public bundle
          manualChunks(id) {
            if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror')) return 'editor'
            if (id.includes('node_modules/react-router')) return 'router'
            if (id.includes('node_modules/react')) return 'react'
          },
        },
      },
    },
    test: {
      // Worker threads start reliably on Windows paths with spaces (forks can time out)
      pool: 'threads',
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/test/setup.js',
      css: false,
    },
  }
})
