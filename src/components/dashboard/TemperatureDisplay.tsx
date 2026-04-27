import { useId } from 'react'

type TemperatureDisplayProps = {
  value: number
  className?: string
}

export function TemperatureDisplay({ value, className = '' }: TemperatureDisplayProps) {
  const titleId = useId().replace(/:/g, '')
  const roundedValue = Math.round(value)

  return (
    <svg
      viewBox="0 0 278 158"
      className={`temperature-display ${className}`.trim()}
      fill="none"
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{roundedValue} degrees Celsius</title>

      <g className="temperature-display-orbit">
        <path d="M24 96C40 35 102 8 168 26C224 41 257 82 239 119C219 161 126 167 66 139C35 125 17 111 24 96Z" />
        <path d="M42 119C73 79 129 53 191 54" />
      </g>

      <g className="temperature-display-sun">
        <circle cx="53" cy="42" r="18" />
        <path d="M53 13V22" />
        <path d="M53 62V71" />
        <path d="M24 42H33" />
        <path d="M73 42H82" />
        <path d="M32.5 21.5L39 28" />
        <path d="M67 56L73.5 62.5" />
      </g>

      <g className="temperature-display-cloud">
        <path d="M55 125C49 125 44 120 44 114C44 108.6 48 104 53.3 103.3C55.3 92 65.2 83.8 77.1 83.8C86.5 83.8 94.6 89.1 98.8 96.7C101.8 95.2 105.2 94.3 108.8 94.3C121.2 94.3 131.2 104.3 131.2 116.7C131.2 119.6 130.7 122.4 129.6 125H55Z" />
        <path d="M59 125H124" />
      </g>

      <g className="temperature-display-reading">
        <text x="138" y="112" textAnchor="middle">
          {roundedValue}
        </text>
        <text className="temperature-display-degree" x="204" y="62">
          °
        </text>
      </g>

      <g className="temperature-display-gauge">
        <path d="M235 43V95" />
        <circle cx="235" cy="113" r="13" />
        <path d="M235 94V113" />
      </g>

      <g className="temperature-display-heat-lines">
        <path d="M214 34C220 28 220 21 214 15" />
        <path d="M236 30C242 24 242 17 236 11" />
        <path d="M257 38C263 32 263 25 257 19" />
      </g>
    </svg>
  )
}
