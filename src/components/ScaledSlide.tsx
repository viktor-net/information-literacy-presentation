import { useCallback, useEffect, useRef, useState } from 'react'

export const DESIGN_W = 1600
export const DESIGN_H = 900
export const ASPECT = DESIGN_W / DESIGN_H

import type { CSSProperties } from 'react'
import type { Slide } from '../slides/types'
import { SlideView } from '../slides/SlideView'

export interface Size {
  width: number
  height: number
}

/**
 * Размер реального контейнера, а не window.innerWidth.
 * Это корректнее на мобильных (там window.innerWidth может не совпадать
 * с шириной раскладки), при зуме браузера и внутри iframe.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<Size>({ width: 1280, height: 800 })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setSize((prev) =>
      Math.round(prev.width) === Math.round(r.width) && Math.round(prev.height) === Math.round(r.height)
        ? prev
        : { width: r.width, height: r.height },
    )
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('orientationchange', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', measure)
    }
  }, [measure])

  return { ref, size }
}

interface ScaledSlideProps {
  slide: Slide
  /** Доступная ширина в CSS-пикселях */
  width: number
  className?: string
  style?: CSSProperties
}

/** Слайд фиксированного размера 1600x900, масштабируемый под доступную ширину */
export function ScaledSlide({ slide, width, className, style }: ScaledSlideProps) {
  const scale = width / DESIGN_W
  return (
    <div
      className={`scaled${className ? ` ${className}` : ''}`}
      style={
        {
          width: DESIGN_W * scale,
          height: DESIGN_H * scale,
          // Тень отбрасывает внешний контейнер, поэтому его скругление
          // должно совпадать со скруглением слайда с учётом масштаба
          '--k': scale,
          ...style,
        } as CSSProperties
      }
    >
      <div
        className="scaled__canvas"
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
      >
        <SlideView slide={slide} />
      </div>
    </div>
  )
}
