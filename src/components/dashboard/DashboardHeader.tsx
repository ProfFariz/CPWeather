import { type DashboardPayload } from '../../shared/dashboard.ts'
import {
  type ClientCacheInfo,
} from '../../hooks/useDashboard.ts'
import {
  cacheStatusClasses,
  cacheStatusLabel,
  sourceLabel,
} from './display.ts'
import { RefreshIcon } from './icons.tsx'

type DashboardHeaderProps = {
  source: DashboardPayload['meta']['source']
  cacheInfo: ClientCacheInfo
  isRefreshing: boolean
  onRefresh: () => void
}

export function DashboardHeader({
  source,
  cacheInfo,
  isRefreshing,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700/85">
          Perak Weather + API Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Glassmorphism weather briefing
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          A soft live dashboard for haze, rain timing, and whether today still feels like a real
          outdoor window.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="glass-chip text-sm font-semibold text-slate-600">
          {sourceLabel(source)}
        </span>
        <span
          className={`glass-chip text-sm font-semibold ${cacheStatusClasses(cacheInfo.status)}`}
        >
          {cacheStatusLabel(cacheInfo.status)}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="primary-button disabled:cursor-wait disabled:opacity-75"
        >
          <RefreshIcon />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </header>
  )
}
