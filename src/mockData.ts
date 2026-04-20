import {
  defaultLocationKey,
  locations,
  type AirBand,
  type DashboardPayload,
  type HikeVerdict,
  type LocationKey,
  type LocationSnapshot,
  type Severity,
} from './shared/dashboard.ts'

export const dashboardMocks = {
  tapah: {
    label: 'Tapah',
    district: 'Batang Padang, Perak',
    updatedAt: '2026-04-17T09:05:00+08:00',
    cacheAgeMinutes: 5,
    overview:
      'Cooler morning air gives way to brighter skies before convective rain starts building toward the late afternoon.',
    nextRainWindow: 'Best dry window: 8 AM to 2 PM',
    currentTemp: 28,
    aqi: 46,
    airBand: 'Good',
    pollutants: { pm25: 12, pm10: 21, o3: 14, no2: 6 },
    hikeTip: {
      target: 'Lata Iskandar route',
      verdict: 'Go',
      confidence: 82,
      title: 'This is a comfortable window for a short outdoor trip.',
      reason:
        'Air quality is good, the early part of the day stays steadier, and the stronger rain signal is still later in the afternoon.',
      cues: [
        { label: 'AQI 46 good', tone: 'positive' },
        { label: 'Long dry morning', tone: 'positive' },
        { label: 'Rain builds after 2 PM', tone: 'neutral' },
      ],
    },
    warnings: [
      {
        title: 'Late-afternoon storm pockets inland',
        severity: 'Monitor',
        window: '3 PM - 7 PM',
        message:
          'Road spray and brief thunder cells are the main concern once the higher ground starts clouding over.',
      },
    ],
    forecast: [
      {
        date: '2026-04-17',
        high: 31,
        low: 24,
        rainChance: 38,
        humidity: 76,
        summary: 'Bright morning, showers later',
      },
      {
        date: '2026-04-18',
        high: 30,
        low: 24,
        rainChance: 44,
        humidity: 78,
        summary: 'Humid with scattered rain',
      },
      {
        date: '2026-04-19',
        high: 31,
        low: 23,
        rainChance: 35,
        humidity: 74,
        summary: 'Patchy clouds',
      },
      {
        date: '2026-04-20',
        high: 32,
        low: 24,
        rainChance: 47,
        humidity: 77,
        summary: 'Late shower chance',
      },
      {
        date: '2026-04-21',
        high: 31,
        low: 24,
        rainChance: 51,
        humidity: 79,
        summary: 'Afternoon rain risk',
      },
    ],
  },
  ipoh: {
    label: 'Ipoh',
    district: 'Kinta, Perak',
    updatedAt: '2026-04-17T09:15:00+08:00',
    cacheAgeMinutes: 8,
    overview: 'Warm morning, sticky haze, and thunderstorms pushing in after 3 PM.',
    nextRainWindow: 'Best dry window: 9 AM to 1 PM',
    currentTemp: 29,
    aqi: 68,
    airBand: 'Moderate',
    pollutants: { pm25: 19, pm10: 33, o3: 17, no2: 9 },
    hikeTip: {
      target: 'Cameron Highlands',
      verdict: 'Caution',
      confidence: 71,
      title: 'Leave early if you still want the trip.',
      reason:
        'Air quality is acceptable for most people, but convective rain is likely by late afternoon and visibility can dip once mist builds up.',
      cues: [
        { label: 'AQI 68 moderate', tone: 'caution' },
        { label: 'Rain builds after 3 PM', tone: 'caution' },
        { label: 'Warning window 2 PM - 7 PM', tone: 'danger' },
      ],
    },
    warnings: [
      {
        title: 'Thunderstorm risk over inland districts',
        severity: 'Watch',
        window: '2 PM - 7 PM',
        message:
          'Short bursts of heavy rain are the main risk. Plan any long drive before the cloud build-up.',
      },
      {
        title: 'Haze pockets during the late morning',
        severity: 'Monitor',
        window: '10 AM - 1 PM',
        message:
          'Outdoor exercise is still possible, but sensitive groups should take breaks and hydrate early.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 33, low: 24, rainChance: 65, humidity: 80, summary: 'Thunderstorms by evening' },
      { date: '2026-04-18', high: 32, low: 24, rainChance: 55, humidity: 78, summary: 'Scattered showers' },
      { date: '2026-04-19', high: 31, low: 23, rainChance: 35, humidity: 74, summary: 'Cloudy break' },
      { date: '2026-04-20', high: 33, low: 24, rainChance: 42, humidity: 76, summary: 'Humid with isolated rain' },
      { date: '2026-04-21', high: 34, low: 24, rainChance: 58, humidity: 79, summary: 'Heat then late storm' },
    ],
  },
  taiping: {
    label: 'Taiping',
    district: 'Larut, Matang dan Selama, Perak',
    updatedAt: '2026-04-17T09:20:00+08:00',
    cacheAgeMinutes: 6,
    overview:
      'Classic Taiping pattern: cooler start, quick cloud growth, and rain odds rising fast by noon.',
    nextRainWindow: 'Best dry window: 8 AM to 11 AM',
    currentTemp: 27,
    aqi: 54,
    airBand: 'Moderate',
    pollutants: { pm25: 14, pm10: 27, o3: 13, no2: 7 },
    hikeTip: {
      target: 'Bukit Larut',
      verdict: 'Caution',
      confidence: 76,
      title: 'Good for a short climb, not a long one.',
      reason:
        'The air is decent, but steep afternoon rain probability means you should keep the outing compact and be off the trail early.',
      cues: [
        { label: 'Morning is the best slot', tone: 'positive' },
        { label: 'Rain by noon', tone: 'caution' },
        { label: 'Afternoon watch in place', tone: 'danger' },
      ],
    },
    warnings: [
      {
        title: 'Persistent afternoon rain cells',
        severity: 'Watch',
        window: '12 PM - 6 PM',
        message:
          'Expect slippery surfaces and sudden visibility drops near higher ground.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 31, low: 23, rainChance: 72, humidity: 84, summary: 'Rain by noon' },
      { date: '2026-04-18', high: 30, low: 23, rainChance: 68, humidity: 85, summary: 'Wet afternoon' },
      { date: '2026-04-19', high: 31, low: 22, rainChance: 48, humidity: 80, summary: 'Clouds with breaks' },
      { date: '2026-04-20', high: 32, low: 23, rainChance: 39, humidity: 77, summary: 'Mostly cloudy' },
      { date: '2026-04-21', high: 32, low: 23, rainChance: 61, humidity: 81, summary: 'Storm risk returns' },
    ],
  },
  lumut: {
    label: 'Lumut',
    district: 'Manjung, Perak',
    updatedAt: '2026-04-17T09:10:00+08:00',
    cacheAgeMinutes: 9,
    overview:
      'Sea breeze is keeping temperatures manageable, but coastal storms can still pop up after sunset.',
    nextRainWindow: 'Best dry window: 10 AM to 4 PM',
    currentTemp: 30,
    aqi: 42,
    airBand: 'Good',
    pollutants: { pm25: 11, pm10: 19, o3: 10, no2: 5 },
    hikeTip: {
      target: 'Teluk Batik coastal trail',
      verdict: 'Go',
      confidence: 84,
      title: 'This is your safest outdoor slot today.',
      reason:
        'Clearer air and a longer dry window make this the easiest location for an outdoor plan, as long as you wrap before dusk.',
      cues: [
        { label: 'AQI 42 good', tone: 'positive' },
        { label: 'Long dry window', tone: 'positive' },
        { label: 'Storm risk only after sunset', tone: 'neutral' },
      ],
    },
    warnings: [
      {
        title: 'Localized evening thunderclouds offshore',
        severity: 'Monitor',
        window: '6 PM - 9 PM',
        message:
          'Mostly a sunset issue, but beach visitors should keep an eye on lightning activity late in the day.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 31, low: 25, rainChance: 28, humidity: 73, summary: 'Mostly dry' },
      { date: '2026-04-18', high: 31, low: 25, rainChance: 33, humidity: 74, summary: 'Sea breeze clouds' },
      { date: '2026-04-19', high: 30, low: 25, rainChance: 22, humidity: 72, summary: 'Good beach window' },
      { date: '2026-04-20', high: 31, low: 25, rainChance: 37, humidity: 75, summary: 'Light coastal showers' },
      { date: '2026-04-21', high: 31, low: 25, rainChance: 44, humidity: 77, summary: 'Evening storm chance' },
    ],
  },
} satisfies Record<LocationKey, LocationSnapshot>

export const severityClasses: Record<Severity, string> = {
  Monitor: 'border-emerald-800/10 bg-emerald-900/5 text-emerald-950',
  Watch: 'border-amber-900/15 bg-amber-100/80 text-amber-950',
  Alert: 'border-rose-900/15 bg-rose-100/85 text-rose-950',
}

export const airBandClasses: Record<AirBand, string> = {
  Good: 'bg-emerald-950 text-emerald-50',
  Moderate: 'bg-amber-500 text-amber-950',
  Poor: 'bg-rose-700 text-rose-50',
}

export const hikeClasses: Record<HikeVerdict, string> = {
  Go: 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-900/10',
  Caution: 'bg-amber-100 text-amber-950 ring-1 ring-amber-900/10',
  Skip: 'bg-rose-100 text-rose-950 ring-1 ring-rose-900/10',
}

export function getDashboardSnapshot(
  locationKey: LocationKey = defaultLocationKey,
): LocationSnapshot {
  return dashboardMocks[locationKey]
}

export function buildMockDashboardPayload(
  locationKey: LocationKey = defaultLocationKey,
): DashboardPayload {
  return {
    locationKey,
    locations,
    snapshot: getDashboardSnapshot(locationKey),
    meta: {
      source: 'mock',
      servedAt: new Date().toISOString(),
      cacheTtlMinutes: 15,
      providers: {
        openWeatherForecast: 'mock',
        openWeatherAir: 'mock',
        malaysiaForecast: 'mock',
        malaysiaWarnings: 'mock',
      },
    },
  }
}
