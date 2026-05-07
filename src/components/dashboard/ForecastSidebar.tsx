import { type ForecastDay } from '../../shared/dashboard.ts'
import {
  formatDayMonth,
  formatWeekdayShort,
  getDashboardCopy,
  type AppLocale,
} from '../../i18n/dashboard.ts'
import { forecastSummaryClasses, rainChanceClasses } from './display.ts'
import { WeatherIcon } from './icons.tsx'
import { NatureDecor } from './NatureDecor.tsx'

type ForecastSidebarProps = {
  selectedLocationLabel: string
  forecastDays: ForecastDay[]
  activeForecastIndex: number | null
  onActiveForecastIndexChange: (index: number | null) => void
  locale: AppLocale
}

export function ForecastSidebar({
  selectedLocationLabel,
  forecastDays,
  activeForecastIndex,
  onActiveForecastIndexChange,
  locale,
}: ForecastSidebarProps) {
  const copy = getDashboardCopy(locale)

  return (
    <aside className="forecast-rail surface-panel min-w-0 p-5 sm:p-6">
      <NatureDecor variant="sidebar-droplets" />
      <div className="flex items-start gap-3">
        <span className="icon-pill shrink-0">
          <WeatherIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600/80">
            {copy.sidebar.title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-900">
            {copy.sidebar.outlook(selectedLocationLabel)}
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {forecastDays.map((day, index) => (
          <article
            key={`${day.date}-${index}`}
            tabIndex={0}
            onMouseEnter={() => onActiveForecastIndexChange(index)}
            onMouseLeave={() => onActiveForecastIndexChange(null)}
            onFocus={() => onActiveForecastIndexChange(index)}
            onBlur={() => onActiveForecastIndexChange(null)}
            className={`forecast-sidebar-item p-4 transition ${
              activeForecastIndex === index
                ? 'border-emerald-300/60 bg-white/80'
                : index === 0
                  ? 'border-emerald-200/50 bg-white/72'
                  : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700/80">
                    {formatWeekdayShort(day.date, locale)}
                  </p>
                  {index === 0 ? (
                    <span className="surface-chip px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                      {copy.common.today}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-emerald-700/50">{formatDayMonth(day.date, locale)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-emerald-900">
                  {day.high}
                  {'\u00B0'}
                </p>
                <p className="mt-1 text-sm text-emerald-700/50">
                  {day.low}
                  {'\u00B0'} {copy.sidebar.lowSuffix}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3 text-sm text-emerald-800">
              <span className={`min-w-0 flex-1 font-semibold leading-6 ${forecastSummaryClasses(day.summary, day.rainChance)}`}>
                {day.summary}
              </span>
              <span className={`surface-chip shrink-0 border px-2 py-1 text-xs font-bold ${rainChanceClasses(day.rainChance)}`}>
                {day.rainChance}%
              </span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-emerald-100/70">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${
                  day.rainChance >= 65
                    ? 'from-rose-400 to-rose-500'
                    : day.rainChance >= 45
                      ? 'from-amber-400 to-amber-500'
                      : 'from-emerald-400 to-emerald-500'
                }`}
                style={{ width: `${Math.min(day.rainChance, 100)}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </aside>
  )
}
