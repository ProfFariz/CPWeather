export type LocationKey = 'ipoh' | 'taiping' | 'lumut'
export type Severity = 'Monitor' | 'Watch' | 'Alert'
export type AirBand = 'Good' | 'Moderate' | 'Poor'
export type HikeVerdict = 'Go' | 'Caution' | 'Skip'
export type DashboardSource = 'mock' | 'live'

export type ForecastDay = {
  date: string
  high: number
  low: number
  rainChance: number
  humidity: number
  summary: string
}

export type WarningItem = {
  title: string
  severity: Severity
  window: string
  message: string
}

export type HikeTip = {
  target: string
  verdict: HikeVerdict
  confidence: number
  title: string
  reason: string
}

export type PollutantBreakdown = {
  pm25: number
  pm10: number
  o3: number
  no2: number
}

export type LocationOption = {
  key: LocationKey
  label: string
}

export type LocationSnapshot = {
  label: string
  district: string
  updatedAt: string
  cacheAgeMinutes: number
  overview: string
  nextRainWindow: string
  aqi: number
  airBand: AirBand
  pollutants: PollutantBreakdown
  hikeTip: HikeTip
  warnings: WarningItem[]
  forecast: ForecastDay[]
}

export type DashboardMeta = {
  source: DashboardSource
  servedAt: string
  cacheTtlMinutes: number
}

export type DashboardPayload = {
  locationKey: LocationKey
  locations: LocationOption[]
  snapshot: LocationSnapshot
  meta: DashboardMeta
}

export type DashboardErrorCode = 'INVALID_LOCATION' | 'METHOD_NOT_ALLOWED'

export type DashboardErrorPayload = {
  error: {
    code: DashboardErrorCode
    message: string
  }
  meta: {
    servedAt: string
  }
}

export const defaultLocationKey: LocationKey = 'ipoh'

export const locations: LocationOption[] = [
  { key: 'ipoh', label: 'Ipoh' },
  { key: 'taiping', label: 'Taiping' },
  { key: 'lumut', label: 'Lumut' },
]

export function isLocationKey(value: string): value is LocationKey {
  return locations.some((location) => location.key === value)
}
