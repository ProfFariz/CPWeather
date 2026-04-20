import { useState } from 'react'
import dayjs from 'dayjs'
import {
  defaultLocationKey,
  locations,
  type LocationKey,
} from './shared/dashboard.ts'
import { DASHBOARD_CACHE_TTL_MINUTES } from './lib/dashboardCache.ts'
import { useDashboard } from './hooks/useDashboard.ts'
import { DashboardHeader } from './components/dashboard/DashboardHeader.tsx'
import { DashboardHero } from './components/dashboard/DashboardHero.tsx'
import { DashboardInitialErrorState } from './components/dashboard/DashboardInitialErrorState.tsx'
import { DashboardLoadingState } from './components/dashboard/DashboardLoadingState.tsx'
import { ForecastSidebar } from './components/dashboard/ForecastSidebar.tsx'
import { ForecastTrendChart } from './components/dashboard/ForecastTrendChart.tsx'
import { WarningFeed } from './components/dashboard/WarningFeed.tsx'

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>(defaultLocationKey)
  const {
    payload,
    isLoading,
    isRefreshing,
    error,
    cacheInfo,
    refresh,
  } = useDashboard(selectedLocation)

  const activeLocations = payload?.locations ?? locations

  if (!payload && isLoading) {
    return <DashboardLoadingState />
  }

  if (!payload) {
    return <DashboardInitialErrorState error={error} onRetry={refresh} />
  }

  const forecastDays = payload.snapshot.forecast.slice(0, 5)
  const selectedLocationLabel =
    activeLocations.find((location) => location.key === selectedLocation)?.label ??
    payload.snapshot.label

  return (
    <div className="page-shell">
      <div className="page-grid mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <DashboardHeader
          source={payload.meta.source}
          cacheInfo={cacheInfo}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
        />

        {error ? (
          <div className="glass-panel mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                Last fetch warning
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">{error}</p>
            </div>
            <button type="button" onClick={refresh} className="secondary-button">
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
          <DashboardHero
            payload={payload}
            selectedLocationLabel={selectedLocationLabel}
          />
          <ForecastSidebar
            selectedLocationLabel={selectedLocationLabel}
            forecastDays={forecastDays}
          />
        </main>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_0.82fr]">
          <ForecastTrendChart forecastDays={forecastDays} />
          <WarningFeed
            warnings={payload.snapshot.warnings}
            selectedLocationLabel={selectedLocationLabel}
          />
        </section>

        <footer className="mt-6 px-4 text-center text-xs font-semibold uppercase leading-6 tracking-[0.22em] text-sky-700/75">
          Served at {dayjs(payload.meta.servedAt).format('h:mm:ss A')} - cache TTL{' '}
          {payload.meta.cacheTtlMinutes} minutes - local cache{' '}
          {DASHBOARD_CACHE_TTL_MINUTES} minutes
        </footer>
      </div>
    </div>
  )
}

export default App
