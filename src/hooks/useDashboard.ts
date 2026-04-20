import { useEffect, useRef, useState } from 'react'
import {
  type DashboardPayload,
  type LocationKey,
} from '../shared/dashboard.ts'
import {
  isDashboardErrorPayload,
  isDashboardPayload,
} from '../shared/dashboardValidation.ts'
import {
  readDashboardCache,
  writeDashboardCache,
} from '../lib/dashboardCache.ts'

export type ClientCacheStatus = 'miss' | 'fresh' | 'network' | 'stale'

export type ClientCacheInfo = {
  status: ClientCacheStatus
  savedAt: string | null
}

type UseDashboardResult = {
  payload: DashboardPayload | null
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  cacheInfo: ClientCacheInfo
  refresh: () => void
}

export function useDashboard(selectedLocation: LocationKey): UseDashboardResult {
  const [requestVersion, setRequestVersion] = useState(0)
  const [payload, setPayload] = useState<DashboardPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheInfo, setCacheInfo] = useState<ClientCacheInfo>({
    status: 'miss',
    savedAt: null,
  })
  const activeRequestRef = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = activeRequestRef.current + 1

    activeRequestRef.current = requestId

    async function loadDashboard() {
      const cachedDashboard = readDashboardCache(selectedLocation)

      if (cachedDashboard) {
        setPayload(cachedDashboard.payload)
        setError(null)
        setIsLoading(false)
        setCacheInfo({
          status: cachedDashboard.isFresh ? 'fresh' : 'stale',
          savedAt: cachedDashboard.savedAt,
        })
      } else {
        setCacheInfo({
          status: 'miss',
          savedAt: null,
        })
        setPayload((currentPayload) =>
          currentPayload?.locationKey === selectedLocation ? currentPayload : null,
        )
        setIsLoading(true)
      }

      setError(null)
      setIsRefreshing(true)

      try {
        const response = await fetch(
          `/api/dashboard?location=${encodeURIComponent(selectedLocation)}`,
          {
            headers: {
              Accept: 'application/json',
            },
            signal: controller.signal,
          },
        )

        const data = (await response.json()) as unknown

        if (!response.ok) {
          const message = isDashboardErrorPayload(data)
            ? data.error.message
            : 'Dashboard request failed.'

          throw new Error(message)
        }

        if (!isDashboardPayload(data)) {
          throw new Error('Dashboard response shape is invalid.')
        }

        if (controller.signal.aborted || activeRequestRef.current !== requestId) {
          return
        }

        setPayload(data)
        const cachedRecord = writeDashboardCache(selectedLocation, data)
        setCacheInfo({
          status: 'network',
          savedAt: cachedRecord?.savedAt ?? new Date().toISOString(),
        })
      } catch (loadError) {
        if (controller.signal.aborted || activeRequestRef.current !== requestId) {
          return
        }

        if (cachedDashboard) {
          setPayload(cachedDashboard.payload)
          setCacheInfo({
            status: 'stale',
            savedAt: cachedDashboard.savedAt,
          })
        }

        if (loadError instanceof Error) {
          setError(loadError.message)
          return
        }

        setError('Something went wrong while loading dashboard data.')
      } finally {
        if (!controller.signal.aborted && activeRequestRef.current === requestId) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      controller.abort()
    }
  }, [selectedLocation, requestVersion])

  function refresh() {
    setRequestVersion((version) => version + 1)
  }

  return {
    payload,
    isLoading,
    isRefreshing,
    error,
    cacheInfo,
    refresh,
  }
}
