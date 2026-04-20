import dayjs from 'dayjs'
import 'dayjs/locale/ms'
import {
  type AirBand,
  type DashboardSource,
  type HikeVerdict,
  type Severity,
} from '../shared/dashboard.ts'
import { type ClientCacheStatus } from '../hooks/useDashboard.ts'

export type AppLocale = 'en' | 'bm'

export const APP_LOCALE_STORAGE_KEY = 'cpweather.ui-locale'

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'bm'
}

export function resolveInitialLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const stored = window.localStorage.getItem(APP_LOCALE_STORAGE_KEY)

  if (isAppLocale(stored)) {
    return stored
  }

  return window.navigator.language.toLowerCase().startsWith('ms') ? 'bm' : 'en'
}

function dayjsLocale(locale: AppLocale) {
  return locale === 'bm' ? 'ms' : 'en'
}

function localizeDate(value: string, locale: AppLocale) {
  return dayjs(value).locale(dayjsLocale(locale))
}

export function formatHeaderUpdatedTime(value: string, locale: AppLocale) {
  return localizeDate(value, locale).format(locale === 'bm' ? 'HH:mm' : 'h:mm A')
}

export function formatHeroTimestamp(value: string, locale: AppLocale) {
  return localizeDate(value, locale).format(
    locale === 'bm' ? 'ddd, D MMM - HH:mm' : 'ddd, D MMM - h:mm A',
  )
}

export function formatFooterTime(value: string, locale: AppLocale) {
  return localizeDate(value, locale).format(locale === 'bm' ? 'HH:mm:ss' : 'h:mm:ss A')
}

export function formatWeekdayShort(value: string, locale: AppLocale) {
  return localizeDate(value, locale).format('ddd')
}

export function formatDayMonth(value: string, locale: AppLocale) {
  return localizeDate(value, locale).format('D MMM')
}

export function translateAirBand(airBand: AirBand, locale: AppLocale) {
  if (locale === 'en') {
    return airBand
  }

  if (airBand === 'Good') return 'Baik'
  if (airBand === 'Moderate') return 'Sederhana'
  return 'Kurang baik'
}

export function translateHikeVerdict(verdict: HikeVerdict, locale: AppLocale) {
  if (locale === 'en') {
    return verdict
  }

  if (verdict === 'Go') return 'Teruskan'
  if (verdict === 'Caution') return 'Berhati-hati'
  return 'Tangguh'
}

export function translateSeverity(severity: Severity, locale: AppLocale) {
  if (locale === 'en') {
    return severity
  }

  if (severity === 'Alert') return 'Amaran'
  if (severity === 'Watch') return 'Waspada'
  return 'Pantau'
}

export function sourceLabel(source: DashboardSource, locale: AppLocale) {
  if (locale === 'en') {
    if (source === 'live') return 'Live API'
    if (source === 'hybrid') return 'Hybrid API'
    return 'Mock API'
  }

  if (source === 'live') return 'API langsung'
  if (source === 'hybrid') return 'API hibrid'
  return 'API mock'
}

export function cacheStatusLabel(status: ClientCacheStatus, locale: AppLocale) {
  if (locale === 'en') {
    if (status === 'fresh') return 'Local cache'
    if (status === 'network') return 'Fresh fetch'
    if (status === 'stale') return 'Stale fallback'
    return 'No cache'
  }

  if (status === 'fresh') return 'Cache tempatan'
  if (status === 'network') return 'Data baharu'
  if (status === 'stale') return 'Sandaran lama'
  return 'Tiada cache'
}

export function formatWarningCount(count: number, locale: AppLocale) {
  if (locale === 'bm') {
    return count === 1 ? '1 amaran aktif' : `${count} amaran aktif`
  }

  return count === 1 ? '1 active warning' : `${count} active warnings`
}

