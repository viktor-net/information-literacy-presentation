import type { Theme } from './hooks/useTheme'

/**
 * Иконка вкладки рисуется прямо в строке: файл должен остаться один
 * и работать без сети, поэтому подключать внешний .ico/.png нельзя.
 */
function toUrl(svg: string): string {
  return 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim())
}

/** Скруглённый квадрат, «play» и бирюзовая полоска — как полоса прокрутки */
function icon(bg: string, triangle: string, bar: string, border?: string): string {
  return toUrl(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      `<rect width="32" height="32" rx="7" fill="${bg}"` +
      (border ? ` stroke="${border}" stroke-width="1"` : '') +
      '/>' +
      `<path d="M12 8.5 23 15 12 21.5Z" fill="${triangle}"/>` +
      `<rect x="8" y="24" width="16" height="2.5" rx="1.25" fill="${bar}"/>` +
      '</svg>',
  )
}

export const FAVICON: Record<Theme, string> = {
  // Фон под панель браузера: тёмный для тёмной темы, белый с рамкой для светлой
  dark: icon('#0e1220', '#7ba3ff', '#2ed0ce'),
  light: icon('#ffffff', '#3b5fd0', '#0e8f88', '#d8deee'),
}

/** Ставим иконку вкладки под текущую тему */
export function applyFavicon(theme: Theme): void {
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) return
  const href = FAVICON[theme]
  if (link.getAttribute('href') !== href) link.setAttribute('href', href)
}
