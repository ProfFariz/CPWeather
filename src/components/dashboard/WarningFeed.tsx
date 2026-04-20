import { type WarningItem } from '../../shared/dashboard.ts'
import { warningToneClasses } from './display.ts'
import { AlertIcon } from './icons.tsx'

type WarningFeedProps = {
  warnings: WarningItem[]
  selectedLocationLabel: string
}

export function WarningFeed({
  warnings,
  selectedLocationLabel,
}: WarningFeedProps) {
  const warningCountLabel =
    warnings.length === 1 ? '1 active warning' : `${warnings.length} active warnings`

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
                Warning Feed
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Live warning detail
              </h2>
            </div>
          </div>
        </div>
        <span className="glass-chip text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          {warningCountLabel}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {warnings.length === 0 ? (
          <div className="forecast-sidebar-item">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700/80">
              Clear warning state
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              No location-specific warning is active for {selectedLocationLabel} right now.
            </p>
          </div>
        ) : (
          warnings.map((warning) => (
            <article
              key={`${warning.title}-${warning.window}`}
              className={`forecast-sidebar-item border p-4 ${warningToneClasses(warning.severity)}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-semibold">{warning.title}</p>
                <span className="glass-chip text-xs font-semibold uppercase tracking-[0.16em]">
                  {warning.severity}
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
