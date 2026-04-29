import { buildDashboardPayload } from '../api/dashboardService.ts'
import { buildMockDashboardPayload } from '../src/mockData.ts'
import {
  defaultDashboardLocale,
  defaultLocationKey,
  isDashboardLocale,
  isLocationKey,
  locations,
  type DashboardErrorPayload,
  type DashboardLocale,
  type DashboardPayload,
} from '../src/shared/dashboard.ts'
import { isDashboardPayload } from '../src/shared/dashboardValidation.ts'

type WorkerEnv = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  OPENWEATHER_API_KEY?: string
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

function getRequestedLocale(url: URL): DashboardLocale {
  const locale = url.searchParams.get('locale')

  return locale && isDashboardLocale(locale) ? locale : defaultDashboardLocale
}

async function handleDashboardRequest(request: Request, env: WorkerEnv) {
  if (request.method !== 'GET') {
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

  const url = new URL(request.url)
  const requestedLocation = url.searchParams.get('location')
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
      openWeatherApiKey: env.OPENWEATHER_API_KEY,
    })

    if (!isDashboardPayload(payload)) {
      throw new Error('Dashboard payload validation failed.')
    }

    return jsonResponse(payload)
  } catch {
    return jsonResponse(buildMockDashboardPayload(locationKey, locale))
  }
}

export default {
  fetch(request: Request, env: WorkerEnv) {
    const url = new URL(request.url)

    if (url.pathname === '/api/dashboard') {
      return handleDashboardRequest(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
