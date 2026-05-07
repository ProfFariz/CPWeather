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
    return 'border-emerald-200/60 bg-emerald-50/70 text-emerald-700'
  }

  if (status === 'network') {
    return 'border-emerald-200/60 bg-emerald-50/70 text-emerald-700'
  }

  if (status === 'stale') {
    return 'border-amber-200/60 bg-amber-50/70 text-amber-800'
  }

  return 'border-white/60 bg-white/60 text-emerald-600'
}

export function hikeCueClasses(tone: HikeCueTone) {
  if (tone === 'positive') {
    return 'border-emerald-200/70 bg-emerald-50/70 text-emerald-800'
  }

  if (tone === 'caution') {
    return 'border-amber-200/70 bg-amber-50/70 text-amber-800'
  }

  if (tone === 'danger') {
    return 'border-rose-200/70 bg-rose-50/70 text-rose-800'
  }

  return 'border-white/60 bg-white/60 text-emerald-600'
}

export function warningToneClasses(severity: Severity) {
  if (severity === 'Alert') {
    return 'border-rose-200/60 bg-rose-50/50 text-rose-800'
  }

  if (severity === 'Watch') {
    return 'border-amber-200/60 bg-amber-50/50 text-amber-800'
  }

  return 'border-emerald-200/60 bg-emerald-50/50 text-emerald-800'
}

export function rainChanceClasses(rainChance: number) {
  if (rainChance >= 65) {
    return 'border-rose-200/70 bg-rose-50/70 text-rose-800'
  }

  if (rainChance >= 45) {
    return 'border-amber-200/70 bg-amber-50/70 text-amber-800'
  }

  return 'border-emerald-200/70 bg-emerald-50/70 text-emerald-800'
}

export function airQualityMetricClasses(airBand: AirBand) {
  if (airBand === 'Good') {
    return 'text-emerald-700'
  }

  if (airBand === 'Moderate') {
    return 'text-amber-700'
  }

  return 'text-rose-700'
}

export function forecastSummaryClasses(summary: string, rainChance: number) {
  const normalizedSummary = summary.toLowerCase()

  if (
    rainChance >= 65 ||
    normalizedSummary.includes('storm') ||
    normalizedSummary.includes('thunder')
  ) {
    return 'text-rose-700'
  }

  if (
    rainChance >= 45 ||
    normalizedSummary.includes('rain') ||
    normalizedSummary.includes('drizzle') ||
    normalizedSummary.includes('shower') ||
    normalizedSummary.includes('mist')
  ) {
    return 'text-amber-700'
  }

  return 'text-emerald-700'
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
