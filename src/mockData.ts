import {
  defaultLocationKey,
  type DashboardLocale,
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
    currentSummary: 'Bright morning with gentle cloud cover',
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
    currentSummary: 'Humid with brighter breaks',
    aqi: 68,
    airBand: 'Moderate',
    pollutants: { pm25: 19, pm10: 33, o3: 17, no2: 9 },
    hikeTip: {
      target: 'Kledang Hill route',
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
  'cameron-highlands': {
    label: 'Cameron Highlands',
    district: 'Tanah Rata, Pahang',
    updatedAt: '2026-04-17T09:10:00+08:00',
    cacheAgeMinutes: 6,
    overview:
      'Cool highland air keeps the temperature comfortable, but mist and sudden light rain can arrive quickly on exposed ridges.',
    nextRainWindow: 'Best dry window: 8 AM to 1 PM',
    currentTemp: 22,
    currentSummary: 'Light drizzle with cool mist',
    aqi: 42,
    airBand: 'Good',
    pollutants: { pm25: 11, pm10: 20, o3: 12, no2: 5 },
    hikeTip: {
      target: 'Cameron Highlands ridge walk',
      verdict: 'Caution',
      confidence: 72,
      title: 'A short route is workable if visibility stays open.',
      reason:
        'The air is clean and the temperature is comfortable, but highland mist and light rain can reduce visibility quickly after lunch.',
      cues: [
        { label: 'AQI 42 good', tone: 'positive' },
        { label: 'Cool trail temperature', tone: 'positive' },
        { label: 'Mist and drizzle risk', tone: 'caution' },
      ],
    },
    warnings: [
      {
        title: 'Highland mist and passing rain',
        severity: 'Monitor',
        window: '1 PM - 6 PM',
        message:
          'Keep the route short and avoid exposed viewpoints if cloud cover thickens.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 24, low: 17, rainChance: 58, humidity: 88, summary: 'Cool with light rain' },
      { date: '2026-04-18', high: 23, low: 17, rainChance: 62, humidity: 89, summary: 'Mist and showers' },
      { date: '2026-04-19', high: 24, low: 16, rainChance: 44, humidity: 84, summary: 'Cloudy bright breaks' },
      { date: '2026-04-20', high: 25, low: 17, rainChance: 49, humidity: 85, summary: 'Drizzle later' },
      { date: '2026-04-21', high: 24, low: 17, rainChance: 57, humidity: 87, summary: 'Wet highland afternoon' },
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
    currentSummary: 'Clouds building over the hills',
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
    currentSummary: 'Mostly bright with a sea breeze',
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
  gopeng: {
    label: 'Gopeng',
    district: 'Kampar, Perak',
    updatedAt: '2026-04-17T09:12:00+08:00',
    cacheAgeMinutes: 7,
    overview:
      'The valley starts calmer in the morning, but cloud build-up around the limestone belt can flip the cave and forest window quickly by afternoon.',
    nextRainWindow: 'Best dry window: 8 AM to 1 PM',
    currentTemp: 28,
    currentSummary: 'Warm morning with lighter valley haze',
    aqi: 58,
    airBand: 'Moderate',
    pollutants: { pm25: 16, pm10: 29, o3: 15, no2: 7 },
    hikeTip: {
      target: 'Gua Tempurung route',
      verdict: 'Caution',
      confidence: 78,
      title: 'This works best as an early half-day outing.',
      reason:
        'The early slot is still manageable, but humidity and afternoon storm build-up can make the route feel heavier later in the day.',
      cues: [
        { label: 'AQI 58 moderate', tone: 'caution' },
        { label: 'Better before 1 PM', tone: 'positive' },
        { label: 'Storm chance later', tone: 'caution' },
      ],
    },
    warnings: [
      {
        title: 'Late-afternoon thunder cells near the valley rim',
        severity: 'Monitor',
        window: '2 PM - 6 PM',
        message:
          'Keep cave and river plans early, as lightning pockets can build around the surrounding hills after lunch.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 32, low: 24, rainChance: 56, humidity: 79, summary: 'Warm with storm risk later' },
      { date: '2026-04-18', high: 31, low: 24, rainChance: 52, humidity: 77, summary: 'Humid with scattered rain' },
      { date: '2026-04-19', high: 31, low: 23, rainChance: 36, humidity: 74, summary: 'Cloudy breaks' },
      { date: '2026-04-20', high: 32, low: 24, rainChance: 47, humidity: 76, summary: 'Late shower chance' },
      { date: '2026-04-21', high: 32, low: 24, rainChance: 61, humidity: 80, summary: 'Storm band returns' },
    ],
  },
  gerik: {
    label: 'Gerik',
    district: 'Hulu Perak, Perak',
    updatedAt: '2026-04-17T09:08:00+08:00',
    cacheAgeMinutes: 6,
    overview:
      'Royal Belum holds a cooler start than the lowlands, but rain cells over the forest edge can still become heavy once the afternoon develops.',
    nextRainWindow: 'Best dry window: 7 AM to 12 PM',
    currentTemp: 26,
    currentSummary: 'Cooler rainforest morning',
    aqi: 34,
    airBand: 'Good',
    pollutants: { pm25: 9, pm10: 17, o3: 9, no2: 4 },
    hikeTip: {
      target: 'Royal Belum trail',
      verdict: 'Go',
      confidence: 83,
      title: 'This is one of the better outdoor windows in the state.',
      reason:
        'Air stays cleaner here than most other locations, and the usable forest window usually lasts until midday if you start early.',
      cues: [
        { label: 'AQI 34 good', tone: 'positive' },
        { label: 'Strong early window', tone: 'positive' },
        { label: 'Watch rain after noon', tone: 'neutral' },
      ],
    },
    warnings: [
      {
        title: 'Forest-edge rain pockets after midday',
        severity: 'Monitor',
        window: '1 PM - 5 PM',
        message:
          'Trails deeper into the park can turn slippery after lunch, so longer treks should wrap before the afternoon wet phase.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 30, low: 22, rainChance: 41, humidity: 83, summary: 'Cooler start, showers later' },
      { date: '2026-04-18', high: 29, low: 22, rainChance: 49, humidity: 84, summary: 'Rain over the forest edge' },
      { date: '2026-04-19', high: 30, low: 21, rainChance: 34, humidity: 80, summary: 'Cloudy with brighter gaps' },
      { date: '2026-04-20', high: 30, low: 22, rainChance: 45, humidity: 82, summary: 'Afternoon rain risk' },
      { date: '2026-04-21', high: 29, low: 22, rainChance: 53, humidity: 85, summary: 'Wet forest afternoon' },
    ],
  },
  'kampong-gajah': {
    label: 'Kampong Gajah',
    district: 'Perak Tengah, Perak',
    updatedAt: '2026-04-17T09:16:00+08:00',
    cacheAgeMinutes: 7,
    overview:
      'River plain heat builds steadily through the day, but the morning still holds a calmer outdoor window before heavier inland cells form later.',
    nextRainWindow: 'Best dry window: 8 AM to 12 PM',
    currentTemp: 30,
    currentSummary: 'Warm river air with scattered bright cloud',
    aqi: 49,
    airBand: 'Good',
    pollutants: { pm25: 13, pm10: 24, o3: 12, no2: 6 },
    hikeTip: {
      target: 'Bukit Tunggal',
      verdict: 'Caution',
      confidence: 78,
      title: 'The morning still works better than the later day here.',
      reason:
        'Air quality stays comfortable, but lowland humidity and inland rain build-up can make the outdoor window close quickly after midday.',
      cues: [
        { label: 'AQI 49 good', tone: 'positive' },
        { label: 'Best before noon', tone: 'positive' },
        { label: 'Rain builds later inland', tone: 'caution' },
      ],
    },
    warnings: [
      {
        title: 'Late-day thunder cells across Perak Tengah',
        severity: 'Monitor',
        window: '2 PM - 6 PM',
        message:
          'Short riverside outings still work early, but later storms can spread in quickly and make exposed stretches less comfortable.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 32, low: 24, rainChance: 48, humidity: 79, summary: 'Warm with later showers' },
      { date: '2026-04-18', high: 32, low: 24, rainChance: 45, humidity: 78, summary: 'Humid river plain cloud' },
      { date: '2026-04-19', high: 33, low: 24, rainChance: 33, humidity: 74, summary: 'Brighter morning window' },
      { date: '2026-04-20', high: 32, low: 24, rainChance: 42, humidity: 77, summary: 'Afternoon shower chance' },
      { date: '2026-04-21', high: 31, low: 24, rainChance: 56, humidity: 80, summary: 'Storm risk returns' },
    ],
  },
  sungkai: {
    label: 'Sungkai',
    district: 'Batang Padang, Perak',
    updatedAt: '2026-04-17T09:18:00+08:00',
    cacheAgeMinutes: 5,
    overview:
      'The foothill weather is usable through the morning, but steamier air and later thunder pockets make the park feel much less forgiving after lunch.',
    nextRainWindow: 'Best dry window: 8 AM to 1 PM',
    currentTemp: 29,
    currentSummary: 'Warm foothill air with brighter patches',
    aqi: 47,
    airBand: 'Good',
    pollutants: { pm25: 13, pm10: 22, o3: 12, no2: 5 },
    hikeTip: {
      target: 'Sungai Klah route',
      verdict: 'Caution',
      confidence: 79,
      title: 'The first half of the day is the safest window here.',
      reason:
        'The morning looks workable, but rain and thunder build faster over the surrounding hills once the day heats up.',
      cues: [
        { label: 'AQI 47 good', tone: 'positive' },
        { label: 'Morning slot is best', tone: 'positive' },
        { label: 'Storm pockets later', tone: 'caution' },
      ],
    },
    warnings: [
      {
        title: 'Afternoon thunderstorm build-up over the foothills',
        severity: 'Watch',
        window: '2 PM - 6 PM',
        message:
          'Roadside spray and lightning are the main concerns later in the day, so keep the outing early and flexible.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 32, low: 24, rainChance: 59, humidity: 78, summary: 'Heat, then storm pockets' },
      { date: '2026-04-18', high: 31, low: 24, rainChance: 54, humidity: 79, summary: 'Scattered late rain' },
      { date: '2026-04-19', high: 31, low: 23, rainChance: 39, humidity: 75, summary: 'Warm with cloud breaks' },
      { date: '2026-04-20', high: 32, low: 24, rainChance: 46, humidity: 77, summary: 'Humid afternoon risk' },
      { date: '2026-04-21', high: 32, low: 24, rainChance: 63, humidity: 81, summary: 'Storms return late' },
    ],
  },
  'teluk-intan': {
    label: 'Teluk Intan',
    district: 'Hilir Perak, Perak',
    updatedAt: '2026-04-17T09:14:00+08:00',
    cacheAgeMinutes: 8,
    overview:
      'Lowland river heat builds steadily here, but the coastward air still gives you a usable morning window before heavier cloud bands form later.',
    nextRainWindow: 'Best dry window: 8 AM to 12 PM',
    currentTemp: 30,
    currentSummary: 'Warm river breeze with light cloud cover',
    aqi: 52,
    airBand: 'Moderate',
    pollutants: { pm25: 15, pm10: 28, o3: 13, no2: 6 },
    hikeTip: {
      target: 'Kuala Gula boardwalk',
      verdict: 'Caution',
      confidence: 77,
      title: 'A shorter coastal nature window still works this morning.',
      reason:
        'The early stretch is manageable, but humidity rises quickly and rain bands can close the outdoor window faster later in the day.',
      cues: [
        { label: 'AQI 52 moderate', tone: 'caution' },
        { label: 'Dry slot before noon', tone: 'positive' },
        { label: 'Late rain band inland', tone: 'caution' },
      ],
    },
    warnings: [
      {
        title: 'Localized late-day rain cells over Hilir Perak',
        severity: 'Monitor',
        window: '3 PM - 7 PM',
        message:
          'Short outdoor loops still work early, but later rain can spread in from inland districts and reduce visibility quickly.',
      },
    ],
    forecast: [
      { date: '2026-04-17', high: 32, low: 24, rainChance: 51, humidity: 79, summary: 'Warm with later showers' },
      { date: '2026-04-18', high: 31, low: 24, rainChance: 48, humidity: 78, summary: 'Humid coastal cloud' },
      { date: '2026-04-19', high: 32, low: 24, rainChance: 34, humidity: 75, summary: 'Brighter river morning' },
      { date: '2026-04-20', high: 32, low: 24, rainChance: 43, humidity: 77, summary: 'Late shower chance' },
      { date: '2026-04-21', high: 31, low: 24, rainChance: 57, humidity: 80, summary: 'Rain band returns' },
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
  const snapshot = dashboardMocks[locationKey]

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

export function buildMockDashboardPayload(
  locationKey: LocationKey = defaultLocationKey,
  _locale: DashboardLocale = 'en',
): DashboardPayload {
  void _locale

  return {
    locationKey,
    locations,
    snapshot: getDashboardSnapshot(locationKey),
    meta: {
      source: 'mock',
      servedAt: new Date().toISOString(),
      cacheTtlMinutes: 15,
      providers: {
        openWeatherCurrent: 'mock',
        openWeatherForecast: 'mock',
        openWeatherAir: 'mock',
        malaysiaForecast: 'mock',
        malaysiaWarnings: 'mock',
      },
    },
  }
}
