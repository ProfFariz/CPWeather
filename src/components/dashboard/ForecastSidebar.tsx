import dayjs from 'dayjs'
import { type ForecastDay } from '../../shared/dashboard.ts'
import { WeatherIcon } from './icons.tsx'

type ForecastSidebarProps = {
  selectedLocationLabel: string
  forecastDays: ForecastDay[]
}

export function ForecastSidebar({
  selectedLocationLabel,
  forecastDays,
}: ForecastSidebarProps) {
  return (
    <aside className="glass-panel min-w-0 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="icon-pill shrink-0">
          <WeatherIcon />
        </span>
        <div className="min-w-0">
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
          <article key={`${day.date}-${index}`} className="forecast-sidebar-item p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700/85">
                  {dayjs(day.date).format('ddd')}
                </p>
                <p className="mt-1 text-sm text-slate-500">{dayjs(day.date).format('D MMM')}</p>
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

            <div className="mt-4 flex items-start justify-between gap-3 text-sm text-slate-600">
              <span className="min-w-0 flex-1 leading-6">{day.summary}</span>
              <span className="shrink-0 font-semibold text-sky-700">{day.rainChance}%</span>
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
  )
}
