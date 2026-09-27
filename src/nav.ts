import { createContext, useContext } from 'react'

/**
 * Навигация изнутри слайда. Нужна плану презентации: пункты-переходы
 * на слайд-заголовок раздела. В превью сетки контекст не провайдится,
 * поэтому там пункты остаются обычным текстом.
 */
export interface DeckNav {
  /** Индексы слайдов, на которые ведут пункты плана */
  planTargets: number[]
  go: (index: number) => void
}

export const NavContext = createContext<DeckNav | null>(null)

export function useDeckNav(): DeckNav | null {
  return useContext(NavContext)
}
