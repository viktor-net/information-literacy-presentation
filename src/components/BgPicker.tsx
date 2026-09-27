import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { BACKGROUNDS } from '../hooks/useBackground'
import type { BackgroundId } from '../hooks/useBackground'

interface BgPickerProps {
  value: BackgroundId
  onChange: (id: BackgroundId) => void
}

/**
 * Свой выпадающий список вместо системного <select>.
 * Системный не поддаётся оформлению: рамку и стрелку рисует Windows.
 * Здесь всё совпадает с остальными панелями, а у каждого варианта
 * есть миниатюра фона — выбирать приходится не по названию.
 */
export function BgPicker({ value, onChange }: BgPickerProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = 'tb-bg-list'

  const current = BACKGROUNDS.find((b) => b.id === value) ?? BACKGROUNDS[0]

  // Клик мимо — закрыть
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // При открытии выделяем текущий вариант
  useEffect(() => {
    if (open) setActive(Math.max(BACKGROUNDS.findIndex((b) => b.id === value), 0))
  }, [open, value])

  const choose = useCallback(
    (id: BackgroundId) => {
      onChange(id)
      setOpen(false)
    },
    [onChange],
  )

  // Все клавиши перехватываем: иначе «пробел» и стрелки уедут
  // в общий пульт и начнут листать слайды вместо работы со списком
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      const last = BACKGROUNDS.length - 1
      let handled = true
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          setOpen(true)
        } else {
          handled = false
        }
      } else if (e.key === 'ArrowDown') {
        setActive((i) => Math.min(i + 1, last))
      } else if (e.key === 'ArrowUp') {
        setActive((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Home') {
        setActive(0)
      } else if (e.key === 'End') {
        setActive(last)
      } else if (e.key === 'Enter' || e.key === ' ') {
        choose(BACKGROUNDS[active].id)
      } else if (e.key === 'Escape') {
        setOpen(false)
      } else if (e.key === 'Tab') {
        setOpen(false)
        handled = false
      } else {
        handled = false
      }
      if (handled) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    [open, active, choose],
  )

  return (
    <div className="tb__picker" ref={rootRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="tb__btn tb__btn--wide tb__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        title="Фон слайда"
      >
        <span className="bgchip" data-bg={current.id} aria-hidden="true" />
        <span className="tb__triggerText">{current.name}</span>
        <span className="tb__triggerArrow" aria-hidden="true" />
      </button>

      {open && (
        <div className="menu" role="listbox" id={listId} aria-label="Фон слайда">
          {BACKGROUNDS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              id={`${listId}-${i}`}
              role="option"
              aria-selected={b.id === value}
              className={`menu__item${i === active ? ' is-active' : ''}${b.id === value ? ' is-on' : ''}`}
              onClick={() => choose(b.id)}
              onPointerEnter={() => setActive(i)}
            >
              <span className="bgchip bgchip--lg" data-bg={b.id} aria-hidden="true" />
              <span className="menu__label">{b.name}</span>
              {b.id === value && (
                <span className="menu__tick" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
