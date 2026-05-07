type NatureDecorProps = {
  variant: 'hero-leaves' | 'sidebar-droplets' | 'hero-corner'
}

export function NatureDecor({ variant }: NatureDecorProps) {
  if (variant === 'hero-leaves') {
    return (
      <>
        {/* Monstera-style leaf top-right */}
        <svg
          aria-hidden="true"
          className="leaf-decoration leaf-decoration-top"
          width="90"
          height="100"
          viewBox="0 0 90 100"
          fill="none"
        >
          <path
            d="M70 15C55 -5 25 -8 15 10C5 28 18 45 32 52C28 38 35 22 52 18C58 16 65 20 70 15Z"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M55 8C42 -3 18 2 10 18C5 28 12 42 24 50"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M72 12C60 -6 28 -5 18 10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>

        {/* Fern/vine bottom-left */}
        <svg
          aria-hidden="true"
          className="leaf-decoration leaf-decoration-bottom"
          width="100"
          height="90"
          viewBox="0 0 100 90"
          fill="none"
        >
          <path
            d="M18 85C35 78 48 62 52 45C54 38 52 30 56 24C60 18 68 16 74 20C62 24 56 36 58 48C60 60 68 72 58 80"
            fill="currentColor"
            opacity="0.65"
          />
          <path
            d="M22 82C38 76 50 58 54 42"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        {/* Small decorative vine mid-right */}
        <svg
          aria-hidden="true"
          className="leaf-decoration leaf-decoration-mid"
          width="70"
          height="80"
          viewBox="0 0 70 80"
          fill="none"
        >
          <path
            d="M68 38C64 32 56 30 52 34C48 38 50 46 55 48C60 50 65 46 68 38Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M68 40C62 34 54 33 50 38"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </>
    )
  }

  if (variant === 'sidebar-droplets') {
    return (
      <>
        <svg
          aria-hidden="true"
          className="water-droplet water-droplet-1"
          viewBox="0 0 18 22"
          fill="none"
        >
          <path
            d="M9 2C9 2 2 11 2 15C2 18.9 5.1 22 9 22C12.9 22 16 18.9 16 15C16 11 9 2 9 2Z"
            fill="currentColor"
            fillOpacity="0.35"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <ellipse cx="7" cy="14" rx="1.5" ry="2" fill="white" fillOpacity="0.6" />
        </svg>

        <svg
          aria-hidden="true"
          className="water-droplet water-droplet-2"
          viewBox="0 0 12 16"
          fill="none"
        >
          <path
            d="M6 1C6 1 1 8 1 11C1 13.8 3.2 16 6 16C8.8 16 11 13.8 11 11C11 8 6 1 6 1Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="water-droplet water-droplet-3"
          viewBox="0 0 14 18"
          fill="none"
        >
          <path
            d="M7 1C7 1 1 9 1 13C1 15.8 3.2 18 7 18C10.8 18 13 15.8 13 13C13 9 7 1 7 1Z"
            fill="currentColor"
            fillOpacity="0.3"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />
          <ellipse cx="5.5" cy="11" rx="1" ry="1.5" fill="white" fillOpacity="0.5" />
        </svg>
      </>
    )
  }

  if (variant === 'hero-corner') {
    return (
      <svg
        aria-hidden="true"
        className="leaf-decoration leaf-decoration-top"
        width="80"
        height="90"
        viewBox="0 0 80 90"
        fill="none"
      >
        <path
          d="M65 12C52 -4 24 -3 14 14C4 31 18 48 32 55C28 40 34 22 50 17C56 15 62 18 65 12Z"
          fill="currentColor"
          opacity="0.7"
        />
        <path
          d="M68 8C56 -6 26 -2 16 15"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
    )
  }

  return null
}
