import { useCallback, useEffect, useState } from 'react'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

interface FullscreenApi {
  request: () => Promise<void>
  exit: () => Promise<void>
  enabled: boolean
}

function activeElement(): Element | null {
  const doc = document as FullscreenDocument
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

function getApi(): FullscreenApi | null {
  const doc = document as FullscreenDocument
  const el = document.documentElement

  if (el.requestFullscreen && doc.fullscreenEnabled) {
    return {
      request: () => el.requestFullscreen(),
      exit: () => doc.exitFullscreen(),
      enabled: true,
    }
  }
  const wex = el as FullscreenElement
  if (wex.webkitRequestFullscreen) {
    return {
      request: () => wex.webkitRequestFullscreen!(),
      exit: () => doc.webkitExitFullscreen?.() ?? Promise.reject(),
      enabled: true,
    }
  }
  return null
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => activeElement() !== null)

  useEffect(() => {
    const onChange = () => setIsFullscreen(activeElement() !== null)
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const exit = useCallback(() => {
    if (!activeElement()) return
    const api = getApi()
    api?.exit().catch(() => undefined)
  }, [])

  const toggle = useCallback(() => {
    const api = getApi()
    if (!api?.enabled) return
    if (activeElement()) {
      api.exit().catch(() => undefined)
    } else {
      api.request().catch(() => undefined)
    }
  }, [])

  return { isFullscreen, toggle, exit, supported: getApi()?.enabled ?? false }
}
