import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  airBandClasses,
  hikeClasses,
} from './mockData'
import {
  defaultLocationKey,
  locations,
  type AirBand,
  type DashboardErrorPayload,
  type DashboardPayload,
  type HikeCueTone,
  type LocationKey,
  type Severity,
} from './shared/dashboard.ts'
import {
  DASHBOARD_CACHE_TTL_MINUTES,
  readDashboardCache,
  writeDashboardCache,
} from './lib/dashboardCache.ts'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        color: '#334155',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      padding: 12,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
        font: {
          family: 'Manrope',
          weight: 700,
        },
      },
    },
    temp: {
      type: 'linear',
      position: 'left',
      ticks: {
        color: '#64748b',
        callback: (value) => `${value}\u00B0`,
        font: {
          family: 'Manrope',
          weight: 600,
        },
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.18)',
      },
      border: {
        display: false,
      },
    },
    rain: {
      type: 'linear',
      position: 'right',
      min: 0,
      max: 100,
      ticks: {
        color: '#64748b',
        callback: (value) => `${value}%`,
        font: {
          family: 'Manrope',
          weight: 600,
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
}

type ClientCacheStatus = 'miss' | 'fresh' | 'network' | 'stale'

type ClientCacheInfo = {
  status: ClientCacheStatus
  savedAt: string | null
}

function statusCopy(airBand: AirBand) {
  if (airBand === 'Good') return 'Air feels comfortable for most outdoor plans.'
  if (airBand === 'Moderate') return 'Still manageable, but keep longer exposure lighter.'
  return 'Air quality is not ideal for strenuous outdoor activity.'
}

function sourceLabel(source: DashboardPayload['meta']['source'] | undefined) {
  if (source === 'live') return 'Live API'
  if (source === 'hybrid') return 'Hybrid API'
  return 'Mock API'
}

function isDashboardErrorPayload(
  value: DashboardPayload | DashboardErrorPayload,
): value is DashboardErrorPayload {
  return 'error' in value
}

function weatherAccent(summary: string) {
  const lowered = summary.toLowerCase()

  if (lowered.includes('thunder') || lowered.includes('storm')) {
    return 'Storm build-up later'
  }

  if (lowered.includes('rain')) {
    return 'Rain arrives later'
  }

  if (lowered.includes('cloud')) {
    return 'Bright cloud cover'
  }

  return 'Soft tropical conditions'
}

function cacheStatusLabel(status: ClientCacheStatus) {
  if (status === 'fresh') return 'Local cache'
  if (status === 'network') return 'Fresh fetch'
  if (status === 'stale') return 'Stale fallback'
  return 'No cache'
}

function cacheStatusClasses(status: ClientCacheStatus) {
  if (status === 'fresh') {
    return 'border-white/40 bg-sky-500/12 text-sky-700'
  }

  if (status === 'network') {
    return 'border-white/40 bg-blue-500/12 text-blue-700'
  }

  if (status === 'stale') {
    return 'border-white/40 bg-amber-400/12 text-amber-700'
  }

  return 'border-white/40 bg-white/45 text-slate-600'
}

function hikeCueClasses(tone: HikeCueTone) {
  if (tone === 'positive') {
    return 'border-white/45 bg-sky-500/18 text-sky-700'
  }

  if (tone === 'caution') {
    return 'border-white/45 bg-amber-400/18 text-amber-700'
  }

  if (tone === 'danger') {
    return 'border-white/45 bg-rose-400/18 text-rose-700'
  }

  return 'border-white/45 bg-white/45 text-slate-600'
}

function warningToneClasses(severity: Severity) {
  if (severity === 'Alert') {
    return 'border-rose-200/70 bg-rose-100/45 text-rose-800'
  }

  if (severity === 'Watch') {
    return 'border-amber-200/70 bg-amber-100/45 text-amber-800'
  }

  return 'border-sky-200/70 bg-sky-100/45 text-sky-800'
}

function resolveCurrentTemp(payload: DashboardPayload) {
  if (typeof payload.snapshot.currentTemp === 'number') {
    return payload.snapshot.currentTemp
  }

  const today = payload.snapshot.forecast[0]

  if (!today) {
    return 28
  }

  return Math.round((today.high + today.low) / 2)
}

function formatForecastLabel(date: string) {
  return dayjs(date).format('ddd')
}

function WeatherIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" aria-hidden="true">
      <circle cx="19" cy="18" r="7" fill="currentColor" fillOpacity="0.95" />
      <path
        d="M14 30.5C14 26.91 16.91 24 20.5 24C22.28 24 23.89 24.71 25.06 25.86C26.07 23.57 28.36 22 31 22C34.87 22 38 25.13 38 29C38 29.52 37.94 30.03 37.83 30.52C39.11 31.26 40 32.64 40 34.23C40 36.59 38.09 38.5 35.73 38.5H18.5C16.01 38.5 14 36.49 14 34V30.5Z"
        fill="currentColor"
        fillOpacity="0.42"
      />
    </svg>
  )
}

