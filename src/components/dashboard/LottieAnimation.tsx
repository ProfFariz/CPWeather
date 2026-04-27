import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'

type LottieAnimationProps = {
  ariaLabel: string
  description: string
  className?: string
  loadAnimationData: () => Promise<{ default: object }>
}

export function LottieAnimation({
  ariaLabel,
  description,
  className,
  loadAnimationData,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animation: AnimationItem | null = null
    let isMounted = true

    void Promise.all([
      import('lottie-web/build/player/lottie_light'),
      loadAnimationData(),
    ]).then(([{ default: lottie }, { default: animationData }]) => {
      if (!isMounted) {
        return
      }

      animation = lottie.loadAnimation({
        animationData,
        autoplay: !shouldReduceMotion,
        container,
        loop: !shouldReduceMotion,
        renderer: 'svg',
        rendererSettings: {
          description,
          focusable: false,
          preserveAspectRatio: 'xMidYMid meet',
          progressiveLoad: true,
          title: ariaLabel,
        },
      })

      if (shouldReduceMotion) {
        animation.goToAndStop(0, true)
      }
    })

    return () => {
      isMounted = false
      animation?.destroy()
    }
  }, [ariaLabel, description, loadAnimationData])

  return <div ref={containerRef} aria-label={ariaLabel} className={className} role="img" />
}
