import { useEffect, useState } from 'react'
import {
  defaultLocationKey,
  locations,
  type LocationKey,
} from './shared/dashboard.ts'
import { DASHBOARD_CACHE_TTL_MINUTES } from './lib/dashboardCache.ts'
import { useDashboard } from './hooks/useDashboard.ts'
import {
  APP_LOCALE_STORAGE_KEY,
  formatFooterTime,
  getDashboardCopy,
  resolveInitialLocale,
  type AppLocale,
} from './i18n/dashboard.ts'
import { DashboardHeader } from './components/dashboard/DashboardHeader.tsx'
import { DashboardHero } from './components/dashboard/DashboardHero.tsx'
import { DashboardInitialErrorState } from './components/dashboard/DashboardInitialErrorState.tsx'
import { DashboardLoadingState } from './components/dashboard/DashboardLoadingState.tsx'
import { ForecastSidebar } from './components/dashboard/ForecastSidebar.tsx'
import { ForecastTrendChart } from './components/dashboard/ForecastTrendChart.tsx'
import { WarningFeed } from './components/dashboard/WarningFeed.tsx'

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>(defaultLocationKey)
  const [locale, setLocale] = useState<AppLocale>(resolveInitialLocale)
  const [activeForecastIndex, setActiveForecastIndex] = useState<number | null>(null)
  const {
    payload,
    isLoading,
    isRefreshing,
    error,
    cacheInfo,
    refresh,
  } = useDashboard(selectedLocation, locale)
  const copy = getDashboardCopy(locale)

  const activeLocations = payload?.locations ?? locations

  useEffect(() => {
    window.localStorage.setItem(APP_LOCALE_STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'bm' ? 'ms' : 'en'
  }, [locale])

  if (!payload && isLoading) {
    return <DashboardLoadingState locale={locale} />
  }

  if (!payload) {
    return <DashboardInitialErrorState locale={locale} error={error} onRetry={refresh} />
  }

  const forecastDays = payload.snapshot.forecast.slice(0, 5)
  const selectedLocationLabel =
    activeLocations.find((location) => location.key === selectedLocation)?.label ??
    payload.snapshot.label

  return (
    <div className="page-shell">
      <div className="page-grid mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <DashboardHeader
          locale={locale}
          onLocaleChange={setLocale}
          selectedLocation={selectedLocation}
          activeLocations={activeLocations}
          onLocationChange={(location) => {
            setSelectedLocation(location)
            setActiveForecastIndex(null)
          }}
          servedAt={payload.meta.servedAt}
          source={payload.meta.source}
          cacheInfo={cacheInfo}
          isRefreshing={isRefreshing}
          onRefresh={refresh}
        />

        {error ? (
          <div className="glass-panel mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                {copy.banner.lastFetchWarning}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-700">{error}</p>
            </div>
            <button type="button" onClick={refresh} className="secondary-button">
              {copy.common.retry}
            </button>
          </div>
        ) : null}

        <main className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <DashboardHero
            payload={payload}
            selectedLocationLabel={selectedLocationLabel}
            locale={locale}
          />
          <ForecastSidebar
            selectedLocationLabel={selectedLocationLabel}
            forecastDays={forecastDays}
            activeForecastIndex={activeForecastIndex}
            onActiveForecastIndexChange={setActiveForecastIndex}
            locale={locale}
          />
        </main>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_0.82fr]">
          <ForecastTrendChart
            selectedLocationLabel={selectedLocationLabel}
            forecastDays={forecastDays}
            activeForecastIndex={activeForecastIndex}
            onActiveForecastIndexChange={setActiveForecastIndex}
            locale={locale}
          />
          <WarningFeed
            warnings={payload.snapshot.warnings}
            selectedLocationLabel={selectedLocationLabel}
            locale={locale}
          />
        </section>

        <footer className="mt-6 px-4 text-center text-xs font-semibold uppercase leading-6 tracking-[0.22em] text-sky-700/75">
          {copy.footer.servedAt} {formatFooterTime(payload.meta.servedAt, locale)} -{' '}
          {copy.footer.apiCacheTtl} {payload.meta.cacheTtlMinutes} {copy.common.minutes} -{' '}
          {copy.footer.localCache} {DASHBOARD_CACHE_TTL_MINUTES} {copy.common.minutes}
        </footer>
      </div>
    </div>
  )
}

export default App
