import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Состояние колоды: текущий слайд + навигация.
 * Индекс синхронизируется с hash (#/3), чтобы работали ссылки и F5.
 */
export function useDeck(count: number) {
  const clamp = useCallback(
    (i: number) => Math.min(Math.max(i, 0), Math.max(count - 1, 0)),
    [count],
  )

  const readHash = useCallback(() => {
    const m = /^#\/(\d+)$/.exec(window.location.hash)
    if (!m) return 0
    return clamp(Number(m[1]) - 1)
  }, [clamp])

  const [index, setIndex] = useState(() => {
    if (typeof window === 'undefined') return 0
    const m = /^#\/(\d+)$/.exec(window.location.hash)
    return m ? Math.min(Math.max(Number(m[1]) - 1, 0), Math.max(count - 1, 0)) : 0
  })
  const [direction, setDirection] = useState<1 | -1>(1)
  const first = useRef(true)

  const go = useCallback(
    (next: number) => {
      setIndex((current) => {
        const target = clamp(next)
        if (target !== current) setDirection(target > current ? 1 : -1)
        return target
      })
    },
    [clamp],
  )

  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp])
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp])
  const firstSlide = useCallback(() => go(0), [go])
  const lastSlide = useCallback(() => go(count - 1), [go])

  // Запись в hash без добавления истории: кнопка «назад» в браузере
  // не должна листать слайды.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const hash = `#/${index + 1}`
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
  }, [index])

  // Реакция на изменение hash пользователем (в т.ч. назад/вперёд)
  useEffect(() => {
    const onHash = () => setIndex(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [readHash])

  return { index, count, direction, go, next, prev, first: firstSlide, last: lastSlide }
}
