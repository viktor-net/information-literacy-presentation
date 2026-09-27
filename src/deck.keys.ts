/**
 * Единый список клавиш управления.
 *
 * Опираемся на KeyboardEvent.code, а не на event.key:
 * code — физическая позиция клавиши, поэтому сочетания работают
 * и в латинской, и в русской (ЙЦУКЕН) раскладке, хотя подписи
 * показываются в латинской.
 *
 * И этот же список используется и обработчиком, и справкой (клавиша H),
 * и подсказкой внизу экрана — расхождений быть не может.
 */

export interface KeyCap {
  /** Значение KeyboardEvent.code */
  code: string
  /** Подпись клавиши для пользователя (латинская раскладка) */
  key: string
  /** Если задано, Shift + эта клавиша листает назад */
  shiftPrev?: boolean
}

export type ToggleName =
  | 'toggleFullscreen'
  | 'toggleOverview'
  | 'toggleTheme'
  | 'cycleBackground'
  | 'toggleBlank'
  | 'toggleHelp'

export type BindingKind = 'next' | 'prev' | 'toggle'

export interface Binding {
  kind: BindingKind
  caps: KeyCap[]
  action: string
  /** Действие для kind === 'toggle' */
  toggle?: ToggleName
  /** Показывать в подсказке внизу экрана */
  short?: boolean
  /** Короткая подпись для подсказки внизу экрана */
  shortLabel?: string
}

export const BINDINGS: Binding[] = [
  {
    kind: 'next',
    action: 'Следующий слайд',
    short: true,
    shortLabel: 'вперёд',
    caps: [
      { code: 'Space', key: 'Пробел', shiftPrev: true },
      { code: 'ArrowRight', key: '→' },
      { code: 'ArrowDown', key: '↓' },
      { code: 'PageDown', key: 'PgDn' },
      { code: 'Enter', key: 'Enter' },
      { code: 'KeyN', key: 'N' },
      { code: 'KeyJ', key: 'J' },
    ],
  },
  {
    kind: 'prev',
    action: 'Предыдущий слайд',
    short: true,
    shortLabel: 'назад',
    caps: [
      { code: 'ArrowLeft', key: '←' },
      { code: 'ArrowUp', key: '↑' },
      { code: 'PageUp', key: 'PgUp' },
      { code: 'Backspace', key: 'Bksp' },
      { code: 'KeyP', key: 'P' },
      { code: 'KeyK', key: 'K' },
    ],
  },
  {
    kind: 'toggle',
    toggle: 'toggleOverview',
    action: 'Сетка всех слайдов',
    short: true,
    shortLabel: 'сетка',
    caps: [{ code: 'KeyO', key: 'O' }],
  },
  {
    kind: 'toggle',
    toggle: 'cycleBackground',
    action: 'Следующий фон',
    short: true,
    shortLabel: 'фон',
    caps: [{ code: 'KeyG', key: 'G' }],
  },
  {
    kind: 'toggle',
    toggle: 'toggleTheme',
    action: 'Тема: как в системе → светлая → тёмная',
    short: true,
    shortLabel: 'тема',
    caps: [{ code: 'KeyT', key: 'T' }],
  },
  {
    kind: 'toggle',
    toggle: 'toggleHelp',
    action: 'Справка по управлению',
    caps: [
      { code: 'KeyH', key: 'H' },
      { code: 'Slash', key: '?' },
    ],
  },
  {
    kind: 'toggle',
    toggle: 'toggleFullscreen',
    action: 'Полный экран',
    caps: [{ code: 'KeyF', key: 'F' }],
  },
  {
    kind: 'toggle',
    toggle: 'toggleBlank',
    action: 'Чёрный экран (пауза)',
    caps: [{ code: 'KeyB', key: 'B' }],
  },
]

/** Не привязано к раскладке: отдельные строки справки */
export const EXTRA_HELP: { caps: string[]; action: string }[] = [
  { caps: ['Shift + Пробел'], action: 'Предыдущий слайд' },
  { caps: ['Home'], action: 'Первый слайд' },
  { caps: ['End'], action: 'Последний слайд' },
  { caps: ['1 … 16, Enter'], action: 'Переход на слайд по номеру' },
  { caps: ['Esc'], action: 'Закрыть панель, а если панелей нет — выйти из полного экрана' },
]

export const LAYOUT_NOTE =
  'Подписи клавиш указаны в латинской раскладке. ' +
  'Сочетания при этом работают в любой раскладке — важна физическая клавиша, а не напечатанная буква.'

// --- Производные наборы для обработчика клавиш ---

export const NEXT_CODES = new Set(
  BINDINGS.filter((b) => b.kind === 'next').flatMap((b) => b.caps.map((c) => c.code)),
)

export const PREV_CODES = new Set(
  BINDINGS.filter((b) => b.kind === 'prev').flatMap((b) => b.caps.map((c) => c.code)),
)

export const TOGGLE_BY_CODE = new Map<string, ToggleName>(
  BINDINGS.filter((b) => b.kind === 'toggle').flatMap((b) =>
    b.caps.map((c) => [c.code, b.toggle as ToggleName] as const),
  ),
)

/** Клавиши, у которых Shift означает «листать назад» */
export const SHIFT_PREV_CODES = new Set(
  BINDINGS.flatMap((b) => b.caps.filter((c) => c.shiftPrev).map((c) => c.code)),
)

/** Цифры: основная и цифровая клавиатура, независимо от раскладки */
export const DIGIT_RE = /^(?:Digit|Numpad)([0-9])$/

/** Подсказка внизу экрана: только помеченные строки */
export const HINT_ROWS = BINDINGS.filter((b) => b.short)
