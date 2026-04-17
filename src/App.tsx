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
  severityClasses,
} from './mockData'
import {
  locations,
  type AirBand,
  type DashboardErrorPayload,
  type DashboardPayload,
  type LocationKey,
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
        color: '#244137',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
    },
    tooltip: {
      backgroundColor: '#0f2b24',
      titleColor: '#f6f2e8',
      bodyColor: '#eef4ed',
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
        color: '#4f655c',
        font: {
          family: 'Manrope',
          weight: 700,
        },
      },
    },
    y: {
      suggestedMin: 20,
      suggestedMax: 36,
      ticks: {
        color: '#4f655c',
        callback: (value) => `${value}\u00B0`,
        font: {
          family: 'Manrope',
          weight: 600,
        },
      },
      grid: {
        color: 'rgba(79, 101, 92, 0.14)',
      },
      border: {
        display: false,
      },
    },
  },
}

function formatForecastLabel(date: string) {
  return dayjs(date).format('ddd')
}

function formatForecastDate(date: string) {
  return dayjs(date).format('D MMM')
}

function statusCopy(airBand: AirBand) {
  if (airBand === 'Good') return 'Easy day for most outdoor plans.'
  if (airBand === 'Moderate') return 'Fine for most people, but pace sensitive activities.'
  return 'Reduce long outdoor exposure where possible.'
}

function sourceLabel(source: DashboardPayload['meta']['source'] | undefined) {
  if (source === 'live') return 'Live API Data'
  if (source === 'hybrid') return 'Hybrid API Data'
  return 'Mock API Data'
}

function isDashboardErrorPayload(
  value: DashboardPayload | DashboardErrorPayload,
): value is DashboardErrorPayload {
  return 'error' in value
}

type ClientCacheStatus = 'miss' | 'fresh' | 'network' | 'stale'

type ClientCacheInfo = {
  status: ClientCacheStatus
  savedAt: string | null
}

function cacheStatusLabel(status: ClientCacheStatus) {
  if (status === 'fresh') return 'Local Cache Hit'
  if (status === 'network') return 'Fresh Network Fetch'
  if (status === 'stale') return 'Stale Cache Fallback'
  return 'No Local Cache'
}

function cacheStatusClasses(status: ClientCacheStatus) {
  if (status === 'fresh') {
    return 'border border-emerald-900/10 bg-emerald-50 text-emerald-900/75'
  }

  if (status === 'network') {
    return 'border border-sky-900/10 bg-sky-50 text-sky-900/75'
  }

  if (status === 'stale') {
    return 'border border-amber-900/10 bg-amber-50 text-amber-900/75'
  }

  return 'border border-white/70 bg-white/75 text-emerald-950/65'
}

