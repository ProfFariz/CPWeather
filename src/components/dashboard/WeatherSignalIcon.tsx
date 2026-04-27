type WeatherSignalIconProps = {
  className?: string
  summary: string
}

function resolveWeatherMode(summary: string) {
  const normalizedSummary = summary.toLowerCase()

  if (
    normalizedSummary.includes('rain') ||
    normalizedSummary.includes('storm') ||
    normalizedSummary.includes('shower')
  ) {
    return 'rain'
  }

  if (
    normalizedSummary.includes('cloud') ||
    normalizedSummary.includes('overcast') ||
    normalizedSummary.includes('haze')
  ) {
    return 'cloud'
  }

  return 'sun'
}

export function WeatherSignalIcon({ className = '', summary }: WeatherSignalIconProps) {
  const weatherMode = resolveWeatherMode(summary)

  return (
    <svg
      aria-hidden="true"
      className={`weather-signal-icon weather-signal-icon-${weatherMode} ${className}`}
      focusable="false"
      viewBox="0 0 180 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="weather-signal-grid">
        <path d="M40 34V146" />
        <path d="M90 34V146" />
        <path d="M140 34V146" />
        <path d="M34 54H146" />
        <path d="M34 102H146" />
        <path d="M34 146H146" />
      </g>

      <g className="weather-signal-sun">
        <circle cx="82" cy="75" r="24" />
        <path d="M82 28V44" />
        <path d="M82 106V122" />
        <path d="M35 75H51" />
        <path d="M113 75H129" />
        <path d="M49 42L60 53" />
        <path d="M104 97L115 108" />
        <path d="M115 42L104 53" />
        <path d="M60 97L49 108" />
      </g>

      <g className="weather-signal-cloud">
        <path d="M61 111H121C133 111 142 102 142 91C142 80 133 71 122 71C116 51 93 43 76 56C69 61 64 68 62 77C49 78 38 89 38 102C38 107 42 111 61 111Z" />
      </g>

      <g className="weather-signal-rain">
        <path d="M58 127L49 147" />
        <path d="M86 127L77 147" />
        <path d="M114 127L105 147" />
      </g>

      <path className="weather-signal-route" d="M32 132C58 118 84 122 108 136C126 146 140 146 153 135" />
    </svg>
  )
}
