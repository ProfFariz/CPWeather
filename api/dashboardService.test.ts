import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { buildDashboardPayload } from './dashboardService.ts'

const FIXED_NOW = new Date('2026-04-20T09:00:00+08:00')

type ProviderScenario = {
  malaysiaForecast: unknown
  malaysiaWarnings: unknown
  openWeatherCurrent: unknown
  openWeatherForecast: unknown
  openWeatherAir: unknown
}

function toUnix(value: string) {
  return Math.floor(new Date(value).getTime() / 1000)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function buildMalaysiaForecast(locationName: string, summary = 'Tiada hujan') {
  return [
    {
      location: {
        location_id: '1',
        location_name: locationName,
      },
      date: '2026-04-20',
      morning_forecast: summary,
      afternoon_forecast: summary,
      night_forecast: summary,
      summary_forecast: summary,
      summary_when: 'pagi',
      min_temp: 24,
      max_temp: 31,
    },
    {
      location: {
        location_id: '1',
        location_name: locationName,
      },
      date: '2026-04-21',
      morning_forecast: 'Hujan di satu dua tempat',
      afternoon_forecast: 'Hujan di satu dua tempat',
      night_forecast: 'Tiada hujan',
      summary_forecast: 'Hujan di satu dua tempat',
      summary_when: 'petang',
      min_temp: 24,
      max_temp: 31,
    },
    {
      location: {
        location_id: '1',
        location_name: locationName,
      },
      date: '2026-04-22',
      morning_forecast: 'Tiada hujan',
      afternoon_forecast: 'Tiada hujan',
      night_forecast: 'Tiada hujan',
      summary_forecast: 'Tiada hujan',
      summary_when: 'malam',
      min_temp: 23,
      max_temp: 32,
    },
    {
      location: {
        location_id: '1',
        location_name: locationName,
      },
      date: '2026-04-23',
      morning_forecast: 'Tiada hujan',
      afternoon_forecast: 'Hujan',
      night_forecast: 'Tiada hujan',
      summary_forecast: 'Hujan',
      summary_when: 'petang',
      min_temp: 24,
      max_temp: 32,
    },
    {
      location: {
        location_id: '1',
        location_name: locationName,
      },
      date: '2026-04-24',
      morning_forecast: 'Tiada hujan',
      afternoon_forecast: 'Tiada hujan',
      night_forecast: 'Tiada hujan',
      summary_forecast: 'Tiada hujan',
      summary_when: 'malam',
      min_temp: 24,
      max_temp: 31,
    },
  ]
}

function buildOpenWeatherAir(aqiIndex: number) {
  return {
    list: [
      {
        dt: toUnix('2026-04-20T09:00:00+08:00'),
        main: {
          aqi: aqiIndex,
        },
        components: {
          pm2_5: 7,
          pm10: 12,
          o3: 13,
          no2: 5,
        },
      },
    ],
  }
}

function installProviderScenario(scenario: ProviderScenario) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL | Request) => {
      const url =
        input instanceof Request
          ? input.url
          : input instanceof URL
            ? input.toString()
            : input

      if (url.includes('api.data.gov.my/weather/forecast')) {
        return jsonResponse(scenario.malaysiaForecast)
      }

      if (url.includes('api.data.gov.my/weather/warning')) {
        return jsonResponse(scenario.malaysiaWarnings)
      }

      if (url.includes('/data/2.5/weather?')) {
        return jsonResponse(scenario.openWeatherCurrent)
      }

      if (url.includes('/data/2.5/forecast?')) {
        return jsonResponse(scenario.openWeatherForecast)
      }

      if (url.includes('/data/2.5/air_pollution?')) {
        return jsonResponse(scenario.openWeatherAir)
      }

      throw new Error(`Unhandled fetch URL in test: ${url}`)
    }),
  )
}

