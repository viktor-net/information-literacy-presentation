import { useCallback, useEffect, useState } from 'react'

export const BACKGROUNDS = [
  { id: 'aurora', name: 'Сияние' },
  { id: 'mesh', name: 'Градиентная сетка' },
  { id: 'grid', name: 'Чертёж' },
  { id: 'dots', name: 'Точки' },
  { id: 'paper', name: 'Бумага' },
] as const

export type BackgroundId = (typeof BACKGROUNDS)[number]['id']

const STORAGE_KEY = 'deck-bg'

function isId(v: string | null): v is BackgroundId {
  return BACKGROUNDS.some((b) => b.id === v)
}

function readInitial(): BackgroundId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isId(saved)) return saved
  } catch {
    /* localStorage недоступен */
  }
  return 'grid'
}

export function useBackground() {
  const [bg, setBg] = useState<BackgroundId>(readInitial)

  useEffect(() => {
    document.documentElement.dataset.bg = bg
    try {
      localStorage.setItem(STORAGE_KEY, bg)
    } catch {
      /* игнорируем */
    }
  }, [bg])

  const cycle = useCallback(() => {
    setBg((current) => {
      const i = BACKGROUNDS.findIndex((b) => b.id === current)
      return BACKGROUNDS[(i + 1) % BACKGROUNDS.length].id
    })
  }, [])

  /** Выбор из выпадающего списка */
  const select = useCallback((id: BackgroundId) => setBg(id), [])

  const name = BACKGROUNDS.find((b) => b.id === bg)?.name ?? bg
  return { bg, name, cycle, select }
}
