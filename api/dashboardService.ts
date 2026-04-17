import { buildMockDashboardPayload } from '../src/mockData.ts'
import {
  type AirBand,
  type DashboardPayload,
  type ForecastDay,
  type HikeTip,
  type LocationKey,
  type LocationSnapshot,
  type Severity,
  type WarningItem,
} from '../src/shared/dashboard.ts'
import { liveLocationConfig, type LiveLocationConfig } from './locationConfig.ts'

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const MALAYSIA_WEATHER_BASE_URL = 'https://api.data.gov.my/weather'
const SERVER_CACHE_TTL_MINUTES = 15
const REQUEST_TIMEOUT_MS = 8000
const MALAYSIA_TIMEZONE = 'Asia/Kuala_Lumpur'

const malaysiaDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MALAYSIA_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const malaysiaTimeFormatter = new Intl.DateTimeFormat('en-MY', {
  timeZone: MALAYSIA_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
})

const malaysiaDateTimeFormatter = new Intl.DateTimeFormat('en-MY', {
  timeZone: MALAYSIA_TIMEZONE,
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

type OpenWeatherForecastResponse = {
  list: Array<{
    dt: number
    main: {
      temp: number
      temp_min: number
      temp_max: number
      humidity: number
    }
    weather: Array<{
      main: string
      description: string
    }>
    pop?: number
    rain?: {
      '3h'?: number
    }
  }>
}

type OpenWeatherAirResponse = {
  list: Array<{
    dt: number
    main: {
      aqi: number
    }
    components: {
      no2: number
      o3: number
      pm2_5: number
      pm10: number
    }
  }>
}

type MalaysiaForecastItem = {
  location: {
    location_id: string
    location_name: string
  }
  date: string
  morning_forecast: string
  afternoon_forecast: string
  night_forecast: string
  summary_forecast: string
  summary_when: string
  min_temp: number
  max_temp: number
}

type MalaysiaWarningItem = {
  warning_issue: {
    issued: string
    title_bm: string | null
    title_en: string | null
  }
  valid_from: string
  valid_to: string
  heading_en: string | null
  text_en: string | null
  instruction_en: string | null
  heading_bm: string | null
  text_bm: string | null
  instruction_bm: string | null
}

const malaysiaForecastTranslations: Record<string, string> = {
  Berjerebu: 'Hazy',
  'Tiada hujan': 'No rain',
  Hujan: 'Rain',
  'Hujan di beberapa tempat': 'Scattered rain',
  'Hujan di satu dua tempat': 'Isolated rain',
  'Hujan di satu dua tempat di kawasan pantai': 'Isolated rain over coastal areas',
  'Hujan di satu dua tempat di kawasan pedalaman': 'Isolated rain over inland areas',
  'Ribut petir': 'Thunderstorms',
  'Ribut petir di beberapa tempat': 'Scattered thunderstorms',
  'Ribut petir di beberapa tempat di kawasan pedalaman':
    'Scattered thunderstorms over inland areas',
  'Ribut petir di satu dua tempat': 'Isolated thunderstorms',
  'Ribut petir di satu dua tempat di kawasan pantai':
    'Isolated thunderstorms over coastal areas',
  'Ribut petir di satu dua tempat di kawasan pedalaman':
    'Isolated thunderstorms over inland areas',
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase())
}

function cloneSnapshot(snapshot: LocationSnapshot): LocationSnapshot {
  return {
    ...snapshot,
    pollutants: { ...snapshot.pollutants },
    hikeTip: { ...snapshot.hikeTip },
    warnings: snapshot.warnings.map((warning) => ({ ...warning })),
    forecast: snapshot.forecast.map((day) => ({ ...day })),
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}: ${url}`)
  }

  return (await response.json()) as T
}

function formatMalaysiaDate(date: Date) {
  const parts = malaysiaDateFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'

  return `${year}-${month}-${day}`
}

function formatMalaysiaTime(dateValue: string | number | Date) {
  return malaysiaTimeFormatter.format(new Date(dateValue))
}

function formatMalaysiaDateTime(dateValue: string | number | Date) {
  return malaysiaDateTimeFormatter.format(new Date(dateValue))
}

function getSeverityFromWarning(item: MalaysiaWarningItem): Severity {
  const joined = [
    item.warning_issue.title_en,
    item.warning_issue.title_bm,
    item.heading_en,
    item.heading_bm,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (joined.includes('third category') || joined.includes('kategori ketiga')) {
    return 'Alert'
  }

  if (joined.includes('second category') || joined.includes('kategori kedua')) {
    return 'Watch'
  }

  if (
    joined.includes('first category') ||
    joined.includes('kategori pertama') ||
    joined.includes('thunderstorm') ||
    joined.includes('ribut')
  ) {
    return 'Monitor'
  }

  return 'Monitor'
}

function getMalaysiaSummary(summary: string) {
  return malaysiaForecastTranslations[summary] ?? summary
}

function estimateRainChance(summary: string) {
  const lowered = summary.toLowerCase()

  if (lowered.includes('tiada hujan') || lowered.includes('no rain')) {
    return 10
  }

  if (lowered.includes('berjerebu') || lowered.includes('hazy')) {
    return 15
  }

  if (lowered.includes('ribut petir di beberapa tempat')) {
    return 80
  }

  if (lowered.includes('ribut petir')) {
    return 70
  }

  if (lowered.includes('hujan di beberapa tempat') || lowered.includes('scattered rain')) {
    return 60
  }

  if (lowered.includes('hujan di satu dua tempat') || lowered.includes('isolated rain')) {
    return 45
  }

  if (lowered.includes('hujan') || lowered.includes('rain')) {
    return 55
  }

  return 30
}

function estimateHumidity(maxTemp: number, minTemp: number, rainChance: number) {
  const temperatureSpread = maxTemp - minTemp
  const estimated = 90 - temperatureSpread * 2 + rainChance * 0.15

  return Math.max(60, Math.min(92, Math.round(estimated)))
}

function buildNextRainWindowFromMalaysiaForecast(todayForecast: MalaysiaForecastItem) {
  const lowered = todayForecast.summary_forecast.toLowerCase()
  const when = todayForecast.summary_when.toLowerCase()

  if (lowered.includes('no rain') || lowered.includes('hazy')) {
    return 'Best dry window: Most of the day looks dry'
  }

  if (when.includes('petang') && !when.includes('malam')) {
    return 'Best dry window: Morning to noon'
  }

  if (when.includes('malam') && !when.includes('petang')) {
    return 'Best dry window: Through the afternoon'
  }

  if (when.includes('pagi') && !when.includes('petang') && !when.includes('malam')) {
    return 'Best dry window: Later in the day'
  }

  if (when.includes('pagi') && when.includes('petang')) {
    return 'Best dry window: Night looks steadier than the day'
  }

  if (when.includes('petang') && when.includes('malam')) {
    return 'Best dry window: Early morning only'
  }

  if (when.includes('sepanjang hari')) {
    return 'Limited dry window: Rain can linger through the day'
  }

  return 'Best dry window: Keep plans early if possible'
}

function buildNextRainWindowFromOpenWeather(data: OpenWeatherForecastResponse) {
  const nextWetSlot = data.list.find((entry) => {
    const rainChance = Math.round((entry.pop ?? 0) * 100)
    const weatherMain = entry.weather[0]?.main.toLowerCase() ?? ''

    return rainChance >= 45 || weatherMain.includes('rain') || weatherMain.includes('thunder')
  })

  if (!nextWetSlot) {
    return 'Best dry window: Most of the day looks dry'
  }

  return `Best dry window: Until ${formatMalaysiaTime(nextWetSlot.dt * 1000)}`
}

function mapOpenWeatherAqiToBand(aqiIndex: number): AirBand {
  if (aqiIndex <= 2) {
    return 'Good'
  }

  if (aqiIndex === 3) {
    return 'Moderate'
  }

  return 'Poor'
}

function mapOpenWeatherAqiToScore(
  aqiIndex: number,
  pm25: number,
  pm10: number,
) {
  const indexScore = [25, 55, 85, 140, 220][aqiIndex - 1] ?? 60
  const particulateScore = Math.max(pm25 * 2.2, pm10 * 1.1)

  return Math.round(Math.max(indexScore, particulateScore))
}

function normalizeOpenWeatherForecast(
  data: OpenWeatherForecastResponse,
): ForecastDay[] {
  const groupedEntries = new Map<string, OpenWeatherForecastResponse['list']>()

  for (const entry of data.list) {
    const dateKey = formatMalaysiaDate(new Date(entry.dt * 1000))
    const existingEntries = groupedEntries.get(dateKey) ?? []
    existingEntries.push(entry)
    groupedEntries.set(dateKey, existingEntries)
  }

  return [...groupedEntries.entries()]
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .slice(0, 5)
    .map(([, entries]) => {
      const summaryEntry = entries.reduce((selected, current) => {
        const selectedScore =
          (selected.pop ?? 0) + ((selected.rain?.['3h'] ?? 0) > 0 ? 0.1 : 0)
        const currentScore =
          (current.pop ?? 0) + ((current.rain?.['3h'] ?? 0) > 0 ? 0.1 : 0)

        return currentScore > selectedScore ? current : selected
      })

      const high = Math.round(
        Math.max(...entries.map((entry) => entry.main.temp_max ?? entry.main.temp)),
      )
      const low = Math.round(
        Math.min(...entries.map((entry) => entry.main.temp_min ?? entry.main.temp)),
      )
      const rainChance = Math.round(
        Math.max(...entries.map((entry) => (entry.pop ?? 0) * 100)),
      )
      const humidity = Math.round(
        entries.reduce((total, entry) => total + entry.main.humidity, 0) / entries.length,
      )

      return {
        date: formatMalaysiaDate(new Date(entries[0]!.dt * 1000)),
        high,
        low,
        rainChance,
        humidity,
        summary: toTitleCase(summaryEntry.weather[0]?.description ?? 'Cloudy'),
      }
    })
}

function normalizeMalaysiaForecast(
  data: MalaysiaForecastItem[],
  fallback: ForecastDay[],
): ForecastDay[] {
  return [...data]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 5)
    .map((entry, index) => {
      const translatedSummary = getMalaysiaSummary(entry.summary_forecast)
      const rainChance = estimateRainChance(entry.summary_forecast)

      return {
        date: entry.date,
        high: entry.max_temp,
        low: entry.min_temp,
        rainChance,
        humidity:
          fallback[index]?.humidity ??
          estimateHumidity(entry.max_temp, entry.min_temp, rainChance),
        summary: translatedSummary,
      }
    })
}

function isWarningRelevant(
  warning: MalaysiaWarningItem,
  location: LiveLocationConfig,
) {
  const haystack = [
    warning.warning_issue.title_en,
    warning.warning_issue.title_bm,
    warning.heading_en,
    warning.heading_bm,
    warning.text_en,
    warning.text_bm,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return location.warningAliases.some((alias) =>
    haystack.includes(alias.toLowerCase()),
  )
}

function formatWarningWindow(validFrom: string, validTo: string) {
  return `${formatMalaysiaDateTime(validFrom)} - ${formatMalaysiaDateTime(validTo)}`
}

function normalizeMalaysiaWarnings(
  warnings: MalaysiaWarningItem[],
  location: LiveLocationConfig,
): WarningItem[] {
  return warnings
    .filter((warning) => isWarningRelevant(warning, location))
    .sort((left, right) => left.valid_from.localeCompare(right.valid_from))
    .slice(0, 3)
    .map((warning) => ({
      title:
        warning.heading_en ??
        warning.warning_issue.title_en ??
        warning.heading_bm ??
        warning.warning_issue.title_bm ??
        'Weather warning',
      severity: getSeverityFromWarning(warning),
      window: formatWarningWindow(warning.valid_from, warning.valid_to),
      message:
        warning.text_en ??
        warning.text_bm ??
        warning.instruction_en ??
        warning.instruction_bm ??
        'Follow the latest advisory from MET Malaysia.',
    }))
}

function buildOverview(snapshot: LocationSnapshot) {
  const firstForecast = snapshot.forecast[0]
  const warningLead = snapshot.warnings[0]

  const forecastText = firstForecast
    ? `The main weather signal today is ${firstForecast.summary.toLowerCase()}.`
    : 'Weather conditions are steady for now.'

  const airText =
    snapshot.airBand === 'Poor'
      ? 'Air quality is uncomfortable for longer outdoor activity.'
      : snapshot.airBand === 'Moderate'
        ? 'Air quality is acceptable for most people, but not ideal for a hard outdoor session.'
        : 'Air quality looks comfortable for most outdoor plans.'

  const warningText = warningLead
    ? `Keep an eye on ${warningLead.title.toLowerCase()}.`
    : 'No location-specific warnings are active at the moment.'

  return `${forecastText} ${airText} ${warningText}`
}

function buildHikeTip(snapshot: LocationSnapshot, target: string): HikeTip {
  const today = snapshot.forecast[0]
  const highestWarningSeverity = snapshot.warnings.reduce<Severity | null>(
    (current, warning) => {
      const severityWeight = {
        Monitor: 1,
        Watch: 2,
        Alert: 3,
      }

      if (!current) {
        return warning.severity
      }

      return severityWeight[warning.severity] > severityWeight[current]
        ? warning.severity
        : current
    },
    null,
  )

  let riskScore = 0

  if (highestWarningSeverity === 'Alert') {
    riskScore += 3
  } else if (highestWarningSeverity === 'Watch') {
    riskScore += 2
  } else if (highestWarningSeverity === 'Monitor') {
    riskScore += 1
  }

  if (snapshot.airBand === 'Poor' || snapshot.aqi >= 120) {
    riskScore += 2
  } else if (snapshot.airBand === 'Moderate' || snapshot.aqi >= 60) {
    riskScore += 1
  }

  if (today) {
    const loweredSummary = today.summary.toLowerCase()

    if (
      today.rainChance >= 70 ||
      loweredSummary.includes('thunder') ||
      loweredSummary.includes('storm')
    ) {
      riskScore += 2
    } else if (today.rainChance >= 45 || loweredSummary.includes('rain')) {
      riskScore += 1
    }
  }

  if (riskScore >= 4) {
    return {
      target,
      verdict: 'Skip',
      confidence: 84,
      title: 'Conditions are stacked against a comfortable hike.',
      reason:
        'Warnings, air quality, or rain timing all point toward a poor outdoor window. It is better to postpone or switch to an indoor backup plan.',
    }
  }

  if (riskScore >= 2) {
    return {
      target,
      verdict: 'Caution',
      confidence: 74,
      title: 'Possible, but only with tight timing and a backup plan.',
      reason:
        'You still have an outdoor window, but it gets weaker once rain risk or air quality starts slipping. Keep the outing early and flexible.',
    }
  }

  return {
    target,
    verdict: 'Go',
    confidence: 86,
    title: 'This is a reasonable outdoor window.',
    reason:
      'The current mix of forecast, air quality, and warnings does not show a strong reason to avoid the trip. Keep normal rain gear on hand and recheck later in the day.',
  }
}

async function fetchMalaysiaForecast(location: LiveLocationConfig) {
  const query = new URLSearchParams({
    ifilter: `${location.malaysiaLocationName}@location__location_name`,
    sort: 'date',
    limit: '7',
  })

  return fetchJson<MalaysiaForecastItem[]>(
    `${MALAYSIA_WEATHER_BASE_URL}/forecast?${query.toString()}`,
  )
}

async function fetchMalaysiaWarnings() {
  const query = new URLSearchParams({
    sort: '-warning_issue__issued',
    limit: '30',
  })

  return fetchJson<MalaysiaWarningItem[]>(
    `${MALAYSIA_WEATHER_BASE_URL}/warning?${query.toString()}`,
  )
}

async function fetchOpenWeatherForecast(
  location: LiveLocationConfig,
  apiKey: string,
) {
  const query = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    appid: apiKey,
    units: 'metric',
  })

  return fetchJson<OpenWeatherForecastResponse>(
    `${OPENWEATHER_BASE_URL}/forecast?${query.toString()}`,
  )
}

async function fetchOpenWeatherAir(
  location: LiveLocationConfig,
  apiKey: string,
) {
  const query = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    appid: apiKey,
  })

  return fetchJson<OpenWeatherAirResponse>(
    `${OPENWEATHER_BASE_URL}/air_pollution?${query.toString()}`,
  )
}

function getSourceFromProviders(
  providers: DashboardPayload['meta']['providers'],
): DashboardPayload['meta']['source'] {
  const sources = Object.values(providers)
  const liveCount = sources.filter((source) => source === 'live').length

  if (liveCount === 0) {
    return 'mock'
  }

  if (liveCount === sources.length) {
    return 'live'
  }

  return 'hybrid'
}

export async function buildDashboardPayload(
  locationKey: LocationKey,
): Promise<DashboardPayload> {
  const fallbackPayload = buildMockDashboardPayload(locationKey)
  const location = liveLocationConfig[locationKey]
  const snapshot = cloneSnapshot(fallbackPayload.snapshot)
  const providers: DashboardPayload['meta']['providers'] = {
    ...fallbackPayload.meta.providers,
  }

  const servedAt = new Date().toISOString()
  const openWeatherApiKey = process.env.OPENWEATHER_API_KEY

  const [malaysiaForecastResult, malaysiaWarningsResult, openWeatherForecastResult, openWeatherAirResult] =
    await Promise.allSettled([
      fetchMalaysiaForecast(location),
      fetchMalaysiaWarnings(),
      openWeatherApiKey
        ? fetchOpenWeatherForecast(location, openWeatherApiKey)
        : Promise.resolve(null),
      openWeatherApiKey
        ? fetchOpenWeatherAir(location, openWeatherApiKey)
        : Promise.resolve(null),
    ])

  if (
    malaysiaForecastResult.status === 'fulfilled' &&
    malaysiaForecastResult.value.length > 0
  ) {
    const malaysiaForecast = malaysiaForecastResult.value
    snapshot.forecast = normalizeMalaysiaForecast(malaysiaForecast, snapshot.forecast)
    providers.malaysiaForecast = 'live'

    if (malaysiaForecast[0]) {
      snapshot.nextRainWindow = buildNextRainWindowFromMalaysiaForecast(
        malaysiaForecast[0],
      )
    }
  }

  if (malaysiaWarningsResult.status === 'fulfilled') {
    snapshot.warnings = normalizeMalaysiaWarnings(
      malaysiaWarningsResult.value,
      location,
    )
    providers.malaysiaWarnings = 'live'
  }

  if (
    openWeatherForecastResult.status === 'fulfilled' &&
    openWeatherForecastResult.value
  ) {
    snapshot.forecast = normalizeOpenWeatherForecast(openWeatherForecastResult.value)
    snapshot.nextRainWindow = buildNextRainWindowFromOpenWeather(
      openWeatherForecastResult.value,
    )
    providers.openWeatherForecast = 'live'
  }

  if (openWeatherAirResult.status === 'fulfilled' && openWeatherAirResult.value) {
    const latestAirData = openWeatherAirResult.value.list[0]

    if (latestAirData) {
      const pm25 = latestAirData.components.pm2_5
      const pm10 = latestAirData.components.pm10
      const o3 = latestAirData.components.o3
      const no2 = latestAirData.components.no2
      const aqiIndex = latestAirData.main.aqi

      snapshot.aqi = mapOpenWeatherAqiToScore(aqiIndex, pm25, pm10)
      snapshot.airBand = mapOpenWeatherAqiToBand(aqiIndex)
      snapshot.pollutants = {
        pm25: Math.round(pm25),
        pm10: Math.round(pm10),
        o3: Math.round(o3),
        no2: Math.round(no2),
      }
      providers.openWeatherAir = 'live'
    }
  }

  const source = getSourceFromProviders(providers)

  if (source !== 'mock') {
    snapshot.updatedAt = servedAt
    snapshot.cacheAgeMinutes = 0
    snapshot.overview = buildOverview(snapshot)
    snapshot.hikeTip = buildHikeTip(snapshot, snapshot.hikeTip.target)
  }

  return {
    locationKey,
    locations: fallbackPayload.locations,
    snapshot,
    meta: {
      source,
      servedAt,
      cacheTtlMinutes: SERVER_CACHE_TTL_MINUTES,
      providers,
    },
  }
}
