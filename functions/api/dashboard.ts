import { buildMockDashboardPayload } from '../../src/mockData.ts'
import {
  defaultDashboardLocale,
  defaultLocationKey,
  isDashboardLocale,
  isLocationKey,
  locations,
  type DashboardErrorPayload,
  type DashboardLocale,
  type DashboardPayload,
} from '../../src/shared/dashboard.ts'
import { isDashboardPayload } from '../../src/shared/dashboardValidation.ts'
import { buildDashboardPayload } from '../../api/dashboardService.ts'

type PagesContext = {
  request: Request
  env: {
    OPENWEATHER_API_KEY?: string
  }
}

function jsonResponse(
  body: DashboardPayload | DashboardErrorPayload,
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=900',
    },
  })
}

function getSupportedLocationList() {
  return locations.map((location) => location.key).join('|')
}

function getRequestedLocation(url: URL) {
  return url.searchParams.get('location') ?? undefined
}

function getRequestedLocale(url: URL): DashboardLocale {
  const locale = url.searchParams.get('locale')

  return locale && isDashboardLocale(locale) ? locale : defaultDashboardLocale
}

export async function onRequest(context: PagesContext) {
  if (context.request.method !== 'GET') {
    return jsonResponse(
      {
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Use GET /api/dashboard?location=${getSupportedLocationList()}.`,
        },
        meta: {
          servedAt: new Date().toISOString(),
        },
      },
      405,
    )
  }

  const url = new URL(context.request.url)
  const requestedLocation = getRequestedLocation(url)
  const locale = getRequestedLocale(url)
  const locationKey = requestedLocation ?? defaultLocationKey

  if (!isLocationKey(locationKey)) {
    return jsonResponse(
      {
        error: {
          code: 'INVALID_LOCATION',
          message: `Unknown location "${locationKey}". Use ${getSupportedLocationList()}.`,
        },
        meta: {
          servedAt: new Date().toISOString(),
        },
      },
      400,
    )
  }

  try {
    const payload = await buildDashboardPayload(locationKey, locale, {
      openWeatherApiKey: context.env.OPENWEATHER_API_KEY,
    })

    if (!isDashboardPayload(payload)) {
      throw new Error('Dashboard payload validation failed.')
    }

    return jsonResponse(payload)
  } catch {
    return jsonResponse(buildMockDashboardPayload(locationKey, locale))
  }
}