function cacheSummary(cacheInfo: ClientCacheInfo) {
  if (!cacheInfo.savedAt) {
    return `Frontend cache TTL: ${DASHBOARD_CACHE_TTL_MINUTES} minutes.`
  }

  if (cacheInfo.status === 'fresh') {
    return `Local cache reused from ${dayjs(cacheInfo.savedAt).format('h:mm A')} with a ${DASHBOARD_CACHE_TTL_MINUTES}-minute TTL.`
  }

  if (cacheInfo.status === 'network') {
    return `Most recent response cached locally at ${dayjs(cacheInfo.savedAt).format('h:mm A')} with a ${DASHBOARD_CACHE_TTL_MINUTES}-minute TTL.`
  }

  if (cacheInfo.status === 'stale') {
    return `Using cached data saved at ${dayjs(cacheInfo.savedAt).format('h:mm A')} while waiting for a newer response.`
  }

  return `Frontend cache TTL: ${DASHBOARD_CACHE_TTL_MINUTES} minutes.`
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>('ipoh')
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
      <div className="relative min-h-screen overflow-hidden text-[#17352d]">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="panel w-full max-w-3xl p-8 text-center sm:p-10">
            <p className="subtle-label">Booting Dashboard</p>
            <h1 className="display-face mt-4 text-4xl text-[#102820] sm:text-5xl">
              Pulling the first dashboard response...
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-950/70 sm:text-base">
              We are loading the shared `/api/dashboard` contract now so the UI can stop depending
              on local mock imports.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {activeLocations.map((location) => (
                <div key={location.key} className="value-card h-24 animate-pulse bg-white/55" />
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (!payload) {
    return (
      <div className="relative min-h-screen overflow-hidden text-[#17352d]">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <section className="panel w-full max-w-3xl p-8 text-center sm:p-10">
            <p className="subtle-label">Dashboard Error</p>
            <h1 className="display-face mt-4 text-4xl text-[#102820] sm:text-5xl">
              The API contract is wired, but the first fetch did not land.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-950/70 sm:text-base">
              {error ?? 'No dashboard payload is available yet.'}
            </p>
            <button
              type="button"
              onClick={retryFetch}
              className="action-button mt-8"
            >
              Try again
            </button>
          </section>
        </div>
      </div>
    )
  }

  const { meta, snapshot } = payload

  const tempChartData = {
    labels: snapshot.forecast.map((day) => formatForecastLabel(day.date)),
    datasets: [
      {
        label: 'Day High',
        data: snapshot.forecast.map((day) => day.high),
        borderColor: '#14532d',
        backgroundColor: 'rgba(20, 83, 45, 0.16)',
        pointBackgroundColor: '#14532d',
        pointBorderColor: '#f8f5eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Night Low',
        data: snapshot.forecast.map((day) => day.low),
        borderColor: '#d5a03d',
        backgroundColor: 'rgba(213, 160, 61, 0.12)',
        pointBackgroundColor: '#d5a03d',
        pointBorderColor: '#f8f5eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.35,
      },
    ],
  }

  const warningCountLabel =
    snapshot.warnings.length === 1 ? '1 active watch' : `${snapshot.warnings.length} active items`

  const isEmptyState = snapshot.forecast.length === 0

  return (
    <div className="relative min-h-screen overflow-hidden text-[#17352d]">
      <div className="aero-orb aero-orb-drift-slow aero-orb-sky pointer-events-none left-[-2.5rem] top-24 hidden h-32 w-32 lg:block" />
      <div className="aero-orb aero-orb-drift-medium aero-orb-lime pointer-events-none right-[8%] top-[7.5rem] hidden h-24 w-24 xl:block" />
      <div className="aero-orb aero-orb-drift-fast pointer-events-none bottom-24 left-[10%] hidden h-20 w-20 xl:block" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {error ? (
          <div className="panel flex flex-col gap-4 border-amber-900/10 bg-amber-50/85 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="subtle-label text-amber-900/70">Refresh Warning</p>
              <p className="mt-2 text-sm font-semibold text-amber-950">{error}</p>
              <p className="mt-1 text-sm text-amber-950/70">
                Showing the last successful dashboard response while we retry.
              </p>
            </div>
            <button
              type="button"
              onClick={retryFetch}
              className="action-button"
            >
              Retry fetch
            </button>
          </div>
        ) : null}

        <header className="panel relative overflow-hidden p-6 sm:p-7 lg:p-9">
          <div className="sharp-accent-panel ambient-cut absolute inset-y-0 right-0 hidden w-2/5 lg:block" />

          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="aero-chip chip subtle-label border border-white/70 bg-white/65 px-3 py-1">
                  Perak Weather + API Dashboard
                </span>
                <span className="aero-chip chip border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900/75">
                  {sourceLabel(meta.source)}
                </span>
                <span className={`aero-chip chip px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${cacheStatusClasses(cacheInfo.status)}`}>
                  {cacheStatusLabel(cacheInfo.status)}
                </span>
                {isLoading ? (
                  <span className="aero-chip chip border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950/65">
                    Refreshing...
                  </span>
                ) : null}
              </div>

              <div className="mt-5 max-w-3xl">
                <h1 className="display-face text-4xl leading-tight text-[#102820] sm:text-5xl lg:text-[3.55rem]">
                  Plan around haze, sudden rain, and the trips people actually take.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-950/75 sm:text-lg">
                  The layout now reads from `/api/dashboard`, and the route can now blend live
                  provider data into the shared dashboard contract whenever upstream requests
                  succeed.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-950/60">
                  {cacheSummary(cacheInfo)}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {activeLocations.map((location) => {
                  const isActive = location.key === selectedLocation

                  return (
                    <button
                      key={location.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedLocation(location.key)}
                      className={`filter-button ${
                        isActive ? 'filter-button-active' : 'filter-button-idle'
                      }`}
                    >
                      {location.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="value-card">
                  <p className="subtle-label">Current Lens</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.label}</p>
                  <p className="mt-1 text-sm text-emerald-950/65">{snapshot.district}</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Air Quality</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`aero-chip chip px-3 py-1 text-sm font-bold ${airBandClasses[snapshot.airBand]}`}>
                      AQI {snapshot.aqi}
                    </span>
                    <span className="text-sm font-semibold text-emerald-950/70">{snapshot.airBand}</span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-950/65">{statusCopy(snapshot.airBand)}</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Rain Timing</p>
                  <p className="mt-3 text-xl font-extrabold text-[#102820]">{snapshot.nextRainWindow}</p>
                  <p className="mt-2 text-sm text-emerald-950/65">{warningCountLabel}</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Cache Freshness</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">
                    {snapshot.cacheAgeMinutes} min
                  </p>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    Last refreshed {dayjs(snapshot.updatedAt).format('h:mm A')}
                  </p>
                </div>
              </div>
            </div>

            <aside className="feature-panel ambient-cut relative p-6 text-white sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/65">
                Trip Lens
              </p>
              <h2 className="display-face mt-4 text-3xl leading-tight sm:text-[2.2rem]">
                Can I hike {snapshot.hikeTip.target} today?
              </h2>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className={`aero-chip chip px-4 py-2 text-sm font-bold ${hikeClasses[snapshot.hikeTip.verdict]}`}>
                  {snapshot.hikeTip.verdict}
                </span>
                <span className="text-sm font-semibold text-white/72">
                  Confidence {snapshot.hikeTip.confidence}%
                </span>
              </div>
              <p className="mt-5 text-lg font-semibold text-white/94">{snapshot.hikeTip.title}</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/78">{snapshot.hikeTip.reason}</p>

              <div className="inset-panel mt-8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
                  Field Note
                </p>
                <p className="mt-3 text-sm leading-7 text-white/80">{snapshot.overview}</p>
              </div>
            </aside>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="panel p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="subtle-label">5-Day Forecast</p>
                <h2 className="display-face mt-2 text-3xl text-[#102820]">
                  Temperature swing for the next five days
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-emerald-950/65">
                The route prefers live aggregation now, while still falling back safely when an
                upstream provider is missing or unavailable.
              </p>
            </div>

            {isEmptyState ? (
              <div className="empty-panel mt-6 p-8 text-center">
                <p className="subtle-label">Forecast Empty</p>
                <p className="mt-3 text-lg font-semibold text-[#102820]">
                  No forecast rows were returned for this location.
                </p>
              </div>
            ) : (
              <>
                <div className="chart-shell mt-6 h-[300px] p-4 sm:p-5">
                  <Line data={tempChartData} options={chartOptions} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                  {snapshot.forecast.map((day) => (
                    <article key={day.date} className="forecast-row">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#18382f]">
                            {formatForecastLabel(day.date)}
                          </p>
                          <p className="mt-1 text-sm text-emerald-950/60">
                            {formatForecastDate(day.date)}
                          </p>
                        </div>
                        <p className="aero-chip chip bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-950/65">
                          {day.rainChance}% rain
                        </p>
                      </div>
                      <div className="mt-4 flex items-end gap-2">
                        <p className="text-3xl font-black text-[#102820]">{day.high}\u00B0</p>
                        <p className="pb-1 text-sm font-semibold text-emerald-950/55">
                          /{day.low}\u00B0
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-emerald-950/72">{day.summary}</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-emerald-950/55">
                          <span>Humidity</span>
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="stat-meter mt-2">
                          <span style={{ width: `${day.humidity}%` }} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <div className="grid gap-6">
            <section className="panel p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="subtle-label">Air Quality</p>
                  <h2 className="display-face mt-2 text-3xl text-[#102820]">AQI snapshot</h2>
                </div>
                <span className={`aero-chip chip px-3 py-2 text-sm font-bold ${airBandClasses[snapshot.airBand]}`}>
                  {snapshot.airBand}
                </span>
              </div>

              <div className="metric-shell mt-6 p-5">
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black tracking-tight text-[#102820]">{snapshot.aqi}</p>
                  <p className="pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-950/55">
                    AQI Index
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-emerald-950/68">
                  {statusCopy(snapshot.airBand)}
                </p>
                <div className="stat-meter mt-5">
                  <span style={{ width: `${Math.min((snapshot.aqi / 120) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="value-card">
                  <p className="subtle-label">PM2.5</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">
                    {snapshot.pollutants.pm25} ug/m3
                  </p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">PM10</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">
                    {snapshot.pollutants.pm10} ug/m3
                  </p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Ozone</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">
                    {snapshot.pollutants.o3} ug/m3
                  </p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">NO2</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">
                    {snapshot.pollutants.no2} ug/m3
                  </p>
                </div>
              </div>
            </section>

            <section className="panel p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="subtle-label">Malaysia Warnings</p>
                  <h2 className="display-face mt-2 text-3xl text-[#102820]">
                    What needs attention today
                  </h2>
                </div>
                <span className="aero-chip chip border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-emerald-950/72">
                  {warningCountLabel}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {snapshot.warnings.length === 0 ? (
                  <div className="empty-panel p-6 text-center">
                    <p className="subtle-label">No Active Warning</p>
                    <p className="mt-3 text-sm font-semibold text-[#102820]">
                      No location-specific warning is active for this lens right now.
                    </p>
                  </div>
                ) : (
                  snapshot.warnings.map((warning) => (
                    <article
                      key={`${warning.title}-${warning.window}`}
                      className={`warning-card border p-4 ${severityClasses[warning.severity]}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-base font-extrabold">{warning.title}</p>
                        <span className="aero-chip chip bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]">
                          {warning.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-current/60">
                        {warning.window}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-current/80">{warning.message}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <article className="panel p-6 sm:p-7">
            <p className="subtle-label">Source Blend</p>
            <h2 className="display-face mt-2 text-3xl text-[#102820]">
              How the live version will work
            </h2>
            <div className="mt-6 space-y-4">
              {[
                ['OpenWeather 5-day forecast', 'Primary temperature and rain trend for the chart.', 'queued'],
                ['OpenWeather air pollution', 'AQI plus PM2.5, PM10, O3 and NO2 readout.', 'queued'],
                ['MET Malaysia warnings', 'Government-issued warning copy for local risk context.', 'must-have'],
              ].map(([title, detail, status]) => (
                <div
                  key={title}
                  className="strip-card flex items-start justify-between gap-4 bg-[#f8f5eb]/90 px-4 py-4"
                >
                  <div>
                    <p className="font-bold text-[#102820]">{title}</p>
                    <p className="mt-1 text-sm text-emerald-950/65">{detail}</p>
                  </div>
                  <span
                    className={`aero-chip chip px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                      status === 'must-have'
                        ? 'bg-[#18392f] text-emerald-50'
                        : 'bg-emerald-950 text-emerald-50'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="subtle-label">Decision Rule</p>
                <h2 className="display-face mt-2 text-3xl text-[#102820]">
                  How the hiking tip is decided
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-emerald-950/65">
                We are keeping this logic explicit so the final app feels trustworthy instead of
                mysterious.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                [
                  'Rule 1',
                  'Active warning beats everything',
                  'If there is a meaningful thunderstorm or heavy-rain warning, the answer tilts toward caution or skip.',
                ],
                [
                  'Rule 2',
                  'AQI changes the comfort level',
                  'Moderate air still allows most plans, but a poor reading downgrades long walks or hikes quickly.',
                ],
                [
                  'Rule 3',
                  'Rain timing shapes the final call',
                  'The app should explain when the dry window ends, not just say yes or no.',
                ],
              ].map(([label, title, detail]) => (
                <div key={label} className="value-card">
                  <p className="subtle-label">{label}</p>
                  <p className="mt-3 text-lg font-extrabold text-[#102820]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/67">{detail}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="pb-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/45">
          Served at {dayjs(meta.servedAt).format('h:mm:ss A')} with a {meta.cacheTtlMinutes}
          -minute server cache target. Frontend local cache TTL: {DASHBOARD_CACHE_TTL_MINUTES}{' '}
          minutes.
        </footer>
      </div>
    </div>
  )
}

export default App
