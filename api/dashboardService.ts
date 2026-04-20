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

type OpenWeatherCurrentResponse = {
  dt: number
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
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

type WetSlotSignal = {
  startsAt: Date
  startsLabel: string
  hoursAway: number
  rainChance: number
  rainVolumeMm: number
  summary: string
  hasThunder: boolean
}

type WarningSignal = {
  title: string
  severity: Severity
  startsAt: Date
  endsAt: Date
  startsInHours: number
  endsInHours: number
  isActive: boolean
  mentionsThunder: boolean
  mentionsHeavyRain: boolean
  mentionsStrongWind: boolean
}

type HikeDecisionSignals = {
  now: Date
  nextWetSlot: WetSlotSignal | null
  heaviestWetSlot: WetSlotSignal | null
  wetSlotCount: number
  activeWarning: WarningSignal | null
  nextWarning: WarningSignal | null
  highestWarningSeverity: Severity | null
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

const severityWeight: Record<Severity, number> = {
  Monitor: 1,
  Watch: 2,
  Alert: 3,
}

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase())
}

function getHoursUntil(target: Date, now: Date) {
  return (target.getTime() - now.getTime()) / (1000 * 60 * 60)
}

function cloneSnapshot(snapshot: LocationSnapshot): LocationSnapshot {
  return {
    ...snapshot,
    pollutants: { ...snapshot.pollutants },
    hikeTip: {
      ...snapshot.hikeTip,
      cues: snapshot.hikeTip.cues.map((cue) => ({ ...cue })),
    },
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

function estimateCurrentTempFromForecastDay(day: ForecastDay | undefined) {
  if (!day) {
    return 28
  }

  return Math.round((day.high + day.low) / 2)
}

function getCurrentTempFromOpenWeatherForecast(
  data: OpenWeatherForecastResponse,
  now: Date,
) {
  const nearestEntry = data.list.reduce<
    OpenWeatherForecastResponse['list'][number] | null
  >((current, entry) => {
    if (!current) {
      return entry
    }

    const currentDistance = Math.abs(now.getTime() - current.dt * 1000)
    const nextDistance = Math.abs(now.getTime() - entry.dt * 1000)

    return nextDistance < currentDistance ? entry : current
  }, null)

  return nearestEntry ? Math.round(nearestEntry.main.temp) : null
}

function getCurrentSummaryFromOpenWeatherCurrent(
  data: OpenWeatherCurrentResponse,
) {
  return toTitleCase(data.weather[0]?.description ?? 'Current conditions steady')
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

function getRelevantMalaysiaWarnings(
  warnings: MalaysiaWarningItem[],
  location: LiveLocationConfig,
) {
  return warnings
    .filter((warning) => isWarningRelevant(warning, location))
    .sort((left, right) => left.valid_from.localeCompare(right.valid_from))
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

function getWarningTitle(warning: MalaysiaWarningItem) {
  return (
    warning.heading_en ??
    warning.warning_issue.title_en ??
    warning.heading_bm ??
    warning.warning_issue.title_bm ??
    'Weather warning'
  )
}

function buildWarningSignal(
  warning: MalaysiaWarningItem,
  now: Date,
): WarningSignal {
  const title = getWarningTitle(warning)
  const startsAt = new Date(warning.valid_from)
  const endsAt = new Date(warning.valid_to)
  const searchable = [
    title,
    warning.text_en,
    warning.text_bm,
    warning.instruction_en,
    warning.instruction_bm,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const startsInHours = getHoursUntil(startsAt, now)
  const endsInHours = getHoursUntil(endsAt, now)

  return {
    title,
    severity: getSeverityFromWarning(warning),
    startsAt,
    endsAt,
    startsInHours,
    endsInHours,
    isActive: startsInHours <= 0 && endsInHours > 0,
    mentionsThunder:
      searchable.includes('thunder') ||
      searchable.includes('ribut') ||
      searchable.includes('lightning'),
    mentionsHeavyRain:
      searchable.includes('heavy rain') ||
      searchable.includes('hujan lebat') ||
      searchable.includes('continuous rain'),
    mentionsStrongWind:
      searchable.includes('strong wind') ||
      searchable.includes('angin kencang') ||
      searchable.includes('winds'),
  }
}

function buildWarningDecisionSignals(
  warnings: MalaysiaWarningItem[],
  now: Date,
) {
  const warningSignals = warnings.map((warning) => buildWarningSignal(warning, now))
  const activeWarning =
    warningSignals
      .filter((warning) => warning.isActive)
      .sort(
        (left, right) =>
          severityWeight[right.severity] - severityWeight[left.severity],
      )[0] ?? null

  const nextWarning =
    warningSignals
      .filter((warning) => warning.startsInHours > 0)
      .sort((left, right) => left.startsInHours - right.startsInHours)[0] ?? null

  const highestWarningSeverity = warningSignals.reduce<Severity | null>(
    (current, warning) => {
      if (!current) {
        return warning.severity
      }

      return severityWeight[warning.severity] > severityWeight[current]
        ? warning.severity
        : current
    },
    null,
  )

  return {
    activeWarning,
    nextWarning,
    highestWarningSeverity,
  }
}

function normalizeMalaysiaWarnings(
  warnings: MalaysiaWarningItem[],
  location: LiveLocationConfig,
): WarningItem[] {
  return getRelevantMalaysiaWarnings(warnings, location)
    .slice(0, 3)
    .map((warning) => ({
      title: getWarningTitle(warning),
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

function hasWetWeatherSignal(entry: OpenWeatherForecastResponse['list'][number]) {
  const rainChance = Math.round((entry.pop ?? 0) * 100)
  const rainVolumeMm = entry.rain?.['3h'] ?? 0
  const description = entry.weather[0]?.description.toLowerCase() ?? ''
  const main = entry.weather[0]?.main.toLowerCase() ?? ''

  return (
    rainChance >= 45 ||
    rainVolumeMm >= 0.2 ||
    description.includes('rain') ||
    description.includes('drizzle') ||
    description.includes('thunder') ||
    main.includes('rain') ||
    main.includes('thunder')
  )
}

function buildWetSlotSignal(
  entry: OpenWeatherForecastResponse['list'][number],
  now: Date,
): WetSlotSignal {
  const startsAt = new Date(entry.dt * 1000)
  const summary = toTitleCase(entry.weather[0]?.description ?? 'Cloudy')
  const hasThunder = summary.toLowerCase().includes('thunder')

  return {
    startsAt,
    startsLabel: formatMalaysiaTime(startsAt),
    hoursAway: getHoursUntil(startsAt, now),
    rainChance: Math.round((entry.pop ?? 0) * 100),
    rainVolumeMm: Number((entry.rain?.['3h'] ?? 0).toFixed(1)),
    summary,
    hasThunder,
  }
}

function buildWetSlotDecisionSignals(
  data: OpenWeatherForecastResponse,
  now: Date,
) {
  const todayKey = formatMalaysiaDate(now)
  const upcomingTodayEntries = data.list.filter((entry) => {
    const entryDate = new Date(entry.dt * 1000)

    return (
      formatMalaysiaDate(entryDate) === todayKey &&
      entryDate.getTime() >= now.getTime()
    )
  })

  const wetSlots = upcomingTodayEntries
    .filter((entry) => hasWetWeatherSignal(entry))
    .map((entry) => buildWetSlotSignal(entry, now))

  const heaviestWetSlot =
    wetSlots.reduce<WetSlotSignal | null>((current, slot) => {
      const currentScore =
        (current?.rainChance ?? 0) +
        (current?.rainVolumeMm ?? 0) * 10 +
        ((current?.hasThunder ?? false) ? 30 : 0)
      const nextScore =
        slot.rainChance + slot.rainVolumeMm * 10 + (slot.hasThunder ? 30 : 0)

      if (!current || nextScore > currentScore) {
        return slot
      }

      return current
    }, null) ?? null

  return {
    nextWetSlot: wetSlots[0] ?? null,
    heaviestWetSlot,
    wetSlotCount: wetSlots.length,
  }
}

function formatWetSlotCue(slot: WetSlotSignal | null) {
  if (!slot) {
    return 'No meaningful rain band is showing for the rest of today.'
  }

  if (slot.hoursAway <= 1) {
    return `Rain risk is arriving now and looks strongest around ${slot.startsLabel}.`
  }

  if (slot.hoursAway <= 3) {
    return `The next rain band is due around ${slot.startsLabel}.`
  }

  return `The next meaningful rain risk is around ${slot.startsLabel}.`
}

function buildRainCueLabel(slot: WetSlotSignal | null) {
  if (!slot) {
    return {
      label: 'No major rain band today',
      tone: 'positive' as const,
    }
  }

  if (slot.hoursAway <= 1) {
    return {
      label: `Rain arriving now`,
      tone: 'danger' as const,
    }
  }

  if (slot.hoursAway <= 3) {
    return {
      label: `Rain around ${slot.startsLabel}`,
      tone: slot.hasThunder || slot.rainChance >= 80 ? ('danger' as const) : ('caution' as const),
    }
  }

  return {
    label: `Rain later ${slot.startsLabel}`,
    tone: 'neutral' as const,
  }
}

function buildWarningCueLabel(
  activeWarning: WarningSignal | null,
  nextWarning: WarningSignal | null,
) {
  if (activeWarning) {
    return {
      label: `${activeWarning.title} active now`,
      tone:
        severityWeight[activeWarning.severity] >= severityWeight.Watch ||
        activeWarning.mentionsThunder ||
        activeWarning.mentionsHeavyRain ||
        activeWarning.mentionsStrongWind
          ? ('danger' as const)
          : ('caution' as const),
    }
  }

  if (nextWarning && nextWarning.startsInHours <= 6) {
    return {
      label: `${nextWarning.title} at ${formatMalaysiaTime(nextWarning.startsAt)}`,
      tone: 'caution' as const,
    }
  }

  return {
    label: 'No active warning',
    tone: 'positive' as const,
  }
}

function buildAirCueLabel(snapshot: LocationSnapshot) {
  if (snapshot.airBand === 'Poor' || snapshot.aqi >= 120) {
    return {
      label: `AQI ${snapshot.aqi} poor`,
      tone: 'danger' as const,
    }
  }

  if (snapshot.airBand === 'Moderate' || snapshot.aqi >= 60) {
    return {
      label: `AQI ${snapshot.aqi} moderate`,
      tone: 'caution' as const,
    }
  }

  return {
    label: `AQI ${snapshot.aqi} good`,
    tone: 'positive' as const,
  }
}

function buildOverview(snapshot: LocationSnapshot) {
  const firstForecast = snapshot.forecast[0]
  const warningLead = snapshot.warnings[0]
  const currentText = `Current conditions look ${snapshot.currentSummary.toLowerCase()}.`

  const forecastText = firstForecast
    ? `The broader trend today is ${firstForecast.summary.toLowerCase()}.`
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

  return `${currentText} ${forecastText} ${airText} ${warningText}`
}

function buildHikeTip(
  snapshot: LocationSnapshot,
  target: string,
  signals?: HikeDecisionSignals,
): HikeTip {
  const today = snapshot.forecast[0]
  const fallbackHighestWarningSeverity = snapshot.warnings.reduce<Severity | null>(
    (current, warning) => {
      if (!current) {
        return warning.severity
      }

      return severityWeight[warning.severity] > severityWeight[current]
        ? warning.severity
        : current
    },
    null,
  )

  const highestWarningSeverity =
    signals?.highestWarningSeverity ?? fallbackHighestWarningSeverity
  const activeWarning = signals?.activeWarning ?? null
  const nextWarning = signals?.nextWarning ?? null
  const nextWetSlot = signals?.nextWetSlot ?? null
  const heaviestWetSlot = signals?.heaviestWetSlot ?? null
  const wetSlotCount = signals?.wetSlotCount ?? 0

  const poorAir = snapshot.airBand === 'Poor' || snapshot.aqi >= 120
  const moderateAir =
    snapshot.airBand === 'Moderate' || (snapshot.aqi >= 60 && snapshot.aqi < 120)
  const thunderSummary = today
    ? today.summary.toLowerCase().includes('thunder') ||
      today.summary.toLowerCase().includes('storm')
    : false
  const nearTermHeavyRain =
    nextWetSlot !== null &&
    nextWetSlot.hoursAway <= 3 &&
    (nextWetSlot.hasThunder ||
      nextWetSlot.rainChance >= 80 ||
      nextWetSlot.rainVolumeMm >= 3)
  const shortOutdoorWindow =
    nextWetSlot !== null &&
    nextWetSlot.hoursAway <= 5 &&
    (nextWetSlot.rainChance >= 55 || nextWetSlot.rainVolumeMm >= 1)
  const warningStartsSoon =
    nextWarning !== null &&
    nextWarning.startsInHours <= 4
  const activeStormWarning =
    activeWarning !== null &&
    (activeWarning.mentionsThunder ||
      activeWarning.mentionsHeavyRain ||
      activeWarning.mentionsStrongWind)
  const laterTodayTurnsWet =
    wetSlotCount >= 2 ||
    (heaviestWetSlot !== null &&
      heaviestWetSlot.hoursAway <= 8 &&
      (heaviestWetSlot.rainChance >= 70 || heaviestWetSlot.rainVolumeMm >= 4))
  const warningCueLabel = buildWarningCueLabel(activeWarning, nextWarning)
  const rainCueLabel = buildRainCueLabel(nextWetSlot)
  const airCueLabel = buildAirCueLabel(snapshot)

  if (poorAir) {
    return {
      target,
      verdict: 'Skip',
      confidence: 88,
      title: 'Air quality is too rough for a proper hike.',
      reason: `AQI is ${snapshot.aqi}, which is a poor reading for a strenuous climb or long exposed walk. Wait for cleaner air before treating this as a hiking day.`,
      cues: [airCueLabel, warningCueLabel, rainCueLabel],
    }
  }

  if (
    highestWarningSeverity === 'Alert' ||
    (activeStormWarning && nearTermHeavyRain) ||
    (activeWarning !== null &&
      severityWeight[activeWarning.severity] >= severityWeight.Watch)
  ) {
    const warningName = activeWarning?.title ?? 'weather warning'
    const rainCue = formatWetSlotCue(nextWetSlot)

    return {
      target,
      verdict: 'Skip',
      confidence: 90,
      title: 'Active storm risk makes this a poor hiking window.',
      reason: `${warningName} is already active for this area. ${rainCue} For an exposed route, that is too tight a margin to recommend a hike.`,
      cues: [warningCueLabel, rainCueLabel, airCueLabel],
    }
  }

  if (
    activeWarning !== null ||
    warningStartsSoon ||
    nearTermHeavyRain ||
    moderateAir ||
    thunderSummary ||
    shortOutdoorWindow ||
    laterTodayTurnsWet
  ) {
    const warningCue =
      activeWarning !== null
        ? `${activeWarning.title} is active now`
        : nextWarning !== null
          ? `${nextWarning.title} starts around ${formatMalaysiaTime(nextWarning.startsAt)}`
          : null

    const rainCue = nextWetSlot
      ? `The next rain band is due around ${nextWetSlot.startsLabel}`
      : 'Rain risk still builds later in the day'

    return {
      target,
      verdict: 'Caution',
      confidence: activeWarning !== null || warningStartsSoon || nearTermHeavyRain ? 81 : 76,
      title: 'There is a usable window, but it closes later today.',
      reason: warningCue
        ? `${warningCue}, and ${rainCue.toLowerCase()}. Keep the route short, start early, and stay ready to turn back once the weather starts shifting.`
        : `${rainCue}. Keep the route short, start early, and stay ready to turn back once the weather starts shifting.`,
      cues: [warningCueLabel, rainCueLabel, airCueLabel],
    }
  }

  return {
    target,
    verdict: 'Go',
    confidence: 84,
    title: 'The next several hours look workable for a hike.',
    reason: `No location-specific warning is active, AQI is ${snapshot.aqi}, and ${formatWetSlotCue(nextWetSlot).toLowerCase()} Recheck once before you head out and keep normal rain gear with you.`,
    cues: [warningCueLabel, airCueLabel, rainCueLabel],
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

async function fetchOpenWeatherCurrent(
  location: LiveLocationConfig,
  apiKey: string,
) {
  const query = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    appid: apiKey,
    units: 'metric',
  })

  return fetchJson<OpenWeatherCurrentResponse>(
    `${OPENWEATHER_BASE_URL}/weather?${query.toString()}`,
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

  const now = new Date()
  const servedAt = new Date().toISOString()
  const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
  let warningSignals = {
    activeWarning: null as WarningSignal | null,
    nextWarning: null as WarningSignal | null,
    highestWarningSeverity: null as Severity | null,
  }
  let wetSignals = {
    nextWetSlot: null as WetSlotSignal | null,
    heaviestWetSlot: null as WetSlotSignal | null,
    wetSlotCount: 0,
  }

  const [
    malaysiaForecastResult,
    malaysiaWarningsResult,
    openWeatherCurrentResult,
    openWeatherForecastResult,
    openWeatherAirResult,
  ] =
    await Promise.allSettled([
      fetchMalaysiaForecast(location),
      fetchMalaysiaWarnings(),
      openWeatherApiKey
        ? fetchOpenWeatherCurrent(location, openWeatherApiKey)
        : Promise.resolve(null),
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
    snapshot.currentTemp = estimateCurrentTempFromForecastDay(snapshot.forecast[0])
    snapshot.currentSummary = snapshot.forecast[0]?.summary ?? snapshot.currentSummary
    providers.malaysiaForecast = 'live'

    if (malaysiaForecast[0]) {
      snapshot.nextRainWindow = buildNextRainWindowFromMalaysiaForecast(
        malaysiaForecast[0],
      )
    }
  }

  if (malaysiaWarningsResult.status === 'fulfilled') {
    const relevantWarnings = getRelevantMalaysiaWarnings(
      malaysiaWarningsResult.value,
      location,
    )

    snapshot.warnings = normalizeMalaysiaWarnings(malaysiaWarningsResult.value, location)
    warningSignals = buildWarningDecisionSignals(relevantWarnings, now)
    providers.malaysiaWarnings = 'live'
  }

  if (
    openWeatherCurrentResult.status === 'fulfilled' &&
    openWeatherCurrentResult.value
  ) {
    snapshot.currentTemp = Math.round(openWeatherCurrentResult.value.main.temp)
    snapshot.currentSummary = getCurrentSummaryFromOpenWeatherCurrent(
      openWeatherCurrentResult.value,
    )
    providers.openWeatherCurrent = 'live'
  }

  if (
    openWeatherForecastResult.status === 'fulfilled' &&
    openWeatherForecastResult.value
  ) {
    snapshot.forecast = normalizeOpenWeatherForecast(openWeatherForecastResult.value)
    if (providers.openWeatherCurrent !== 'live') {
      snapshot.currentTemp =
        getCurrentTempFromOpenWeatherForecast(openWeatherForecastResult.value, now) ??
        estimateCurrentTempFromForecastDay(snapshot.forecast[0])
      snapshot.currentSummary = snapshot.forecast[0]?.summary ?? snapshot.currentSummary
    }
    snapshot.nextRainWindow = buildNextRainWindowFromOpenWeather(
      openWeatherForecastResult.value,
    )
    wetSignals = buildWetSlotDecisionSignals(openWeatherForecastResult.value, now)
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
    snapshot.hikeTip = buildHikeTip(snapshot, snapshot.hikeTip.target, {
      now,
      nextWetSlot: wetSignals.nextWetSlot,
      heaviestWetSlot: wetSignals.heaviestWetSlot,
      wetSlotCount: wetSignals.wetSlotCount,
      activeWarning: warningSignals.activeWarning,
      nextWarning: warningSignals.nextWarning,
      highestWarningSeverity: warningSignals.highestWarningSeverity,
    })
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