function DropIcon() {
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

function TrailIcon() {
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

function AlertIcon() {
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

function RefreshIcon() {
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

function ChartIcon() {
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

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>(defaultLocationKey)
  const [requestVersion, setRequestVersion] = useState(0)
  const [payload, setPayload] = useState<DashboardPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheInfo, setCacheInfo] = useState<ClientCacheInfo>({
    status: 'miss',
    savedAt: null,
  })
  const forceRefreshRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadDashboard() {
      const shouldBypassCache = forceRefreshRef.current
      forceRefreshRef.current = false
      const cachedDashboard = readDashboardCache(selectedLocation)

      if (!shouldBypassCache && cachedDashboard?.isFresh) {
        setPayload(cachedDashboard.payload)
        setError(null)
        setIsLoading(false)
        setCacheInfo({
          status: 'fresh',
          savedAt: cachedDashboard.savedAt,
        })
        return
      }

      if (cachedDashboard) {
        setPayload(cachedDashboard.payload)
        setCacheInfo({
          status: 'stale',
          savedAt: cachedDashboard.savedAt,
        })
      } else {
        setCacheInfo({
          status: 'miss',
          savedAt: null,
        })
        setPayload((currentPayload) =>
          currentPayload?.locationKey === selectedLocation ? currentPayload : null,
        )
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/dashboard?location=${encodeURIComponent(selectedLocation)}`,
          {
            headers: {
              Accept: 'application/json',
            },
            signal: controller.signal,
          },
        )

        const data = (await response.json()) as DashboardPayload | DashboardErrorPayload

        if (!response.ok || isDashboardErrorPayload(data)) {
          const message = isDashboardErrorPayload(data)
            ? data.error.message
            : 'Dashboard request failed.'

          throw new Error(message)
        }

        setPayload(data)
        const cachedRecord = writeDashboardCache(selectedLocation, data)
        setCacheInfo({
          status: 'network',
          savedAt: cachedRecord?.savedAt ?? new Date().toISOString(),
        })
      } catch (loadError) {
        if (controller.signal.aborted) {
          return
        }

        if (cachedDashboard) {
          setPayload(cachedDashboard.payload)
          setCacheInfo({
            status: 'stale',
            savedAt: cachedDashboard.savedAt,
          })
        }

        if (loadError instanceof Error) {
          setError(loadError.message)
          return
        }

        setError('Something went wrong while loading dashboard data.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      controller.abort()
    }
  }, [selectedLocation, requestVersion])

  function retryFetch() {
    forceRefreshRef.current = true
    setRequestVersion((version) => version + 1)
  }

  const activeLocations = payload?.locations ?? locations

  if (!payload && isLoading) {
    return (
      <div className="page-shell">
        <div className="page-grid mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="glass-panel mx-auto w-full max-w-4xl p-8 text-center sm:p-10">
            <span className="glass-chip text-xs uppercase tracking-[0.28em] text-sky-700">
              Weather Dashboard
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Loading Tapah&apos;s weather lens...
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Pulling the shared dashboard response now so the glassmorphism layout can hydrate
              with live weather, air quality, and hiking guidance.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="glass-panel min-h-[18rem] animate-pulse bg-white/35 p-6" />
              <div className="glass-panel min-h-[18rem] animate-pulse bg-white/35 p-6" />
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (!payload) {
    return (
      <div className="page-shell">
        <div className="page-grid mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="glass-panel p-8 text-center sm:p-10">
            <span className="glass-chip text-xs uppercase tracking-[0.28em] text-sky-700">
              Dashboard Error
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              The interface loaded, but the first weather response did not.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {error ?? 'No dashboard payload is available yet.'}
            </p>
            <button type="button" onClick={retryFetch} className="primary-button mt-8">
              <RefreshIcon />
              Try again
            </button>
          </section>
        </div>
      </div>
    )
  }

  const { meta, snapshot } = payload
  const today = snapshot.forecast[0]
  const heroTemperature = resolveCurrentTemp(payload)
  const hikeCues = Array.isArray(snapshot.hikeTip.cues) ? snapshot.hikeTip.cues : []
  const forecastDays = snapshot.forecast.slice(0, 5)
  const warningCountLabel =
    snapshot.warnings.length === 1
      ? '1 active warning'
      : `${snapshot.warnings.length} active warnings`
  const selectedLocationLabel =
    activeLocations.find((location) => location.key === selectedLocation)?.label ?? snapshot.label

  const forecastChartData = {
    labels: forecastDays.map((day) => formatForecastLabel(day.date)),
    datasets: [
      {
        label: 'High',
        data: forecastDays.map((day) => day.high),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.14)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.38,
        yAxisID: 'temp',
      },
      {
        label: 'Low',
        data: forecastDays.map((day) => day.low),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.08)',
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.34,
        yAxisID: 'temp',
      },
      {
        label: 'Rain %',
        data: forecastDays.map((day) => day.rainChance),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.28,
        yAxisID: 'rain',
      },
    ],
  }

  return (
    <div className="page-shell">
      <div className="page-grid mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700/85">
              Perak Weather + API Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Glassmorphism weather briefing
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              A soft live dashboard for haze, rain timing, and whether today still feels like a
              real outdoor window.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="glass-chip text-sm font-semibold text-slate-600">
              {sourceLabel(meta.source)}
            </span>
            <span className={`glass-chip text-sm font-semibold ${cacheStatusClasses(cacheInfo.status)}`}>
              {cacheStatusLabel(cacheInfo.status)}
            </span>
            <button type="button" onClick={retryFetch} className="primary-button">
              <RefreshIcon />
              Refresh
            </button>
          </div>
        </header>

        {error ? (
          <div className="glass-panel mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                Last fetch warning
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">{error}</p>
            </div>
            <button type="button" onClick={retryFetch} className="secondary-button">
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-3">
          {activeLocations.map((location) => {
            const isActive = location.key === selectedLocation

            return (
              <button
                key={location.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedLocation(location.key)}
                className={`location-pill ${
                  isActive ? 'location-pill-active' : 'location-pill-idle'
                }`}
              >
                {location.label}
              </button>
            )
          })}
        </div>

        <main className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="glass-panel overflow-hidden p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="glass-chip text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                    {selectedLocationLabel}, Perak
                  </span>
                  <span className="glass-chip text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                    {dayjs(meta.servedAt).format('ddd, D MMM - h:mm A')}
                  </span>
                </div>

                <div className="mt-7 flex items-start gap-5">
                  <div className="accent-orb hidden sm:flex">
                    <WeatherIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700/80">
                      {weatherAccent(today?.summary ?? 'Clear conditions')}
                    </p>
                    <div className="mt-3 flex items-start gap-3">
                      <span className="temperature-display text-sky-600">
                        {heroTemperature}
                        {'\u00B0'}
                      </span>
                      <div className="pt-4">
                        <p className="text-lg font-semibold text-slate-900">
                          {today?.summary ?? 'Bright tropical weather'}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {snapshot.overview}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {hikeCues.map((cue) => (
                    <span
                      key={cue.label}
                      className={`glass-chip text-xs font-semibold uppercase tracking-[0.16em] ${hikeCueClasses(cue.tone)}`}
                    >
                      {cue.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-inner-panel">
                <div className="flex items-center gap-3 text-sky-600">
                  <span className="icon-pill">
                    <TrailIcon />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                      Hiking Outlook
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {snapshot.hikeTip.target}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className={`glass-chip px-4 py-2 text-sm font-bold ${hikeClasses[snapshot.hikeTip.verdict]}`}>
                    {snapshot.hikeTip.verdict}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    Confidence {snapshot.hikeTip.confidence}%
                  </span>
                </div>

                <p className="mt-5 text-lg font-semibold text-slate-900">{snapshot.hikeTip.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{snapshot.hikeTip.reason}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="glass-widget">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                      Air Quality
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">AQI {snapshot.aqi}</p>
                  </div>
                  <span className="icon-pill">
                    <WeatherIcon />
                  </span>
                </div>
                <span className={`mt-4 inline-flex rounded-2xl px-3 py-1 text-sm font-semibold ${airBandClasses[snapshot.airBand]}`}>
                  {snapshot.airBand}
                </span>
                <p className="mt-4 text-sm leading-7 text-slate-600">{statusCopy(snapshot.airBand)}</p>
              </article>

              <article className="glass-widget">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                      Rain Window
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{snapshot.nextRainWindow}</p>
                  </div>
                  <span className="icon-pill">
                    <DropIcon />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Today&apos;s forecast is anchored by {today?.rainChance ?? 0}% rain probability and a
                  humidity level around {today?.humidity ?? 0}%.
                </p>
              </article>

              <article className="glass-widget">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                      Warnings
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{warningCountLabel}</p>
                  </div>
                  <span className="icon-pill">
                    <AlertIcon />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {snapshot.warnings[0]?.title ?? 'No location-specific warning is active right now.'}
                </p>
              </article>
            </div>
          </section>

          <aside className="glass-panel p-6">
            <div className="flex items-center gap-3">
              <span className="icon-pill">
                <WeatherIcon />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                  5-Day Forecast
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {selectedLocationLabel} outlook
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {forecastDays.map((day, index) => (
                <article key={`${day.date}-${index}`} className="forecast-sidebar-item">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700/85">
                        {dayjs(day.date).format('ddd')}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {dayjs(day.date).format('D MMM')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-slate-900">
                        {day.high}
                        {'\u00B0'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {day.low}
                        {'\u00B0'} low
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>{day.summary}</span>
                    <span className="font-semibold text-sky-700">{day.rainChance}%</span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-white/55">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                      style={{ width: `${Math.min(day.rainChance, 100)}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </main>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_0.82fr]">
          <article className="glass-panel p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3 text-sky-600">
                  <span className="icon-pill">
                    <ChartIcon />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                      Forecast Trend
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      Temperature and rain over the next five days
                    </h2>
                  </div>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-7 text-slate-600">
                This restores the charting signal in the portfolio while keeping the new glass layout
                intact.
              </p>
            </div>

            <div className="mt-6 h-[320px] rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-xl sm:p-5">
              <Line data={forecastChartData} options={chartOptions} />
            </div>
          </article>

          <article className="glass-panel p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 text-sky-600">
                  <span className="icon-pill">
                    <AlertIcon />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                      Warning Feed
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      Live warning detail
                    </h2>
                  </div>
                </div>
              </div>
              <span className="glass-chip text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                {warningCountLabel}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {snapshot.warnings.length === 0 ? (
                <div className="forecast-sidebar-item">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700/80">
                    Clear warning state
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    No location-specific warning is active for {selectedLocationLabel} right now.
                  </p>
                </div>
              ) : (
                snapshot.warnings.map((warning) => (
                  <article
                    key={`${warning.title}-${warning.window}`}
                    className={`forecast-sidebar-item border ${warningToneClasses(warning.severity)}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-semibold">{warning.title}</p>
                      <span className="glass-chip text-xs font-semibold uppercase tracking-[0.16em]">
                        {warning.severity}
                      </span>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-current/70">
                      {warning.window}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-current/85">{warning.message}</p>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>

        <footer className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.22em] text-sky-700/75">
          Served at {dayjs(meta.servedAt).format('h:mm:ss A')} - cache TTL {meta.cacheTtlMinutes}
          {' '}minutes - local cache {DASHBOARD_CACHE_TTL_MINUTES} minutes
        </footer>
      </div>
    </div>
  )
}

export default App
