import { useEffect, useRef, useState } from 'react'
import {
  DIGIT_RE,
  NEXT_CODES,
  PREV_CODES,
  SHIFT_PREV_CODES,
  TOGGLE_BY_CODE,
} from '../deck.keys'

export interface DeckActions {
  next: () => void
  prev: () => void
  go: (index: number) => void
  first: () => void
  last: () => void
  toggleFullscreen: () => void
  exitFullscreen: () => void
  toggleOverview: () => void
  toggleTheme: () => void
  cycleBackground: () => void
  toggleHelp: () => void
  toggleBlank: () => void
  closeOverlays: () => boolean
  hasOverlay: () => boolean
  isFullscreen: () => boolean
}

const JUMP_TIMEOUT = 2500

/**
 * Управление как с пульта / клавиатуры презентации.
 * Все сочетания разбираются по KeyboardEvent.code, поэтому работают
 * и в латинской, и в русской раскладке.
 */
export function useRemoteControl(actions: DeckActions, count: number): string {
  const [jump, setJump] = useState('')
  const buffer = useRef('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => window.clearTimeout(timer.current)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }

      // --- Пробел: Shift + Пробел листает назад ---
      if (e.code === 'Space') {
        e.preventDefault()
        if (e.shiftKey) actions.prev()
        else actions.next()
        return
      }

      // --- Esc: сначала закрывает панели, потом выходит из полного экрана ---
      if (e.code === 'Escape' || e.key === 'Escape') {
        if (actions.closeOverlays()) {
          e.preventDefault()
          return
        }
        if (actions.isFullscreen()) {
          e.preventDefault()
          actions.exitFullscreen()
        }
        return
      }

      // --- Ввод номера слайда: цифры с основной и цифровой клавиатуры ---
      const digit = DIGIT_RE.exec(e.code)
      if (digit) {
        window.clearTimeout(timer.current)
        buffer.current += digit[1]
        setJump(buffer.current)
        timer.current = window.setTimeout(() => {
          buffer.current = ''
          setJump('')
        }, JUMP_TIMEOUT)
        e.preventDefault()
        return
      }

      // --- Enter в буфере — переход на слайд ---
      if (e.code === 'Enter' && buffer.current) {
        const target1 = Math.min(Math.max(Number(buffer.current), 1), count) - 1
        buffer.current = ''
        setJump('')
        window.clearTimeout(timer.current)
        actions.go(target1)
        e.preventDefault()
        return
      }

      // --- Крайние слайды (работают и при открытой сетке) ---
      if (e.code === 'Home') {
        e.preventDefault()
        actions.first()
        return
      }

      if (e.code === 'End') {
        e.preventDefault()
        actions.last()
        return
      }

      // --- Переключатели вида ---
      const toggle = TOGGLE_BY_CODE.get(e.code)
      if (toggle) {
        e.preventDefault()
        actions[toggle]()
        return
      }

      if (actions.hasOverlay()) return

      // --- Навигация ---
      if (NEXT_CODES.has(e.code)) {
        e.preventDefault()
        actions.next()
        return
      }

      if (PREV_CODES.has(e.code) || (e.shiftKey && SHIFT_PREV_CODES.has(e.code))) {
        e.preventDefault()
        actions.prev()
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [actions, count])

  return jump
}
