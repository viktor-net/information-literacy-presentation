import { useCallback, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

interface ScrubberProps {
  index: number
  count: number
  onScrub: (index: number) => void
  /** Сообщаем, когда идёт перетаскивание, чтобы отключить прокрутку и свайпы */
  onScrubbing?: (active: boolean) => void
}

/**
 * Полоса прогресса с кружком: зажать левой кнопкой и тянуть,
 * чтобы быстро пролистать слайды. Позиция указателя сразу
 * определяет номер слайда, поэтому перемотка идёт вслед за курсором.
 */
export function Scrubber({ index, count, onScrub, onScrubbing }: ScrubberProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const indexAt = useCallback(
    (clientX: number) => {
      const el = ref.current
      if (!el || count < 2) return 0
      const r = el.getBoundingClientRect()
      const p = Math.min(Math.max((clientX - r.left) / r.width, 0), 1)
      return Math.round(p * (count - 1))
    },
    [count],
  )

  const begin = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      // ЛКМ или палец; правой кнопкой не перематываем
      if (e.pointerType === 'mouse' && e.button !== 0) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
      onScrubbing?.(true)
      onScrub(indexAt(e.clientX))
    },
    [indexAt, onScrub, onScrubbing],
  )

  const move = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragging) return
      e.preventDefault()
      onScrub(indexAt(e.clientX))
    },
    [dragging, indexAt, onScrub],
  )

  const finish = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragging) return
      setDragging(false)
      onScrubbing?.(false)
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    },
    [dragging, onScrubbing],
  )

  // Клавиши обрабатывает общий пульт (стрелки, Home, End, цифры),
  // поэтому события не перехватываем и ползунок не мешает листать.
  const progress = count > 1 ? index / (count - 1) : 1
  const pct = `${(progress * 100).toFixed(3)}%`

  return (
    <div
      ref={ref}
      className={`bar${dragging ? ' is-dragging' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label="Перемотка презентации"
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={index + 1}
      aria-valuetext={`Слайд ${index + 1} из ${count}`}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <div className="bar__track" />
      <div className="bar__fill" style={{ width: pct }} />
      <div className="bar__knob" style={{ left: pct }}>
        <span className="bar__knobTip">{index + 1}</span>
      </div>
    </div>
  )
}
