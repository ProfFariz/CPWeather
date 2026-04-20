import dayjs from 'dayjs'
import 'dayjs/locale/ms'
import {
  type AirBand,
  type DashboardPayload,
  type HikeCueTone,
  type Severity,
} from '../../shared/dashboard.ts'
import {
  type ClientCacheStatus,
} from '../../hooks/useDashboard.ts'
import {
  type AppLocale,
} from '../../i18n/dashboard.ts'

export function statusCopy(airBand: AirBand, locale: AppLocale) {
  if (locale === 'bm') {
    if (airBand === 'Good') return 'Udara selesa untuk kebanyakan aktiviti luar.'
    if (airBand === 'Moderate') return 'Masih boleh diurus, tetapi hadkan pendedahan yang lama.'
    return 'Kualiti udara tidak sesuai untuk aktiviti luar yang berat.'
  }

  if (airBand === 'Good') return 'Air feels comfortable for most outdoor plans.'
  if (airBand === 'Moderate') return 'Still manageable, but keep longer exposure lighter.'
  return 'Air quality is not ideal for strenuous outdoor activity.'
}

export function weatherAccent(summary: string, locale: AppLocale) {
  const lowered = summary.toLowerCase()

  if (
    lowered.includes('thunder') ||
    lowered.includes('storm') ||
    lowered.includes('ribut')
  ) {
    return locale === 'bm' ? 'Pembentukan ribut nanti' : 'Storm build-up later'
  }

  if (lowered.includes('rain') || lowered.includes('hujan')) {
    return locale === 'bm' ? 'Hujan tiba kemudian' : 'Rain arrives later'
  }

  if (lowered.includes('cloud') || lowered.includes('awan') || lowered.includes('berawan')) {
    return locale === 'bm' ? 'Litupan awan cerah' : 'Bright cloud cover'
  }

  return locale === 'bm' ? 'Cuaca tropika tenang' : 'Soft tropical conditions'
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

export function formatForecastLabel(date: string, locale: AppLocale) {
  return dayjs(date).locale(locale === 'bm' ? 'ms' : 'en').format('ddd')
}
