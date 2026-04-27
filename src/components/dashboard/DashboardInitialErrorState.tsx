import { getDashboardCopy, type AppLocale } from '../../i18n/dashboard.ts'
import { RefreshIcon } from './icons.tsx'
import { SemanticHighlight } from './SemanticHighlight.tsx'

type DashboardInitialErrorStateProps = {
  locale: AppLocale
  error: string | null
  onRetry: () => void
}

export function DashboardInitialErrorState({
  locale,
  error,
  onRetry,
}: DashboardInitialErrorStateProps) {
  const copy = getDashboardCopy(locale)

  return (
    <div className="page-shell">
      <div className="page-grid mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="glass-panel p-8 text-center sm:p-10">
          <span className="glass-chip text-xs uppercase tracking-[0.28em] text-sky-700">
            <SemanticHighlight>{copy.initialError.chip}</SemanticHighlight>
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            <SemanticHighlight>{copy.initialError.title}</SemanticHighlight>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            <SemanticHighlight>{error ?? copy.initialError.fallbackMessage}</SemanticHighlight>
          </p>
          <button type="button" onClick={onRetry} className="primary-button mt-8">
            <RefreshIcon />
            {copy.common.retry}
          </button>
        </section>
      </div>
    </div>
  )
}
