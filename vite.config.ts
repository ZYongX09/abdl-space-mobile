import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function copyDirSync(src, dest) {
  try {
    mkdirSync(dest, { recursive: true })
    for (const entry of readdirSync(src)) {
      const srcPath = join(src, entry)
      const destPath = join(dest, entry)
      if (statSync(srcPath).isDirectory()) {
        copyDirSync(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
      }
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          captchaKey: env.VITE_CAPTCHA_KEY || process.env.VITE_CAPTCHA_KEY || '',
          turnstileSiteKey: env.VITE_TURNSTILE_SITE_KEY || process.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADYK46vBrTTTBcb6',
        },
      },
    }),
    {
      name: 'copy-functions',
      closeBundle() {
        try {
          copyDirSync('functions', 'dist/functions')
          console.log('[copy-functions] Copied functions/ to dist/functions/')
        } catch (e) {
          if (e.code !== 'ENOENT') console.error('[copy-functions] Error:', e.message)
        }
      },
    },
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://api.abdl-space.top',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  }
})
