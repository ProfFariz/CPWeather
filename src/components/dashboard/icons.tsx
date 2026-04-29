type IconProps = {
  className?: string
}

export function WeatherIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`h-7 w-7 ${className}`.trim()}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="19"
        cy="18"
        r="7"
        className="weather-icon-sun"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <path
        d="M14 30.5C14 26.91 16.91 24 20.5 24C22.28 24 23.89 24.71 25.06 25.86C26.07 23.57 28.36 22 31 22C34.87 22 38 25.13 38 29C38 29.52 37.94 30.03 37.83 30.52C39.11 31.26 40 32.64 40 34.23C40 36.59 38.09 38.5 35.73 38.5H18.5C16.01 38.5 14 36.49 14 34V30.5Z"
        className="weather-icon-cloud"
        fill="currentColor"
        fillOpacity="0.42"
      />
    </svg>
  )
}

export function BrandWeatherLogo({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`brand-weather-logo h-9 w-9 ${className}`.trim()}
      fill="none"
      aria-hidden="true"
    >
      <circle className="brand-logo-atmosphere" cx="32" cy="32" r="27" />
      <path
        className="brand-logo-orbit"
        d="M12.5 35.5C16 20.8 28.7 11.9 41.8 15.3C52.8 18.1 58.4 29 54.2 39.1C49.6 50.2 35 55.3 22.5 49.6C13.6 45.5 9.2 39.6 12.5 35.5Z"
      />
      <g className="brand-logo-sun">
        <circle cx="22" cy="22" r="7.5" />
        <path d="M22 9.5V13" />
        <path d="M22 31V34.5" />
        <path d="M9.5 22H13" />
        <path d="M31 22H34.5" />
        <path d="M13.2 13.2L15.7 15.7" />
        <path d="M28.3 28.3L30.8 30.8" />
      </g>
      <g className="brand-logo-cloud">
        <path d="M19.5 41.2C17.1 41.2 15.2 39.3 15.2 36.9C15.2 34.7 16.8 32.9 19 32.6C19.9 28 23.9 24.6 28.7 24.6C32.6 24.6 36 26.9 37.5 30.2C38.6 29.7 39.8 29.5 41.1 29.5C46.1 29.5 50.2 33.6 50.2 38.6C50.2 39.5 50.1 40.4 49.8 41.2H19.5Z" />
        <path d="M21 41.2H48.3" />
      </g>
      <g className="brand-logo-rain">
        <path d="M26 46.5L23.5 53" />
        <path d="M34 46.5L31.5 53" />
        <path d="M42 46.5L39.5 53" />
      </g>
      <g className="brand-logo-signal">
        <path d="M46.5 15.5C50 17.5 52.5 20.9 53.1 24.8" />
        <circle cx="54" cy="29" r="1.6" />
      </g>
    </svg>
  )
}

export function BrandWordmark({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 248 50"
      className={`brand-wordmark ${className}`.trim()}
      role="img"
      aria-label="CPWeather"
    >
      <defs>
        <linearGradient id="brand-wordmark-text" x1="0" y1="0" x2="248" y2="0">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="48%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
        <linearGradient id="brand-wordmark-sheen" x1="-40" y1="0" x2="48" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="48%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      <g className="brand-wordmark-weather" aria-hidden="true">
        <circle className="brand-wordmark-sun" cx="18" cy="15" r="6.5" />
        <path
          className="brand-wordmark-cloud"
          d="M12 34.5C9.2 34.5 7 32.3 7 29.6C7 27.2 8.8 25.1 11.1 24.7C12.1 19.8 16.4 16.2 21.5 16.2C25.5 16.2 29 18.4 30.8 21.7C31.9 21.3 33.1 21.1 34.4 21.1C39.8 21.1 44.1 25.4 44.1 30.8C44.1 32.1 43.9 33.3 43.4 34.5H12Z"
        />
        <path className="brand-wordmark-rain" d="M18 39L16.5 43.5" />
        <path className="brand-wordmark-rain" d="M29 39L27.5 43.5" />
        <path className="brand-wordmark-rain" d="M40 39L38.5 43.5" />
      </g>

      <text className="brand-wordmark-text" x="55" y="34">
        CPWeather
      </text>
      <rect className="brand-wordmark-sheen" x="-64" y="5" width="42" height="34" rx="17" />
      <path className="brand-wordmark-underline" d="M57 42C95 47 164 47 225 42" />
    </svg>
  )
}

export function ThermometerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M14 14.76V5.5A2.5 2.5 0 0 0 9 5.5v9.26a4.5 4.5 0 1 0 5 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 11.5V18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="18" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function SkyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3.2" fill="currentColor" fillOpacity="0.92" />
      <path
        d="M7 17.5C7 15.57 8.57 14 10.5 14c.96 0 1.83.38 2.45 1.01A4.02 4.02 0 0 1 15.9 14C18.16 14 20 15.84 20 18.1c0 .3-.03.59-.09.87"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18.5h12.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AirIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 9h10a2.5 2.5 0 1 0-2.38-3.24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 13h15a2 2 0 1 1-1.82 2.83"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 17h8.5a2.5 2.5 0 1 1-2.4 3.18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RiskIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3.2V11c0 4.45-2.76 8.5-7 10-4.24-1.5-7-5.55-7-10V6.2L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v4.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15.6" r="1" fill="currentColor" />
    </svg>
  )
}

export function DropIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M24 8C24 8 14 20.2 14 28C14 33.52 18.48 38 24 38C29.52 38 34 33.52 34 28C34 20.2 24 8 24 8Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
    </svg>
  )
}

export function TrailIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M14 36C17.5 30 22.5 26 29 23"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="15" r="4" fill="currentColor" />
      <path
        d="M20 20L24 27L18 34"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 23L31 19L35 24"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AlertIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M24 10L38 35H10L24 10Z"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path
        d="M24 18V27"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="32" r="2" fill="white" />
    </svg>
  )
}

export function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M20 12A8 8 0 1 1 17.66 6.34"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M20 4V10H14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 18L9 13L13 15L20 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 11V7H16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function LocationPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 21c4.5-4.8 6.5-8 6.5-10.7A6.5 6.5 0 1 0 5.5 10.3C5.5 13 7.5 16.2 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  )
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 7.5V12l3.1 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M6.5 12.5l3.4 3.4 7.6-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
