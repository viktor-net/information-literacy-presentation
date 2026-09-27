import { useCallback, useEffect, useMemo, useState } from 'react'
import { applyFavicon } from '../favicon'

/** Как выбрана тема: system — как в системе, light/dark — принудительно */
export type ThemePref = 'system' | 'light' | 'dark'
/** Что реально применяется к документу */
export type Theme = 'light' | 'dark'

export const THEME_LABELS: Record<ThemePref, string> = {
  system: 'Как в системе',
  light: 'Светлая',
  dark: 'Тёмная',
}

const STORAGE_KEY = 'deck-theme'

function readPref(): ThemePref {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
  } catch {
    /* localStorage недоступен */
  }
  return 'system'
}

/**
 * Определяем тему, которую выбрал пользователь в ОС.
 * Если определить нечем (нет matchMedia) — светлая, как и просили.
 */
function readSystemTheme(): Theme {
  try {
    if (typeof window.matchMedia !== 'function') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref)
  // Системная тема нужна и в состоянии, чтобы реагировать на её смену
  const [system, setSystem] = useState<Theme>(readSystemTheme)

  useEffect(() => {
    let mq: MediaQueryList
    try {
      if (typeof window.matchMedia !== 'function') return
      mq = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }
    const onChange = (e: MediaQueryListEvent) => setSystem(e.matches ? 'dark' : 'light')
    setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const theme: Theme = pref === 'system' ? system : pref

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute('content', theme === 'dark' ? 'dark light' : 'light dark')
    applyFavicon(theme)
    try {
      localStorage.setItem(STORAGE_KEY, pref)
    } catch {
      /* игнорируем */
    }
  }, [theme, pref])

  /** Как в системе → светлая → тёмная → как в системе */
  const cycle = useCallback(() => {
    setPref((p) => (p === 'system' ? 'light' : p === 'light' ? 'dark' : 'system'))
  }, [])

  return useMemo(
    () => ({ pref, theme, label: THEME_LABELS[pref], cycle }),
    [pref, theme, cycle],
  )
}
