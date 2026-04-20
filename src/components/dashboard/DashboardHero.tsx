import dayjs from 'dayjs'
import {
  airBandClasses,
  hikeClasses,
} from '../../mockData.ts'
import { type DashboardPayload } from '../../shared/dashboard.ts'
import {
  hikeCueClasses,
  resolveCurrentTemp,
  statusCopy,
  weatherAccent,
} from './display.ts'
import {
  AlertIcon,
  DropIcon,
  TrailIcon,
  WeatherIcon,
} from './icons.tsx'

type DashboardHeroProps = {
  payload: DashboardPayload
  selectedLocationLabel: string
}

export function DashboardHero({
  payload,
  selectedLocationLabel,
}: DashboardHeroProps) {
  const { meta, snapshot } = payload
  const today = snapshot.forecast[0]
  const heroTemperature = resolveCurrentTemp(payload)
  const currentSummary =
    snapshot.currentSummary || today?.summary || 'Bright tropical weather'
  const hikeCues = Array.isArray(snapshot.hikeTip.cues) ? snapshot.hikeTip.cues : []
  const warningCountLabel =
    snapshot.warnings.length === 1
      ? '1 active warning'
      : `${snapshot.warnings.length} active warnings`

  return (
    <section className="glass-panel min-w-0 overflow-hidden p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="glass-chip text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              {selectedLocationLabel}, Perak
            </span>
            <span className="glass-chip text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {dayjs(meta.servedAt).format('ddd, D MMM - h:mm A')}
            </span>
          </div>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="accent-orb hidden sm:flex">
              <WeatherIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700/80">
                {weatherAccent(currentSummary)}
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="temperature-display text-sky-600">
                  {heroTemperature}
                  {'\u00B0'}
                </span>
                <div className="min-w-0 pt-0 sm:pt-4">
                  <p className="text-lg font-semibold text-slate-900">{currentSummary}</p>
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

        <div className="glass-inner-panel min-w-0 p-4 sm:p-5">
          <div className="flex items-start gap-3 text-sky-600">
            <span className="icon-pill shrink-0">
              <TrailIcon />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                Hiking Outlook
              </p>
              <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-900">
                {snapshot.hikeTip.target}
              </h2>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span
              className={`glass-chip px-4 py-2 text-sm font-bold ${hikeClasses[snapshot.hikeTip.verdict]}`}
            >
              {snapshot.hikeTip.verdict}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              Confidence {snapshot.hikeTip.confidence}%
            </span>
          </div>

          <p className="mt-5 text-lg font-semibold text-slate-900">
            {snapshot.hikeTip.title}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {snapshot.hikeTip.reason}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="glass-widget min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                Air Quality
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">AQI {snapshot.aqi}</p>
            </div>
            <span className="icon-pill shrink-0">
              <WeatherIcon />
            </span>
          </div>
          <span
            className={`mt-4 inline-flex rounded-2xl px-3 py-1 text-sm font-semibold ${airBandClasses[snapshot.airBand]}`}
          >
            {snapshot.airBand}
          </span>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {statusCopy(snapshot.airBand)}
          </p>
        </article>

        <article className="glass-widget min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                Rain Window
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">
                {snapshot.nextRainWindow}
              </p>
            </div>
            <span className="icon-pill shrink-0">
              <DropIcon />
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Today&apos;s forecast is anchored by {today?.rainChance ?? 0}% rain probability and a
            humidity level around {today?.humidity ?? 0}%.
          </p>
        </article>

        <article className="glass-widget min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                Warnings
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {warningCountLabel}
              </p>
            </div>
            <span className="icon-pill shrink-0">
              <AlertIcon />
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {snapshot.warnings[0]?.title ?? 'No location-specific warning is active right now.'}
          </p>
        </article>
      </div>
    </section>
  )
}
