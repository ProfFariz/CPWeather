import {
  isLocationKey,
  type AirBand,
  type DashboardErrorPayload,
  type DashboardPayload,
  type DashboardProviderSource,
  type DashboardSource,
  type ForecastDay,
  type HikeCueTone,
  type HikeTip,
  type HikeVerdict,
  type LocationOption,
  type LocationSnapshot,
  type PollutantBreakdown,
  type Severity,
  type WarningItem,
} from './dashboard.ts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isSeverity(value: unknown): value is Severity {
  return value === 'Monitor' || value === 'Watch' || value === 'Alert'
}

function isAirBand(value: unknown): value is AirBand {
  return value === 'Good' || value === 'Moderate' || value === 'Poor'
}

function isHikeVerdict(value: unknown): value is HikeVerdict {
  return value === 'Go' || value === 'Caution' || value === 'Skip'
}

function isHikeCueTone(value: unknown): value is HikeCueTone {
  return (
    value === 'positive' ||
    value === 'neutral' ||
    value === 'caution' ||
    value === 'danger'
  )
}

function isDashboardSource(value: unknown): value is DashboardSource {
  return value === 'mock' || value === 'hybrid' || value === 'live'
}

function isDashboardProviderSource(
  value: unknown,
): value is DashboardProviderSource {
  return value === 'live' || value === 'mock' || value === 'unavailable'
}

function isLocationOption(value: unknown): value is LocationOption {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.key === 'string' && isLocationKey(value.key) && typeof value.label === 'string'
}

function isForecastDay(value: unknown): value is ForecastDay {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.date === 'string' &&
    isFiniteNumber(value.high) &&
    isFiniteNumber(value.low) &&
    isFiniteNumber(value.rainChance) &&
    isFiniteNumber(value.humidity) &&
    typeof value.summary === 'string'
  )
}

function isWarningItem(value: unknown): value is WarningItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.title === 'string' &&
    isSeverity(value.severity) &&
    typeof value.window === 'string' &&
    typeof value.message === 'string'
  )
}

function isPollutantBreakdown(value: unknown): value is PollutantBreakdown {
  if (!isRecord(value)) {
    return false
  }

  return (
    isFiniteNumber(value.pm25) &&
    isFiniteNumber(value.pm10) &&
    isFiniteNumber(value.o3) &&
    isFiniteNumber(value.no2)
  )
}

function isHikeTip(value: unknown): value is HikeTip {
  if (!isRecord(value) || !Array.isArray(value.cues)) {
    return false
  }

  return (
    typeof value.target === 'string' &&
    isHikeVerdict(value.verdict) &&
    isFiniteNumber(value.confidence) &&
    typeof value.title === 'string' &&
    typeof value.reason === 'string' &&
    value.cues.every((cue) => {
      if (!isRecord(cue)) {
        return false
      }

      return typeof cue.label === 'string' && isHikeCueTone(cue.tone)
    })
  )
}

function isLocationSnapshot(value: unknown): value is LocationSnapshot {
  if (
    !isRecord(value) ||
    !Array.isArray(value.warnings) ||
    !Array.isArray(value.forecast)
  ) {
    return false
  }

  return (
    typeof value.label === 'string' &&
    typeof value.district === 'string' &&
    typeof value.updatedAt === 'string' &&
    isFiniteNumber(value.cacheAgeMinutes) &&
    typeof value.overview === 'string' &&
    typeof value.nextRainWindow === 'string' &&
    isFiniteNumber(value.currentTemp) &&
    typeof value.currentSummary === 'string' &&
    isFiniteNumber(value.aqi) &&
    isAirBand(value.airBand) &&
    isPollutantBreakdown(value.pollutants) &&
    isHikeTip(value.hikeTip) &&
    value.warnings.every(isWarningItem) &&
    value.forecast.every(isForecastDay)
  )
}

export function isDashboardPayload(value: unknown): value is DashboardPayload {
  if (!isRecord(value) || !Array.isArray(value.locations) || !isRecord(value.meta)) {
    return false
  }

  const providers = value.meta.providers

  if (!isRecord(providers)) {
    return false
  }

  return (
    typeof value.locationKey === 'string' &&
    isLocationKey(value.locationKey) &&
    value.locations.every(isLocationOption) &&
    isLocationSnapshot(value.snapshot) &&
    isDashboardSource(value.meta.source) &&
    typeof value.meta.servedAt === 'string' &&
    isFiniteNumber(value.meta.cacheTtlMinutes) &&
    isDashboardProviderSource(providers.openWeatherCurrent) &&
    isDashboardProviderSource(providers.openWeatherForecast) &&
    isDashboardProviderSource(providers.openWeatherAir) &&
    isDashboardProviderSource(providers.malaysiaForecast) &&
    isDashboardProviderSource(providers.malaysiaWarnings)
  )
}

export function isDashboardErrorPayload(
  value: unknown,
): value is DashboardErrorPayload {
  if (!isRecord(value) || !isRecord(value.error) || !isRecord(value.meta)) {
    return false
  }

  const isKnownCode =
    value.error.code === 'INVALID_LOCATION' ||
    value.error.code === 'METHOD_NOT_ALLOWED'

  return (
    isKnownCode &&
    typeof value.error.message === 'string' &&
    typeof value.meta.servedAt === 'string'
  )
}
