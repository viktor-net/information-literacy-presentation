import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Сборка в один HTML-файл: весь JS и CSS встраиваются прямо в index.html.
 * Внешних запросов не остаётся — готовый файл можно открыть двойным щелчком
 * или залить на GitHub Pages как есть.
 */
function singleFile(): Plugin {
  return {
    name: 'single-file',
    enforce: 'post',
    apply: 'build',
    generateBundle(_options, bundle) {
      const entries = Object.values(bundle)
      const html = entries.find((f) => f.fileName.endsWith('.html'))
      if (!html || html.type !== 'asset') return

      const scripts = entries.filter((f) => f.fileName.endsWith('.js'))
      const styles = entries.filter((f) => f.fileName.endsWith('.css'))
      const others = entries.filter((f) => !/\.(html|js|css)$/i.test(f.fileName))

      if (others.length) {
        this.warn(
          'single-file: не удалось встроить: ' + others.map((f) => f.fileName).join(', '),
        )
      }
      if (scripts.length > 1) {
        this.error(
          `single-file: ожидается один JS-чанк, получено ${scripts.length} ` +
            `(${scripts.map((f) => f.fileName).join(', ')}). ` +
            'Укажите build.rollupOptions.output.manualChunks.',
        )
      }

      let source = String(html.source)

      // JS-чанки приходят как type: 'chunk' (поле code),
      // CSS — как type: 'asset' (поле source).
      const text = (f: (typeof entries)[number]) =>
        f.type === 'chunk' ? f.code : String(f.source)

      for (const file of scripts) {
        // </script> внутри кода сломает разметку.
        // Замена функцией, а не строкой: иначе $& / $` / $1 в коде
        // будут развёрнуты в разметку и испортят бандл.
        const code = text(file).replace(/<\/script/gi, '<\\/script')
        source = source.replace(
          /<script\b[^>]*\ssrc=["'][^"']*["'][^>]*>\s*<\/script>/i,
          () => `<script type="module">\n${code}\n</script>`,
        )
        delete bundle[file.fileName]
      }

      for (const file of styles) {
        source = source.replace(
          /<link\b[^>]*\srel=["']stylesheet["'][^>]*>/i,
          () => `<style>\n${text(file)}\n</style>`,
        )
        delete bundle[file.fileName]
      }

      // Убираем ссылки на уже встроенные ассеты (modulepreload и т.п.)
      source = source.replace(/<link\b[^>]*\shref=["'][^"']*assets\/[^"']*["'][^>]*>/gi, () => '')

      html.source = source
    },
  }
}

// base: './' -> относительные пути, чтобы сборка работала на GitHub Pages
// из любой подпапки (например https://user.github.io/repo/)
export default defineConfig({
  base: './',
  plugins: [react(), singleFile()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
  server: {
    port: 5173,
    open: true,
  },
})
