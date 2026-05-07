# CPWeather — Day 3 Logbook: API Integration & Backend Service

**Date:** Day 3  
**Focus:** API Integration, Data Normalization & Hiking Decision Engine  
**Status:** Complete

---

## 1. Objectives

- Build a single aggregation service (api/dashboardService.ts) combining five upstream API calls into one DashboardPayload.
- Integrate three OpenWeather endpoints: Current Weather, 5-day/3-hour Forecast, and Air Pollution.
- Integrate two Malaysia Government (data.gov.my) endpoints: weather/forecast and weather/warning.
- Run all five API calls in parallel with Promise.allSettled so no single failure kills the whole payload.
- Write normalizer functions transforming raw vendor shapes into shared ForecastDay[] and WarningItem[] contracts.
- Build a hiking decision engine emitting Go | Caution | Skip verdicts with explainable confidence scores and cue chips.
- Compute derived fields (currentTemp, overview, nextRainWindow) from whatever providers succeed.
- Handle API errors gracefully — per-provider fallbacks, timeout guards, mock -> hybrid -> live source classification.

---

## 2. Tasks Completed

### 2.1 Core Aggregation Service — api/dashboardService.ts

The heart of Day 3: a single exported async function — buildDashboardPayload(locationKey, locale, options?) — that:

1. Clones the mock/fallback payload as a safety net
2. Fires five Promise.allSettled calls to upstream APIs
3. Feeds each successful result through a dedicated normalizer
4. Computes derived fields (currentTemp, overview, nextRainWindow)
5. Runs the hiking decision engine
6. Classifies the overall source as mock, hybrid, or live
7. Returns the final DashboardPayload

### 2.2 OpenWeather API Integration (3 Endpoints)

| Function | Endpoint | Returns |
|---|---|---|
| fetchOpenWeatherCurrent() | /data/2.5/weather | OpenWeatherCurrentResponse |
| fetchOpenWeatherForecast() | /data/2.5/forecast | OpenWeatherForecastResponse |
| fetchOpenWeatherAir() | /data/2.5/air_pollution | OpenWeatherAirResponse |

Each fetch uses AbortSignal.timeout(8000) for hard timeout protection.

### 2.3 Malaysia Government API Integration

| Function | Endpoint | Strategy |
|---|---|---|
| fetchMalaysiaForecast() | /weather/forecast | Filters by location_name with ifilter; fetches 7 days |
| fetchMalaysiaWarnings() | /weather/warning | Sorted by -warning_issue__issued; fetches 30 items |

### 2.4 Promise.allSettled for Parallel API Calls

```ts
const [
  malaysiaForecastResult,
  malaysiaWarningsResult,
  openWeatherCurrentResult,
  openWeatherForecastResult,
  openWeatherAirResult,
] = await Promise.allSettled([...])
```

Why allSettled (not all): If Malaysia warnings fail, we still want OpenWeather forecast data. Each provider result is checked with result.status === 'fulfilled' before entering the pipeline.

### 2.5 Normalizer Functions

#### normalizeOpenWeatherForecast()
- Groups 40 three-hour entries into 5 calendar days (Malaysia timezone)
- Picks the wettest entry per day for the summary (max pop + rain volume)
- Extracts high/low temps, rain chance %, humidity %

#### normalizeMalaysiaForecast()
- Takes Malaysia forecast items and overlays onto OpenWeather data
- estimateRainChance() maps Malay forecast strings to numeric probabilities
- estimateHumidity() computes synthetic humidity when OpenWeather is unavailable

#### normalizeMalaysiaWarnings()
- isWarningRelevant() checks warningAliases against warning text fields
- getSeverityFromWarning() parses category keywords and thunderstorm mentions
- Capped at 3 warnings to keep UI scannable

### 2.6 Hiking Decision Engine — buildHikeTip()

Decision tree with strict priority gating:

