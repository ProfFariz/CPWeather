import { type ForecastDay } from '../../shared/dashboard.ts'
import {
  formatDayMonth,
  formatWeekdayShort,
  getDashboardCopy,
  type AppLocale,
} from '../../i18n/dashboard.ts'
import { forecastSummaryClasses, rainChanceClasses } from './display.ts'
import { WeatherIcon } from './icons.tsx'

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
      <div className="flex items-start gap-3">
        <span className="icon-pill shrink-0">
          <WeatherIcon />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
            {copy.sidebar.title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
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
                ? 'border-sky-300/80 bg-sky-50/70'
                : index === 0
                  ? 'border-sky-200/80 bg-sky-50/55'
                  : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700/85">
                    {formatWeekdayShort(day.date, locale)}
                  </p>
                  {index === 0 ? (
                    <span className="surface-chip px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">
                      {copy.common.today}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">{formatDayMonth(day.date, locale)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-slate-900">
                  {day.high}
                  {'\u00B0'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {day.low}
                  {'\u00B0'} {copy.sidebar.lowSuffix}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-3 text-sm text-slate-600">
              <span className={`min-w-0 flex-1 font-semibold leading-6 ${forecastSummaryClasses(day.summary, day.rainChance)}`}>
                {day.summary}
              </span>
              <span className={`surface-chip shrink-0 border px-2 py-1 text-xs font-bold ${rainChanceClasses(day.rainChance)}`}>
                {day.rainChance}%
              </span>
            </div>

            <div className="mt-3 h-2 rounded-full bg-white/55">
              <div
                className={`h-full rounded-full ${
                  day.rainChance >= 65
                    ? 'bg-rose-500/80'
                    : day.rainChance >= 45
                      ? 'bg-amber-500/80'
                      : 'bg-teal-500/80'
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
