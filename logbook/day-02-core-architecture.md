# CPWeather — Day 2 Logbook: Core Architecture & Data Contracts

**Date:** Day 2  
**Phase:** Foundation — Data Contract-First Design  
**Status:** Complete

---

## Objectives

1. Design the central DashboardPayload TypeScript interface as the single source of truth for all frontend-backend communication.
2. Design LocationSnapshot and every nested sub-type (HikeTip, WarningItem, ForecastDay, PollutantBreakdown, HikeCueTone, etc.).
3. Create src/shared/dashboard.ts as the canonical type-contract file consumed by both the React frontend and API handler.
4. Create src/shared/dashboardValidation.ts with exhaustive runtime type guards.
5. Create src/shared/dashboardValidation.test.ts to lock guards against the mock payload shape.
6. Create api/locationConfig.ts with all 10 Perak locations — lat/lon, Malaysia API names, warning aliases, hike targets.
7. Cement the "data contract-first" mindset: design the shape, publish it in shared/, then build outward.

---

## Tasks Completed

### 1. Central Type Contract — src/shared/dashboard.ts

Created the single-file type definition that every other module imports.

**Exported types:**

| Type | Description |
|---|---|
| LocationKey | Union of 10 Perak location string literals |
| LocationOption | { key: LocationKey, label: string } |
| DashboardLocale | 'en' | 'bm' |
| AirBand | 'Good' | 'Moderate' | 'Poor' |
| HikeVerdict | 'Go' | 'Caution' | 'Skip' |
| HikeCueTone | 'positive' | 'neutral' | 'caution' | 'danger' |
| Severity | 'Monitor' | 'Watch' | 'Alert' |
| DashboardSource | 'mock' | 'hybrid' | 'live' |
| DashboardProviderSource | 'live' | 'mock' | 'unavailable' |
| ForecastDay | { date, high, low, rainChance, humidity, summary } |
| WarningItem | { title, severity, window, message } |
| HikeTip | { target, verdict, confidence, title, reason, cues[] } |
| PollutantBreakdown | { pm25, pm10, o3, no2 } |
| LocationSnapshot | 14-field snapshot of everything the dashboard needs |
| DashboardMeta | { source, servedAt, cacheTtlMinutes, providers } |
| DashboardPayload | { locationKey, locations, snapshot, meta } — the root contract |
| DashboardErrorPayload | { error: { code, message }, meta: { servedAt } } |

**Runtime helpers:**
```typescript
export function isLocationKey(value: string): value is LocationKey {
  return locations.some((location) => location.key === value)
}

export function isDashboardLocale(value: string): value is DashboardLocale {
  return value === 'en' || value === 'bm'
}
```

**Location registry (10 Perak locations):**
Tapah, Ipoh, Cameron Highlands, Taiping, Lumut, Gopeng, Gerik, Kampong Gajah, Sungkai, Teluk Intan

### 2. Runtime Validation — src/shared/dashboardValidation.ts

A tree of pure predicate functions, each responsible for one leaf or branch of the contract:

```
isDashboardPayload
  isLocationKey (imported)
  isLocationOption (x array)
  isLocationSnapshot
    isPollutantBreakdown
    isHikeTip
      isHikeVerdict
      isHikeCueTone (x array)
      isFiniteNumber
    isAirBand
    isWarningItem (x array)
      isSeverity
    isForecastDay (x array)
  isDashboardSource
  isDashboardProviderSource (x 5 provider fields)
```

Key design decisions:
- Every guard starts with isRecord() to reject null, arrays, and primitives
- isFiniteNumber rejects NaN and Infinity
- Array fields use .every() so the entire array is validated
- Five meta.providers fields validated individually — prevents drift

### 3. Validation Tests — src/shared/dashboardValidation.test.ts

Three focused Vitest cases:
1. Accepts the current shared dashboard payload shape (valid mock passes)
2. Rejects a payload missing required fields (deleted currentSummary fails)
3. Accepts known dashboard error payloads (error shape passes)