export function getDashboardCopy(locale: AppLocale) {
  if (locale === 'bm') {
    return {
      common: {
        today: 'Hari ini',
        retry: 'Cuba lagi',
        refresh: 'Muat semula',
        refreshing: 'Sedang muat semula...',
        minutes: 'minit',
      },
      header: {
        brand: 'CPWeather',
        subtitle: 'Perak, Malaysia',
        locationAria: 'Pilih lokasi',
        languageAria: 'Pilih bahasa',
        updated: 'Kemaskini',
      },
      banner: {
        lastFetchWarning: 'Amaran permintaan terakhir',
      },
      hero: {
        fallbackSummary: 'Cuaca tropika yang tenang',
        hikingOutlook: 'Prospek Hiking',
        confidence: (value: number) => `Keyakinan ${value}%`,
        airQuality: 'Kualiti udara',
        rainWindow: 'Jangkaan hujan',
        warnings: 'Amaran',
        clearState: 'Selamat',
        noWarning: 'Tiada amaran khusus lokasi yang aktif sekarang.',
        rainNarrative: (rainChance: number, humidity: number) =>
          `Ramalan hari ini menunjukkan kebarangkalian hujan ${rainChance}% dan kelembapan sekitar ${humidity}%.`,
      },
      sidebar: {
        title: 'Ramalan 5 Hari',
        outlook: (location: string) => `Ramalan ${location}`,
        lowSuffix: 'rendah',
      },
      chart: {
        eyebrow: 'Trend ramalan',
        title: (location: string) => `Trend suhu dan hujan 5 hari untuk ${location}`,
        description:
          'Suhu tinggi dan rendah kekal pada paksi kiri, manakala kebarangkalian hujan berada pada paksi kanan supaya coraknya lebih mudah dibaca.',
        badges: [
          'Hari ini ditonjolkan dahulu',
          'Arah pada mana-mana hari untuk segerakkan senarai',
          'Hujan menggunakan bar pada paksi kanan',
        ],
        datasets: {
          rain: 'Hujan %',
          high: 'Tinggi',
          low: 'Rendah',
        },
        axes: {
          day: 'Hari',
          temp: 'Suhu (°C)',
          rain: 'Kebarangkalian hujan (%)',
        },
        tooltipSummary: 'Ringkasan',
        tooltipHumidity: 'Kelembapan',
      },
      warnings: {
        eyebrow: 'Suapan amaran',
        title: 'Butiran amaran langsung',
        clearTitle: 'Keadaan amaran selamat',
        clearBody: (location: string) =>
          `Tiada amaran khusus lokasi yang aktif untuk ${location} sekarang.`,
      },
      loading: {
        chip: 'Papan pemuka cuaca',
        title: 'Memuatkan paparan cuaca Tapah...',
        description:
          'Sedang mengambil respons papan pemuka supaya susun atur kaca boleh dipaparkan bersama cuaca, kualiti udara, dan panduan hiking secara langsung.',
      },
      initialError: {
        chip: 'Ralat papan pemuka',
        title: 'Antara muka dimuatkan, tetapi respons cuaca pertama gagal.',
        fallbackMessage: 'Belum ada data papan pemuka yang tersedia.',
      },
      footer: {
        servedAt: 'Dijana pada',
        apiCacheTtl: 'TTL cache API',
        localCache: 'Cache tempatan',
      },
    }
  }

  return {
    common: {
      today: 'Today',
      retry: 'Retry',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',
      minutes: 'minutes',
    },
    header: {
      brand: 'CPWeather',
      subtitle: 'Perak, Malaysia',
      locationAria: 'Select location',
      languageAria: 'Select language',
      updated: 'Updated',
    },
    banner: {
      lastFetchWarning: 'Last fetch warning',
    },
    hero: {
      fallbackSummary: 'Bright tropical weather',
      hikingOutlook: 'Hiking Outlook',
      confidence: (value: number) => `Confidence ${value}%`,
      airQuality: 'Air Quality',
      rainWindow: 'Rain Window',
      warnings: 'Warnings',
      clearState: 'Clear',
      noWarning: 'No location-specific warning is active right now.',
      rainNarrative: (rainChance: number, humidity: number) =>
        `Today's forecast is anchored by ${rainChance}% rain probability and a humidity level around ${humidity}%.`,
    },
    sidebar: {
      title: '5-Day Forecast',
      outlook: (location: string) => `${location} outlook`,
      lowSuffix: 'low',
    },
    chart: {
      eyebrow: 'Forecast Trend',
      title: (location: string) => `5-day temperature and rain trend for ${location}`,
      description:
        'High and low temperatures stay on the left axis, while rain probability uses the right axis so the pattern reads faster.',
      badges: [
        'Today is highlighted first',
        'Hover any day to sync the sidebar',
        'Rain uses bars on the right axis',
      ],
      datasets: {
        rain: 'Rain %',
        high: 'High',
        low: 'Low',
      },
      axes: {
        day: 'Day',
        temp: 'Temperature (°C)',
        rain: 'Rain Probability (%)',
      },
      tooltipSummary: 'Summary',
      tooltipHumidity: 'Humidity',
    },
    warnings: {
      eyebrow: 'Warning Feed',
      title: 'Live warning detail',
      clearTitle: 'Clear warning state',
      clearBody: (location: string) =>
        `No location-specific warning is active for ${location} right now.`,
    },
    loading: {
      chip: 'Weather Dashboard',
      title: "Loading Tapah's weather lens...",
      description:
        'Pulling the shared dashboard response now so the glassmorphism layout can hydrate with live weather, air quality, and hiking guidance.',
    },
    initialError: {
      chip: 'Dashboard Error',
      title: 'The interface loaded, but the first weather response did not.',
      fallbackMessage: 'No dashboard payload is available yet.',
    },
    footer: {
      servedAt: 'Served at',
      apiCacheTtl: 'API cache TTL',
      localCache: 'Local cache',
    },
  }
}
