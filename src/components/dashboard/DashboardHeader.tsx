import { useEffect, useRef, useState } from 'react'
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
  CheckIcon,
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
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const locationMenuRef = useRef<HTMLDivElement | null>(null)
  const selectedLocationOption =
    activeLocations.find((location) => location.key === selectedLocation) ?? activeLocations[0]

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!locationMenuRef.current?.contains(event.target as Node)) {
        setIsLocationMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsLocationMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <header className="glass-panel relative z-40 mb-6 p-4 sm:p-5">
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
          <div
            ref={locationMenuRef}
            className="header-location-picker min-w-0 lg:min-w-[16.5rem]"
          >
            <button
              type="button"
              aria-label={copy.header.locationAria}
              aria-haspopup="listbox"
              aria-expanded={isLocationMenuOpen}
              onClick={() => setIsLocationMenuOpen((open) => !open)}
              className={`header-location-trigger ${
                isLocationMenuOpen ? 'header-location-trigger-open' : ''
              }`}
            >
              <span className="header-location-icon">
                <LocationPinIcon />
              </span>
              <span
                key={selectedLocationOption?.key ?? selectedLocation}
                className="header-location-value-swap min-w-0 flex-1 text-left"
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {copy.header.locationLabel}
                </span>
                <span className="mt-1 block truncate text-xl font-semibold tracking-tight text-slate-900">
                  {selectedLocationOption?.label ?? selectedLocation}
                </span>
              </span>
              <span
                className={`shrink-0 text-slate-400 transition duration-200 ${
                  isLocationMenuOpen ? 'rotate-180 text-sky-600' : ''
                }`}
              >
                <ChevronDownIcon />
              </span>
            </button>

            {isLocationMenuOpen ? (
              <div
                className="header-location-menu header-location-menu-in"
                role="listbox"
                aria-label={copy.header.locationMenuTitle}
              >
                <div className="border-b border-white/45 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700/85">
                    {copy.header.locationMenuTitle}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {copy.header.subtitle}
                  </p>
                </div>

                <div className="p-2">
                  {activeLocations.map((location, index) => {
                    const isActive = location.key === selectedLocation

                    return (
                      <button
                        key={location.key}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          onLocationChange(location.key)
                          setIsLocationMenuOpen(false)
                        }}
                        className={`header-location-option ${
                          isActive
                            ? 'header-location-option-active'
                            : 'header-location-option-idle'
                        }`}
                        style={{ animationDelay: `${index * 55}ms` }}
                      >
                        <span
                          className={`header-location-option-icon ${
                            isActive
                              ? 'header-location-option-icon-active header-location-check-pop'
                              : 'header-location-option-icon-idle'
                          }`}
                        >
                          {isActive ? <CheckIcon /> : <LocationPinIcon />}
                        </span>

                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-base font-semibold text-slate-900">
                            {location.label}
                          </span>
                          <span className="mt-0.5 block text-xs font-medium text-slate-500">
                            {copy.header.subtitle}
                          </span>
                        </span>

                        {isActive ? (
                          <span className="header-location-current-badge">
                            {copy.header.currentBadge}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

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
