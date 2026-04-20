import dayjs from 'dayjs'
import {
  type AirBand,
  type DashboardPayload,
  type HikeCueTone,
  type Severity,
} from '../../shared/dashboard.ts'
import {
  type ClientCacheStatus,
} from '../../hooks/useDashboard.ts'

export function statusCopy(airBand: AirBand) {
  if (airBand === 'Good') return 'Air feels comfortable for most outdoor plans.'
  if (airBand === 'Moderate') return 'Still manageable, but keep longer exposure lighter.'
  return 'Air quality is not ideal for strenuous outdoor activity.'
}

export function sourceLabel(source: DashboardPayload['meta']['source'] | undefined) {
  if (source === 'live') return 'Live API'
  if (source === 'hybrid') return 'Hybrid API'
  return 'Mock API'
}

export function weatherAccent(summary: string) {
  const lowered = summary.toLowerCase()

  if (lowered.includes('thunder') || lowered.includes('storm')) {
    return 'Storm build-up later'
  }

  if (lowered.includes('rain')) {
    return 'Rain arrives later'
  }

  if (lowered.includes('cloud')) {
    return 'Bright cloud cover'
  }

  return 'Soft tropical conditions'
}

export function cacheStatusLabel(status: ClientCacheStatus) {
  if (status === 'fresh') return 'Local cache'
  if (status === 'network') return 'Fresh fetch'
  if (status === 'stale') return 'Stale fallback'
  return 'No cache'
}

export function cacheStatusClasses(status: ClientCacheStatus) {
  if (status === 'fresh') {
    return 'border-white/40 bg-sky-500/12 text-sky-700'
  }

  if (status === 'network') {
    return 'border-white/40 bg-blue-500/12 text-blue-700'
  }

  if (status === 'stale') {
    return 'border-white/40 bg-amber-400/12 text-amber-700'
  }

  return 'border-white/40 bg-white/45 text-slate-600'
}

export function hikeCueClasses(tone: HikeCueTone) {
  if (tone === 'positive') {
    return 'border-white/45 bg-sky-500/18 text-sky-700'
  }

  if (tone === 'caution') {
    return 'border-white/45 bg-amber-400/18 text-amber-700'
  }

  if (tone === 'danger') {
    return 'border-white/45 bg-rose-400/18 text-rose-700'
  }

  return 'border-white/45 bg-white/45 text-slate-600'
}

export function warningToneClasses(severity: Severity) {
  if (severity === 'Alert') {
    return 'border-rose-200/70 bg-rose-100/45 text-rose-800'
  }

  if (severity === 'Watch') {
    return 'border-amber-200/70 bg-amber-100/45 text-amber-800'
  }

  return 'border-sky-200/70 bg-sky-100/45 text-sky-800'
}

export function resolveCurrentTemp(payload: DashboardPayload) {
  if (typeof payload.snapshot.currentTemp === 'number') {
    return payload.snapshot.currentTemp
  }

  const today = payload.snapshot.forecast[0]

  if (!today) {
    return 28
  }

  return Math.round((today.high + today.low) / 2)
}

export function formatForecastLabel(date: string) {
  return dayjs(date).format('ddd')
}
