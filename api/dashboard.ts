import { buildMockDashboardPayload } from '../src/mockData.ts'
import { buildDashboardPayload } from './dashboardService.ts'
import {
  defaultLocationKey,
  isLocationKey,
  locations,
  type DashboardErrorPayload,
  type DashboardPayload,
} from '../src/shared/dashboard.ts'
import { isDashboardPayload } from '../src/shared/dashboardValidation.ts'

type ApiRequest = {
  method?: string
  query?: Record<string, string | string[] | undefined>
  url?: string
}

type ApiResponse = {
  setHeader: (name: string, value: string) => void
  status: (statusCode: number) => ApiResponse
  json: (body: DashboardPayload | DashboardErrorPayload) => void
}

function getRequestedLocation(req: ApiRequest): string | undefined {
  const rawQueryValue = req.query?.location

  if (typeof rawQueryValue === 'string') {
    return rawQueryValue
  }

  if (Array.isArray(rawQueryValue) && rawQueryValue[0]) {
    return rawQueryValue[0]
  }

  if (!req.url) {
    return undefined
  }

  const requestUrl = new URL(req.url, 'http://localhost')

  return requestUrl.searchParams.get('location') ?? undefined
}

function sendJson(
  res: ApiResponse,
  statusCode: number,
  body: DashboardPayload | DashboardErrorPayload,
) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.status(statusCode).json(body)
}

function getSupportedLocationList() {
  return locations.map((location) => location.key).join('|')
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')

  if (req.method && req.method !== 'GET') {
    sendJson(res, 405, {
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Use GET /api/dashboard?location=${getSupportedLocationList()}.`,
      },
      meta: {
        servedAt: new Date().toISOString(),
      },
    })
    return
  }

  const requestedLocation = getRequestedLocation(req)
  const locationKey = requestedLocation ?? defaultLocationKey

  if (!isLocationKey(locationKey)) {
    sendJson(res, 400, {
      error: {
        code: 'INVALID_LOCATION',
        message: `Unknown location "${locationKey}". Use ${getSupportedLocationList()}.`,
      },
      meta: {
        servedAt: new Date().toISOString(),
      },
    })
    return
  }

  try {
    const payload = await buildDashboardPayload(locationKey)

    if (!isDashboardPayload(payload)) {
      throw new Error('Dashboard payload validation failed.')
    }

    sendJson(res, 200, payload)
    return
  } catch {
    sendJson(res, 200, buildMockDashboardPayload(locationKey))
  }
}