### 4. Location Configuration — api/locationConfig.ts

Strongly-typed registry of all 10 Perak locations:

```typescript
export type LiveLocationConfig = {
  key: LocationKey
  lat: number
  lon: number
  malaysiaLocationName: string
  hikeTarget: string
  warningAliases: string[]
}
```

| Key | lat | lon | Malaysia API Name | Hike Target |
|---|---|---|---|---|
| tapah | 4.1972 | 101.2559 | Tapah | Lata Iskandar route |
| ipoh | 4.5975 | 101.0901 | Ipoh | Kledang Hill route |
| cameron-highlands | 4.4709 | 101.3760 | Cameron Highlands | Cameron Highlands ridge walk |
| taiping | 4.8500 | 100.7333 | Taiping | Bukit Larut route |
| lumut | 4.2323 | 100.6298 | Lumut | Teluk Batik coastal trail |
| gopeng | 4.4698 | 101.1647 | Gopeng | Gua Tempurung route |
| gerik | 5.4273 | 101.1342 | Gerik | Royal Belum trail |
| kampong-gajah | 4.1849 | 100.9381 | Kampong Gajah | Bukit Tunggal |
| sungkai | 3.9973 | 101.3062 | Sungkai | Sungai Klah route |
| teluk-intan | 4.0222 | 101.0208 | Teluk Intan | Kuala Gula boardwalk |

### 5. Data Contract-First Design Pattern

```
  src/shared/dashboard.ts  <- Single source of truth
         |
    ┌────┴────┐
    |         |
  api/      src/shared/
  (handler, (validation
   service,  guards)
   config)
    |         |
    └────┬────┘
         |
    src/App.tsx + components + hooks
```

---

## Challenges Faced

### Challenge 1: Location Key Union vs. Dynamic Strings
The locationKey field must be one of exactly 10 values, but the API receives ?location=tapah as a string. Co-located isLocationKey() type guard bridges string -> LocationKey without as casts.

### Challenge 2: Nested Array Validation
Naive Array.isArray() passes for empty arrays but [null, {malformed}] would crash downstream. Every array field validated with .every().

### Challenge 3: Warning Alias Coverage
Malaysia warnings use district names like "Batang Padang" not location keys like "tapah". Each location carries warningAliases: string[] for fuzzy matching.

### Challenge 4: NaN and Infinity as Valid Numbers
typeof NaN === 'number' is true. isFiniteNumber rejects both, applied to every numeric field.

---

## Lessons Learned

1. Co-locate the type union with its runtime guard — you cannot add a location without updating the guard.
2. Contract-first changes how you build — the service layer must normalize everything into the contract shape.
3. Mock data should be contract-compliant from day one — buildMockDashboardPayload() returns DashboardPayload, not any.
4. Validation guards are a second source of truth — test them against the mock shape.
5. Location config lives in api/ not src/ because it carries server concerns (warningAliases, malaysiaLocationName).

---

## Files Created/Modified

| File | Lines | Purpose |
|---|---|---|
| src/shared/dashboard.ts | 132 | Central type contracts, location registry, type guards |
| src/shared/dashboardValidation.ts | 199 | Recursive runtime type guards |
| src/shared/dashboardValidation.test.ts | 38 | Vitest suite locking guards against mock payload |
| api/locationConfig.ts | 94 | All 10 Perak locations with coordinates and aliases |

---

## Next Day Preview (Day 3)

- Implement api/dashboardService.ts — core aggregation engine
- Integrate OpenWeather (Current, Forecast, Air Pollution)
- Integrate Malaysia Government APIs (Forecast, Warnings)
- Build normalizer functions for all provider shapes
- Implement the hiking decision engine (Go/Caution/Skip)
- Compute derived fields (currentTemp, overview, nextRainWindow)
- Handle API errors gracefully with per-provider fallbacks