describe('buildDashboardPayload', () => {
  beforeEach(() => {
    process.env.OPENWEATHER_API_KEY = 'test-key'
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
    delete process.env.OPENWEATHER_API_KEY
    vi.unstubAllGlobals()
  })

  it('uses the true current-weather endpoint for the hero temperature and summary', async () => {
    installProviderScenario({
      malaysiaForecast: buildMalaysiaForecast('Tapah'),
      malaysiaWarnings: [],
      openWeatherCurrent: {
        dt: toUnix('2026-04-20T09:00:00+08:00'),
        main: {
          temp: 26,
          feels_like: 27,
          humidity: 74,
        },
        weather: [{ main: 'Clouds', description: 'few clouds' }],
      },
      openWeatherForecast: {
        list: [
          {
            dt: toUnix('2026-04-20T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 25,
              temp_max: 33,
              humidity: 76,
            },
            weather: [{ main: 'Clouds', description: 'scattered clouds' }],
            pop: 0.15,
          },
          {
            dt: toUnix('2026-04-21T12:00:00+08:00'),
            main: {
              temp: 30,
              temp_min: 24,
              temp_max: 32,
              humidity: 77,
            },
            weather: [{ main: 'Rain', description: 'light rain' }],
            pop: 0.5,
            rain: { '3h': 1.1 },
          },
          {
            dt: toUnix('2026-04-22T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 24,
              temp_max: 32,
              humidity: 74,
            },
            weather: [{ main: 'Clouds', description: 'broken clouds' }],
            pop: 0.2,
          },
          {
            dt: toUnix('2026-04-23T12:00:00+08:00'),
            main: {
              temp: 32,
              temp_min: 24,
              temp_max: 33,
              humidity: 72,
            },
            weather: [{ main: 'Clear', description: 'clear sky' }],
            pop: 0.05,
          },
          {
            dt: toUnix('2026-04-24T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 24,
              temp_max: 32,
              humidity: 75,
            },
            weather: [{ main: 'Clouds', description: 'few clouds' }],
            pop: 0.12,
          },
        ],
      },
      openWeatherAir: buildOpenWeatherAir(1),
    })

    const payload = await buildDashboardPayload('tapah')

    expect(payload.meta.source).toBe('live')
    expect(payload.meta.providers.openWeatherCurrent).toBe('live')
    expect(payload.snapshot.currentTemp).toBe(26)
    expect(payload.snapshot.currentSummary).toBe('Few Clouds')
  })

  it('marks the hiking verdict as Skip when a strong active storm warning overlaps near-term rain', async () => {
    installProviderScenario({
      malaysiaForecast: buildMalaysiaForecast('Tapah', 'Ribut petir'),
      malaysiaWarnings: [
        {
          warning_issue: {
            issued: '2026-04-20T07:45:00+08:00',
            title_en: 'Second category thunderstorm warning for Batang Padang',
            title_bm: null,
          },
          valid_from: '2026-04-20T08:00:00+08:00',
          valid_to: '2026-04-20T14:00:00+08:00',
          heading_en: 'Second category thunderstorm warning for Batang Padang',
          text_en:
            'Thunderstorm and strong wind expected over Batang Padang with heavy rain bursts.',
          instruction_en: 'Avoid exposed ridges and hill routes.',
          heading_bm: null,
          text_bm: null,
          instruction_bm: null,
        },
      ],
      openWeatherCurrent: {
        dt: toUnix('2026-04-20T09:00:00+08:00'),
        main: {
          temp: 25,
          feels_like: 26,
          humidity: 86,
        },
        weather: [{ main: 'Rain', description: 'light rain' }],
      },
      openWeatherForecast: {
        list: [
          {
            dt: toUnix('2026-04-20T10:00:00+08:00'),
            main: {
              temp: 25,
              temp_min: 24,
              temp_max: 26,
              humidity: 88,
            },
            weather: [{ main: 'Thunderstorm', description: 'thunderstorm with rain' }],
            pop: 0.95,
            rain: { '3h': 6.4 },
          },
          {
            dt: toUnix('2026-04-21T12:00:00+08:00'),
            main: {
              temp: 30,
              temp_min: 24,
              temp_max: 31,
              humidity: 80,
            },
            weather: [{ main: 'Rain', description: 'moderate rain' }],
            pop: 0.8,
            rain: { '3h': 3.2 },
          },
          {
            dt: toUnix('2026-04-22T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 24,
              temp_max: 32,
              humidity: 76,
            },
            weather: [{ main: 'Clouds', description: 'broken clouds' }],
            pop: 0.2,
          },
          {
            dt: toUnix('2026-04-23T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 24,
              temp_max: 33,
              humidity: 74,
            },
            weather: [{ main: 'Clouds', description: 'few clouds' }],
            pop: 0.1,
          },
          {
            dt: toUnix('2026-04-24T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 24,
              temp_max: 32,
              humidity: 75,
            },
            weather: [{ main: 'Clouds', description: 'scattered clouds' }],
            pop: 0.15,
          },
        ],
      },
      openWeatherAir: buildOpenWeatherAir(1),
    })

    const payload = await buildDashboardPayload('tapah')

    expect(payload.snapshot.hikeTip.verdict).toBe('Skip')
    expect(payload.snapshot.warnings).toHaveLength(1)
    expect(payload.snapshot.hikeTip.reason).toContain('already active')
    expect(
      payload.snapshot.hikeTip.cues.some((cue) => cue.label.includes('active now')),
    ).toBe(true)
  })

  it('marks the hiking verdict as Go when air is good, warnings are absent, and rain is only much later', async () => {
    installProviderScenario({
      malaysiaForecast: buildMalaysiaForecast('Lumut'),
      malaysiaWarnings: [],
      openWeatherCurrent: {
        dt: toUnix('2026-04-20T09:00:00+08:00'),
        main: {
          temp: 30,
          feels_like: 32,
          humidity: 70,
        },
        weather: [{ main: 'Clear', description: 'clear sky' }],
      },
      openWeatherForecast: {
        list: [
          {
            dt: toUnix('2026-04-20T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 29,
              temp_max: 32,
              humidity: 68,
            },
            weather: [{ main: 'Clouds', description: 'few clouds' }],
            pop: 0.1,
          },
          {
            dt: toUnix('2026-04-20T22:00:00+08:00'),
            main: {
              temp: 28,
              temp_min: 27,
              temp_max: 29,
              humidity: 80,
            },
            weather: [{ main: 'Rain', description: 'light rain' }],
            pop: 0.55,
            rain: { '3h': 0.8 },
          },
          {
            dt: toUnix('2026-04-21T12:00:00+08:00'),
            main: {
              temp: 30,
              temp_min: 26,
              temp_max: 31,
              humidity: 73,
            },
            weather: [{ main: 'Clouds', description: 'scattered clouds' }],
            pop: 0.2,
          },
          {
            dt: toUnix('2026-04-22T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 26,
              temp_max: 32,
              humidity: 74,
            },
            weather: [{ main: 'Clouds', description: 'few clouds' }],
            pop: 0.18,
          },
          {
            dt: toUnix('2026-04-23T12:00:00+08:00'),
            main: {
              temp: 31,
              temp_min: 26,
              temp_max: 32,
              humidity: 72,
            },
            weather: [{ main: 'Clouds', description: 'broken clouds' }],
            pop: 0.22,
          },
          {
            dt: toUnix('2026-04-24T12:00:00+08:00'),
            main: {
              temp: 30,
              temp_min: 26,
              temp_max: 31,
              humidity: 74,
            },
            weather: [{ main: 'Clouds', description: 'few clouds' }],
            pop: 0.2,
          },
        ],
      },
      openWeatherAir: buildOpenWeatherAir(1),
    })

    const payload = await buildDashboardPayload('lumut')

    expect(payload.snapshot.hikeTip.verdict).toBe('Go')
    expect(payload.snapshot.hikeTip.reason).toContain('No location-specific warning is active')
    expect(payload.snapshot.hikeTip.cues.some((cue) => cue.label === 'No active warning')).toBe(
      true,
    )
  })
})
