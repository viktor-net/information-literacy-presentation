import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HINT_ROWS } from './deck.keys'
import { slides } from './slides/content'
import { useDeck } from './hooks/useDeck'
import { useTheme } from './hooks/useTheme'
import { useBackground } from './hooks/useBackground'
import { useFullscreen } from './hooks/useFullscreen'
import { useRemoteControl } from './hooks/useRemoteControl'
import { ASPECT, ScaledSlide, useElementSize } from './components/ScaledSlide'
import { Overview } from './components/Overview'
import { HelpOverlay } from './components/HelpOverlay'
import { Toolbar } from './components/Toolbar'
import { Scrubber } from './components/Scrubber'
import { NavContext } from './nav'

const WHEEL_LOCK_MS = 450
const SWIPE_MIN = 50

export default function App() {
  const deck = useDeck(slides.length)
  const { pref: themePref, theme: theme, label: themeLabel, cycle: toggleTheme } = useTheme()
  const { name: bgName, bg, cycle: cycleBackground, select: selectBackground } = useBackground()
  const {
    isFullscreen,
    toggle: toggleFullscreen,
    exit: exitFullscreen,
    supported: fullscreenSupported,
  } = useFullscreen()

  const [overview, setOverview] = useState(false)
  const [help, setHelp] = useState(false)
  const [blank, setBlank] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const flash = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(null), 1400)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  // Перемотка ползунком: помечаем момент, чтобы случайный
  // двойной щелчк в конце перетаскивания не включил полный экран
  const scrubbedAt = useRef(0)
  const handleScrub = useCallback(
    (i: number) => {
      scrubbedAt.current = Date.now()
      deck.go(i)
    },
    [deck],
  )
  const stageDoubleClick = useCallback(() => {
    if (Date.now() - scrubbedAt.current < 400) return
    toggleFullscreen()
  }, [toggleFullscreen])

  // Показываем название фона после переключения
  const bgSeen = useRef(bgName)
  useEffect(() => {
    if (bgName === bgSeen.current) return
    bgSeen.current = bgName
    flash(`Фон: ${bgName}`)
  }, [bgName, flash])

  const { ref: appRef, size } = useElementSize<HTMLDivElement>()
  const toggleOverview = useCallback(() => {
    setOverview((v) => {
      setHelp(false)
      setBlank(false)
      return !v
    })
  }, [])

  const toggleHelp = useCallback(() => {
    setHelp((v) => {
      setOverview(false)
      setBlank(false)
      return !v
    })
  }, [])

  const toggleBlank = useCallback(() => {
    setBlank((v) => {
      setOverview(false)
      setHelp(false)
      return !v
    })
  }, [])

  const closeOverlays = useCallback(() => {
    let closed = false
    setOverview((v) => {
      if (v) closed = true
      return false
    })
    setHelp((v) => {
      if (v) closed = true
      return false
    })
    setBlank((v) => {
      if (v) closed = true
      return false
    })
    return closed
  }, [])

  const hasOverlay = useCallback(() => overview || help || blank, [overview, help, blank])

  const isFs = useCallback(() => isFullscreen, [isFullscreen])

  const actions = useMemo(
    () => ({
      next: deck.next,
      prev: deck.prev,
      go: deck.go,
      first: deck.first,
      last: deck.last,
      toggleFullscreen,
      exitFullscreen,
      toggleOverview,
      toggleTheme,
      cycleBackground,
      toggleHelp,
      toggleBlank,
      closeOverlays,
      hasOverlay,
      isFullscreen: isFs,
    }),
    [
      deck,
      toggleFullscreen,
      exitFullscreen,
      toggleOverview,
      toggleTheme,
      cycleBackground,
      toggleHelp,
      toggleBlank,
      closeOverlays,
      hasOverlay,
      isFs,
    ],
  )

  const jump = useRemoteControl(actions, slides.length)

  // --- Колесо мыши ---
  const wheelLock = useRef(0)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (overview || help || scrubbing) return
      if (Math.abs(e.deltaY) < 12 && Math.abs(e.deltaX) < 12) return
      const now = Date.now()
      if (now - wheelLock.current < WHEEL_LOCK_MS) return
      wheelLock.current = now
      const forward = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (forward > 0) deck.next()
      else deck.prev()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [deck, overview, help, scrubbing])

  // --- Свайпы ---
  const touch = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      touch.current = { x: t.clientX, y: t.clientY }
    }
    const onEnd = (e: TouchEvent) => {
      const start = touch.current
      touch.current = null
      if (!start || overview || help || scrubbing) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) < SWIPE_MIN) return
        if (dx < 0) deck.next()
        else deck.prev()
      } else if (Math.abs(dy) > SWIPE_MIN) {
        if (dy < 0) deck.next()
        else deck.prev()
      }
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [deck, overview, help, scrubbing])

  // Масштаб слайда под фактический размер контейнера
  const pad = size.width < 700 ? 8 : 28
  const availW = size.width - pad * 2
  const availH = size.height - pad * 2 - 44
  const stageW = Math.max(Math.min(availW, availH * ASPECT), 200)

  // Куда ведут пункты плана: разделы по порядку, последним — выводы
  const planTargets = useMemo(() => {
    const sections = slides
      .map((s, i) => (s.layout === 'section' ? i : -1))
      .filter((i) => i >= 0)
    const conclusions = slides.findIndex((s) => s.title.trim() === 'Выводы')
    return [...sections, conclusions >= 0 ? conclusions : slides.length - 1]
  }, [])

  const navValue = useMemo(
    () => ({ planTargets, go: deck.go }),
    [planTargets, deck.go],
  )

  const current = slides[deck.index]  // Подпись слева внизу: у слайда своя, иначе название слайда
  const footNote =
    'foot' in current && current.foot
      ? current.foot
      : current.title.replace(/\n/g, ' ')

  return (
    <div className={`app${blank ? ' is-blank' : ''}`} ref={appRef}>
      <Scrubber
        index={deck.index}
        count={slides.length}
        onScrub={handleScrub}
        onScrubbing={setScrubbing}
      />

      <main className="app__stage" onDoubleClick={stageDoubleClick}>
        <NavContext.Provider value={navValue}>
          <ScaledSlide slide={current} width={stageW} className="stage__slide" />
        </NavContext.Provider>

        {isFullscreen && !overview && !help && (
          <>
            <button
              type="button"
              className="zone zone--prev"
              onClick={deck.prev}
              aria-label="Предыдущий слайд"
            />
            <button
              type="button"
              className="zone zone--next"
              onClick={deck.next}
              aria-label="Следующий слайд"
            />
          </>
        )}
      </main>

      {jump && (
        <div className="jump" role="status">
          <span className="jump__label">Слайд</span>
          <span className="jump__num">{jump}</span>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <div className="app__foot">
        <span className="app__title">{footNote}</span>
        <div className="hint">
          {HINT_ROWS.map((row) => (
            <span key={row.caps[0].code} className="hint__item">
              <kbd>{row.caps[0].key}</kbd>
              <span>{row.shortLabel}</span>
            </span>
          ))}
          <span className="hint__item">
            <kbd>H</kbd>
            <span>справка</span>
          </span>
        </div>
        <Toolbar
          index={deck.index}
          count={slides.length}
        themeLabel={themeLabel}
        themePref={themePref}
        theme={theme}
          bgId={bg}
          isFullscreen={isFullscreen}
          fullscreenSupported={fullscreenSupported}
          overviewOpen={overview}
          onPrev={deck.prev}
          onNext={deck.next}
          onOverview={toggleOverview}
          onTheme={toggleTheme}
          onSelectBg={selectBackground}
          onFullscreen={toggleFullscreen}
          onHelp={toggleHelp}
        />
      </div>

      {overview && (
        <Overview
          slides={slides}
          current={deck.index}
          width={Math.min(size.width - 60, 1500)}
          height={size.height}
          onSelect={(i) => {
            deck.go(i)
            setOverview(false)
          }}
          onClose={() => setOverview(false)}
        />
      )}

      {help && <HelpOverlay onClose={() => setHelp(false)} />}

      <span className="sr-only" aria-live="polite">
        Слайд {deck.index + 1} из {slides.length}: {current.title.replace(/\n/g, ' ')}
      </span>
    </div>
  )
}
