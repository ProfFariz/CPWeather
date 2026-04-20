import {
  airBandClasses,
  hikeClasses,
} from '../../mockData.ts'
import {
  formatHeroTimestamp,
  formatWarningCount,
  getDashboardCopy,
  translateAirBand,
  translateHikeVerdict,
  translateSeverity,
  type AppLocale,
} from '../../i18n/dashboard.ts'
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
  locale: AppLocale
}

export function DashboardHero({
  payload,
  selectedLocationLabel,
  locale,
}: DashboardHeroProps) {
  const { meta, snapshot } = payload
  const copy = getDashboardCopy(locale)
  const today = snapshot.forecast[0]
  const heroTemperature = resolveCurrentTemp(payload)
  const currentSummary =
    snapshot.currentSummary || today?.summary || copy.hero.fallbackSummary
  const hikeCues = Array.isArray(snapshot.hikeTip.cues) ? snapshot.hikeTip.cues : []
  const warningCountLabel = formatWarningCount(snapshot.warnings.length, locale)
  const strongestWarningSeverity = snapshot.warnings.some((warning) => warning.severity === 'Alert')
    ? 'Alert'
    : snapshot.warnings.some((warning) => warning.severity === 'Watch')
      ? 'Watch'
      : snapshot.warnings[0]?.severity ?? null
  const warningCardClasses =
    strongestWarningSeverity === 'Alert'
      ? 'border-rose-200/75 bg-rose-100/45 ring-1 ring-rose-400/50 shadow-[0_24px_50px_rgba(244,63,94,0.18)]'
      : strongestWarningSeverity === 'Watch'
        ? 'border-amber-200/75 bg-amber-100/45 ring-1 ring-amber-400/45 shadow-[0_20px_42px_rgba(245,158,11,0.16)]'
        : ''
  const warningAccentClasses =
    strongestWarningSeverity === 'Alert'
      ? 'bg-gradient-to-r from-rose-500 to-rose-300'
      : strongestWarningSeverity === 'Watch'
        ? 'bg-gradient-to-r from-amber-500 to-amber-300'
        : 'bg-gradient-to-r from-sky-500 to-sky-300'
  const warningChipClasses =
    strongestWarningSeverity === 'Alert'
      ? 'border-rose-200/80 bg-rose-500/18 text-rose-800'
      : strongestWarningSeverity === 'Watch'
        ? 'border-amber-200/80 bg-amber-400/18 text-amber-800'
        : 'border-sky-200/80 bg-sky-500/14 text-sky-800'
  const warningSummaryTextClasses =
    strongestWarningSeverity === 'Alert'
      ? 'text-rose-900'
      : strongestWarningSeverity === 'Watch'
        ? 'text-amber-900'
        : 'text-slate-900'
  const warningChipLabel = strongestWarningSeverity
    ? translateSeverity(strongestWarningSeverity, locale)
    : copy.hero.clearState

  return (
    <section className="glass-panel min-w-0 overflow-hidden p-5 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_17rem] md:items-start lg:gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="glass-chip text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              {selectedLocationLabel}, Perak
            </span>
            <span className="glass-chip text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {formatHeroTimestamp(meta.servedAt, locale)}
            </span>
          </div>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="accent-orb accent-orb-drift hidden sm:flex">
              <WeatherIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700/80">
                {weatherAccent(currentSummary, locale)}
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="temperature-display temperature-display-breathe text-sky-600">
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

        <div className="glass-inner-panel min-w-0 self-start p-4 sm:p-5">
          <div className="flex items-start gap-3 text-sky-600">
            <span className="icon-pill shrink-0">
              <TrailIcon />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                {copy.hero.hikingOutlook}
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
              {translateHikeVerdict(snapshot.hikeTip.verdict, locale)}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {copy.hero.confidence(snapshot.hikeTip.confidence)}
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
                {copy.hero.airQuality}
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
            {translateAirBand(snapshot.airBand, locale)}
          </span>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {statusCopy(snapshot.airBand, locale)}
          </p>
        </article>

        <article className="glass-widget min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                {copy.hero.rainWindow}
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
            {copy.hero.rainNarrative(today?.rainChance ?? 0, today?.humidity ?? 0)}
          </p>
        </article>

        <article className={`glass-widget min-w-0 border p-4 sm:p-5 ${warningCardClasses}`}>
          <div className={`mb-4 h-1.5 rounded-full ${warningAccentClasses}`} />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/85">
                {copy.hero.warnings}
              </p>
              <p className={`mt-3 text-2xl font-semibold ${warningSummaryTextClasses}`}>
                {warningCountLabel}
              </p>
            </div>
            <span className="icon-pill shrink-0">
              <AlertIcon />
            </span>
          </div>
          <span
            className={`mt-4 inline-flex rounded-2xl border px-3 py-1 text-sm font-semibold ${warningChipClasses}`}
          >
            {warningChipLabel}
          </span>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {snapshot.warnings[0]?.title ?? copy.hero.noWarning}
          </p>
        </article>
      </div>
    </section>
  )
}
