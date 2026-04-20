import {
  type DashboardLocale,
  type DashboardPayload,
  type LocationKey,
} from '../shared/dashboard.ts'
import { isDashboardPayload } from '../shared/dashboardValidation.ts'

export const DASHBOARD_CACHE_TTL_MINUTES = 15

const DASHBOARD_CACHE_TTL_MS = DASHBOARD_CACHE_TTL_MINUTES * 60 * 1000
const DASHBOARD_CACHE_PREFIX = 'cpweather.dashboard.v5'

type DashboardCacheRecord = {
  savedAt: string
  payload: DashboardPayload
}

export type DashboardCacheResult = DashboardCacheRecord & {
  isFresh: boolean
  ageMs: number
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getDashboardCacheKey(locationKey: LocationKey, locale: DashboardLocale) {
  return `${DASHBOARD_CACHE_PREFIX}.${locationKey}.${locale}`
}

export function readDashboardCache(
  locationKey: LocationKey,
  locale: DashboardLocale,
): DashboardCacheResult | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const rawValue = storage.getItem(getDashboardCacheKey(locationKey, locale))

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<DashboardCacheRecord>

    if (
      typeof parsed?.savedAt !== 'string' ||
      !isDashboardPayload(parsed.payload)
    ) {
      storage.removeItem(getDashboardCacheKey(locationKey, locale))
      return null
    }

    const savedAtMs = Date.parse(parsed.savedAt)

    if (Number.isNaN(savedAtMs)) {
      storage.removeItem(getDashboardCacheKey(locationKey, locale))
      return null
    }

    const ageMs = Date.now() - savedAtMs

    return {
      savedAt: parsed.savedAt,
      payload: parsed.payload,
      ageMs,
      isFresh: ageMs <= DASHBOARD_CACHE_TTL_MS,
    }
  } catch {
    storage.removeItem(getDashboardCacheKey(locationKey, locale))
    return null
  }
}

export function writeDashboardCache(
  locationKey: LocationKey,
  locale: DashboardLocale,
  payload: DashboardPayload,
): DashboardCacheRecord | null {
  const storage = getStorage()

  if (!storage || !isDashboardPayload(payload)) {
    return null
  }

  const record: DashboardCacheRecord = {
    savedAt: new Date().toISOString(),
    payload,
  }

  try {
    storage.setItem(getDashboardCacheKey(locationKey, locale), JSON.stringify(record))
    return record
  } catch {
    return null
  }
}
//