```
STEP 1: Is air quality Poor (AQI >= 120)?
  YES -> SKIP (confidence 88) — "Air quality is too rough"
  NO  -> Continue to Step 2

STEP 2: Is there a severe active threat?
  - highestWarningSeverity === 'Alert'
  - OR active storm warning + near-term rain
  - OR active Watch+ warning
  YES -> SKIP (confidence 90) — "Active storm risk"
  NO  -> Continue to Step 3

STEP 3: Are there cautionary signals?
  - activeWarning, warningStartsSoon (<=4h)
  - nearTermHeavyRain (<=3h, thunder/80%+)
  - moderateAir, thunderSummary
  - shortOutdoorWindow, laterTodayTurnsWet
  YES -> CAUTION (confidence 76-81) — "Usable window, but it closes later"
  NO  -> Continue to Step 4

STEP 4: All clear
  -> GO (confidence 84) — "Next several hours look workable"
```

Each verdict includes localized title, reason, confidence score, and 3 color-coded cue chips.

### 2.7 Derived Fields

**currentTemp** priority chain:
1. OpenWeather Current (/weather endpoint)
2. Nearest 3-hour forecast entry
3. (high + low) / 2 of first forecast day
4. Hard fallback: 28degC

**overview**: Narrative paragraph assembled from current conditions + forecast trend + air quality + warnings status

**nextRainWindow**: From Malaysia forecast summary_when or OpenWeather first wet slot

### 2.8 API Handler — api/dashboard.ts

```ts
try {
  const payload = await buildDashboardPayload(locationKey, locale)
  if (!isDashboardPayload(payload)) throw new Error('Validation failed.')
  sendJson(res, 200, payload)
} catch {
  sendJson(res, 200, buildMockDashboardPayload(locationKey, locale))
}
```

Returns mock data on any error — never shows a broken dashboard.

### 2.9 Tests — api/dashboardService.test.ts

Three Vitest integration tests using vi.stubGlobal('fetch'):

| Test Scenario | Verdict | Key Assertion |
|---|---|---|
| All 5 providers return live data | Live source | currentTemp === 26, currentSummary === 'Few Clouds' |
| Active thunderstorm warning + near-term rain | Skip | reason contains 'already active', cue includes 'active now' |
| Clear sky, no warnings, rain late at night | Go | reason contains 'No location-specific warning is active' |

---

## 3. Challenges Encountered

### 3.1 OpenWeather API Rate Limits
The free tier allows 60 calls/minute. With 3 calls per refresh, that's 20 refreshes/minute max. The 8-second timeout and 15-min cache TTL help, but production needs server-side cache.

### 3.2 data.gov.my API Inconsistency
Malaysia forecast summary_when field is free-text Malay with no controlled vocabulary. Built handlers for 8+ distinct combinations; undiscovered permutations produce generic fallback text.

### 3.3 Warning Relevance Matching
Malaysia warnings use unstructured text. Substring matching against warningAliases is fragile but errs on the side of over-inclusion (generous alias lists).

### 3.4 Timezone Handling
OpenWeather returns UTC timestamps; Malaysia forecast uses UTC+8. All formatting uses Intl.DateTimeFormat with timeZone: 'Asia/Kuala_Lumpur' for consistent day boundaries.

### 3.5 Humidity Estimation Fallback
Malaysia forecast doesn't provide humidity. estimateHumidity() heuristic (90 - tempSpread * 2 + rainChance * 0.15) calibrated for tropical Malaysia conditions at ~8% error margin.

---

## 4. Lessons Learned

1. Clone before mutating — cloneSnapshot() prevents mock data references from leaking into live payloads.
2. allSettled > all for multi-provider aggregation — one failure shouldn't kill the entire dashboard.
3. Decision engines need explainability — confidence scores, reasoning text, and color-coded cues make the verdict transparent.
4. Source tracking (live/mock/unavailable per provider) builds user trust and aids debugging.
5. Always validate normalized output — isDashboardPayload() run on every response catches normalization bugs.

---

## Next Day Preview (Day 4)

- Create API endpoint handlers for Vite dev, Cloudflare Pages Functions, and Cloudflare Worker
- Build custom Vite plugin for local API middleware
- Implement client-side localStorage cache with 15-min TTL
- Build useDashboard hook with cache-first strategy and race-condition protection
- Configure server-side Cache-Control headers
