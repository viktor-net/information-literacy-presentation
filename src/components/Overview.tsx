import type { Slide } from '../slides/types'
import { ASPECT, ScaledSlide } from './ScaledSlide'

interface OverviewProps {
  slides: Slide[]
  current: number
  onSelect: (index: number) => void
  onClose: () => void
  width: number
  height: number
}

const GAP = 18
const CHROME = 118 // заголовок + отступы сверху/снизу

export function Overview({ slides, current, onSelect, onClose, width, height }: OverviewProps) {
  const cols = width < 760 ? 2 : width < 1240 ? 3 : 4
  const rows = Math.ceil(slides.length / cols)

  // Ограничиваем ячейку и по ширине, и по высоте, чтобы сетка помещалась в экран
  const byWidth = (width - GAP * (cols + 1)) / cols
  const byHeight = (height - CHROME - GAP * (rows + 1)) / rows / ASPECT
  const cellW = Math.max(Math.min(byWidth, byHeight), 110)
  const cellH = cellW / ASPECT

  const gridW = cols * cellW + GAP * (cols - 1)
  const gridH = rows * cellH + GAP * (rows - 1)

  return (
    <div className="ov" role="dialog" aria-label="Обзор слайдов" onClick={onClose}>
      <div className="ov__head">
        <span className="ov__title">Все слайды</span>
        <span className="ov__hint">
          Клик — перейти · <kbd>Esc</kbd> / <kbd>O</kbd> — закрыть
        </span>
      </div>
      <div
        className="ov__grid"
        style={{ width: gridW, height: gridH }}
        onClick={(e) => e.stopPropagation()}
      >
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={`ov__cell${i === current ? ' is-current' : ''}`}
            style={{ width: cellW, height: cellH }}
            onClick={() => onSelect(i)}
            aria-label={`Слайд ${i + 1}: ${slide.title.replace(/\n/g, ' ')}`}
          >
            <ScaledSlide slide={slide} width={cellW} />
            <span className="ov__num">{i + 1}</span>
            <span className="ov__name">{slide.title.replace(/\n/g, ' ')}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
