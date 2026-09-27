import type { BackgroundId } from '../hooks/useBackground'
import { BgPicker } from './BgPicker'

interface ToolbarProps {
  index: number
  count: number
  themeLabel: string
  themePref: 'system' | 'light' | 'dark'
  theme: 'light' | 'dark'
  bgId: BackgroundId
  isFullscreen: boolean
  fullscreenSupported: boolean
  overviewOpen: boolean
  onPrev: () => void
  onNext: () => void
  onOverview: () => void
  onTheme: () => void
  onSelectBg: (id: BackgroundId) => void
  onFullscreen: () => void
  onHelp: () => void
}

/** Что будет применено после нажатия: подсказка прямо на кнопке */
const THEME_NEXT: Record<'system' | 'light' | 'dark', string> = {
  system: 'Светлая',
  light: 'Тёмная',
  dark: 'Как в системе',
}

export function Toolbar(p: ToolbarProps) {
  return (
    <div className="tb">
      <div className="tb__group">
        <button type="button" className="tb__btn" onClick={p.onPrev} aria-label="Предыдущий слайд">
          <span aria-hidden="true">‹</span>
        </button>
        <div className="tb__counter">
          <span className="tb__now">{String(p.index + 1).padStart(2, '0')}</span>
          <span className="tb__sep">/</span>
          <span>{String(p.count).padStart(2, '0')}</span>
        </div>
        <button type="button" className="tb__btn" onClick={p.onNext} aria-label="Следующий слайд">
          <span aria-hidden="true">›</span>
        </button>
      </div>

      {/* Отдельный блок с фиксированной шириной: смена фона не сдвигает соседей */}
      <BgPicker value={p.bgId} onChange={p.onSelectBg} />

      <div className="tb__group tb__group--right">
        <button
          type="button"
          className={`tb__btn tb__btn--wide${p.overviewOpen ? ' is-active' : ''}`}
          onClick={p.onOverview}
        >
          Сетка
        </button>
        <button
          type="button"
          className={`tb__btn tb__btn--wide${p.themePref === 'system' ? ' is-auto' : ''}`}
          onClick={p.onTheme}
          title={
            `Выглядит: ${p.theme === 'dark' ? 'тёмная' : 'светлая'} ` +
            `(${p.themePref === 'system' ? 'как в системе' : 'выбрано вручную'}). ` +
            `По нажатию: ${THEME_NEXT[p.themePref]}`
          }
        >
          {p.themeLabel}
        </button>
        <button type="button" className="tb__btn tb__btn--wide" onClick={p.onHelp} aria-label="Справка">
          ?
        </button>
        {p.fullscreenSupported && (
          <button
            type="button"
            className="tb__btn tb__btn--wide"
            onClick={p.onFullscreen}
            aria-label="Полный экран"
          >
            {p.isFullscreen ? 'Выход' : 'Экран'}
          </button>
        )}
      </div>
    </div>
  )
}
