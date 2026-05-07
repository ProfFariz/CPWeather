import { useCallback, useEffect } from 'react'

export function CursorGlow() {
  const updateCursorPosition = useCallback((event: MouseEvent) => {
    const x = `${(event.clientX / window.innerWidth) * 100}%`
    const y = `${(event.clientY / window.innerHeight) * 100}%`
    document.documentElement.style.setProperty('--mx', x)
    document.documentElement.style.setProperty('--my', y)
  }, [])

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isTouchDevice || prefersReducedMotion) {
      return
    }

    let ticking = false

    function handleMouseMove(event: MouseEvent) {
      if (ticking) {
        return
      }

      ticking = true

      requestAnimationFrame(() => {
        updateCursorPosition(event)
        ticking = false
      })
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [updateCursorPosition])

  return <div aria-hidden="true" className="cursor-glow" />
}
