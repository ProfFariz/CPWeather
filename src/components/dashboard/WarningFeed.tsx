import { type WarningItem } from '../../shared/dashboard.ts'
import {
  formatWarningCount,
  getDashboardCopy,
  translateSeverity,
  type AppLocale,
} from '../../i18n/dashboard.ts'
import { warningToneClasses } from './display.ts'
import { AlertIcon } from './icons.tsx'

type WarningFeedProps = {
  warnings: WarningItem[]
  selectedLocationLabel: string
  locale: AppLocale
}

export function WarningFeed({
  warnings,
  selectedLocationLabel,
  locale,
}: WarningFeedProps) {
  const copy = getDashboardCopy(locale)
  const warningCountLabel = formatWarningCount(warnings.length, locale)
  const strongestSeverity = warnings.some((warning) => warning.severity === 'Alert')
    ? 'Alert'
    : warnings.some((warning) => warning.severity === 'Watch')
      ? 'Watch'
      : warnings[0]?.severity ?? null
  const headerChipClasses =
    strongestSeverity === 'Alert'
      ? 'border-rose-300/70 bg-rose-500/16 text-rose-800'
      : strongestSeverity === 'Watch'
        ? 'border-amber-300/70 bg-amber-400/16 text-amber-800'
        : 'text-slate-600'

  return (
    <article className="glass-panel min-w-0 p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-sky-600">
            <span className="icon-pill shrink-0">
              <AlertIcon />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                {copy.warnings.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {copy.warnings.title}
              </h2>
            </div>
          </div>
        </div>
        <span
          className={`glass-chip text-xs font-semibold uppercase tracking-[0.16em] ${headerChipClasses}`}
        >
          {warningCountLabel}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {warnings.length === 0 ? (
          <div className="forecast-sidebar-item">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700/80">
              {copy.warnings.clearTitle}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {copy.warnings.clearBody(selectedLocationLabel)}
            </p>
          </div>
        ) : (
          warnings.map((warning) => (
            <article
              key={`${warning.title}-${warning.window}`}
              className={`forecast-sidebar-item border p-4 ${
                warning.severity === 'Alert'
                  ? 'ring-1 ring-rose-400/50 shadow-[0_24px_50px_rgba(244,63,94,0.18)]'
                  : warning.severity === 'Watch'
                    ? 'ring-1 ring-amber-400/45 shadow-[0_20px_42px_rgba(245,158,11,0.16)]'
                    : ''
              } ${warningToneClasses(warning.severity)}`}
            >
              <div
                className={`mb-4 h-1.5 rounded-full ${
                  warning.severity === 'Alert'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-300'
                    : warning.severity === 'Watch'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                      : 'bg-gradient-to-r from-sky-500 to-sky-300'
                }`}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-semibold">{warning.title}</p>
                <span
                  className={`glass-chip text-xs font-semibold uppercase tracking-[0.16em] ${
                    warning.severity === 'Alert'
                      ? 'border-rose-200/80 bg-rose-500/18 text-rose-800'
                      : warning.severity === 'Watch'
                        ? 'border-amber-200/80 bg-amber-400/18 text-amber-800'
                        : 'border-sky-200/80 bg-sky-500/14 text-sky-800'
                  }`}
                >
                  {translateSeverity(warning.severity, locale)}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-current/70">
                {warning.window}
              </p>
              <p className="mt-3 text-sm leading-7 text-current/85">{warning.message}</p>
            </article>
          ))
        )}
      </div>
    </article>
  )
}
