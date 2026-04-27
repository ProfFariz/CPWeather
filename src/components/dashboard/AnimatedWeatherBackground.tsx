export function AnimatedWeatherBackground() {
  return (
    <svg
      aria-hidden="true"
      className="weather-background-svg"
      focusable="false"
      viewBox="0 0 1200 760"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="weather-background-grid">
        <path d="M80 120H1120" />
        <path d="M80 240H1120" />
        <path d="M80 360H1120" />
        <path d="M80 480H1120" />
        <path d="M80 600H1120" />
        <path d="M180 70V690" />
        <path d="M360 70V690" />
        <path d="M540 70V690" />
        <path d="M720 70V690" />
        <path d="M900 70V690" />
        <path d="M1080 70V690" />
      </g>

      <g className="weather-background-isobars">
        <path d="M130 520C230 420 320 410 430 470C540 530 650 525 760 430C870 335 980 315 1090 390" />
        <path d="M70 360C190 270 290 260 405 315C520 370 640 360 735 285C840 202 970 196 1130 270" />
        <path d="M160 680C300 610 430 625 540 670C650 715 780 700 900 620C995 556 1075 548 1170 580" />
      </g>

      <g className="weather-background-markers">
        <rect height="46" width="46" x="134" y="196" />
        <rect height="34" width="34" x="954" y="124" />
        <rect height="58" width="58" x="1006" y="520" />
        <circle cx="422" cy="204" r="18" />
        <circle cx="782" cy="592" r="24" />
      </g>

      <g className="weather-background-front">
        <path d="M250 170L345 170L345 265L250 265Z" />
        <path d="M884 374L1014 374L1014 504L884 504Z" />
        <path d="M515 98L600 98L600 183L515 183Z" />
      </g>
    </svg>
  )
}
