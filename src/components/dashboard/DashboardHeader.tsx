import {
  type ClientCacheInfo,
} from '../../hooks/useDashboard.ts'
import {
  cacheStatusLabel,
  formatHeaderUpdatedTime,
  getDashboardCopy,
  sourceLabel,
  type AppLocale,
} from '../../i18n/dashboard.ts'
import {
  type DashboardPayload,
  type LocationKey,
  type LocationOption,
} from '../../shared/dashboard.ts'
import { cacheStatusClasses } from './display.ts'
import {
  ChevronDownIcon,
  ClockIcon,
  LocationPinIcon,
  RefreshIcon,
  WeatherIcon,
} from './icons.tsx'

type DashboardHeaderProps = {
  locale: AppLocale
  onLocaleChange: (locale: AppLocale) => void
  selectedLocation: LocationKey
  activeLocations: LocationOption[]
  onLocationChange: (location: LocationKey) => void
  servedAt: string
  source: DashboardPayload['meta']['source']
  cacheInfo: ClientCacheInfo
  isRefreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({
  locale,
  onLocaleChange,
  selectedLocation,
  activeLocations,
  onLocationChange,
  servedAt,
  source,
  cacheInfo,
  isRefreshing,
  onRefresh,
}: DashboardHeaderProps) {
  const copy = getDashboardCopy(locale)

  return (
    <header className="glass-panel mb-6 p-4 sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="brand-mark shrink-0 text-white">
            <WeatherIcon />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-semibold tracking-tight text-slate-900">
              {copy.header.brand}
            </h1>
            <p className="truncate text-base font-medium text-slate-500">
              {copy.header.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
          <label className="header-select-shell min-w-0 lg:min-w-[15rem]">
            <span className="sr-only">{copy.header.locationAria}</span>
            <span className="text-slate-500">
              <LocationPinIcon />
            </span>
            <select
              aria-label={copy.header.locationAria}
              value={selectedLocation}
              onChange={(event) => onLocationChange(event.target.value as LocationKey)}
              className="header-select"
            >
              {activeLocations.map((location) => (
                <option key={location.key} value={location.key}>
                  {location.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none text-slate-400">
              <ChevronDownIcon />
            </span>
          </label>

          <div className="glass-chip gap-1 p-1">
            {(['bm', 'en'] as const).map((language) => {
              const isActive = language === locale

              return (
                <button
                  key={language}
                  type="button"
                  aria-pressed={isActive}
                  aria-label={copy.header.languageAria}
                  onClick={() => onLocaleChange(language)}
                  className={`header-segment ${
                    isActive ? 'header-segment-active' : 'header-segment-idle'
                  }`}
                >
                  {language.toUpperCase()}
                </button>
              )
            })}
          </div>

          <div className="glass-chip justify-between gap-4 px-4 py-3 sm:min-w-[13rem]">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                <ClockIcon />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {copy.header.updated}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatHeaderUpdatedTime(servedAt, locale)}
                </p>
              </div>
            </div>
            <div
              className={`hidden rounded-2xl border px-3 py-1.5 text-right text-[11px] font-semibold sm:block ${cacheStatusClasses(
                cacheInfo.status,
              )}`}
            >
              <p>{sourceLabel(source, locale)}</p>
              <p className="mt-0.5 text-[10px] font-medium text-current/80">
                {cacheStatusLabel(cacheInfo.status, locale)}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label={copy.common.refresh}
            onClick={onRefresh}
            disabled={isRefreshing}
            className="glass-icon-button disabled:cursor-wait disabled:opacity-75"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>
    </header>
  )
}
