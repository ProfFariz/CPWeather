# CPWeather — Day 4 Logbook: API Layer & Client-Side Caching

**Date:** Day 4  
**Theme:** Unified API Middleware, Multi-Environment Routing, and Cache-First Data Strategy  
**Status:** Complete

---

## 1. Objectives

- Create a single /api/dashboard endpoint working identically across three environments: local Vite dev, Cloudflare Pages Functions, and Cloudflare Worker.
- Centralise request validation (method check, location check, locale parsing).
- Build a custom Vite plugin intercepting /api/dashboard during pnpm dev.
- Implement a client-side cache layer in localStorage with 15-min TTL, versioned keys, and stale-fallback.
- Wrap the entire fetch/cache lifecycle in a React hook (useDashboard) exposing loading, refreshing, error, cache metadata, and manual refresh().

---

## 2. Tasks Completed

### 2.1 api/dashboard.ts — Vite Dev Middleware Handler

Canonical handler (127 lines) used by Vite dev server and Pages Functions build. Abstracts over two request/response shapes using minimal ApiRequest/ApiResponse interfaces.

Key implementation:
- Method guard — non-GET returns 405 METHOD_NOT_ALLOWED
- Multi-shape query parameter extraction (handles parsed object, raw URL string, Cloudflare Request.url)
- Locale extraction with isDashboardLocale type guard, fallback to 'en'
- Server-side cache: Cache-Control: s-maxage=300, stale-while-revalidate=900 on every response
- Catch fallback: returns buildMockDashboardPayload() with 200 status — client never sees 500

### 2.2 functions/api/dashboard.ts — Cloudflare Pages Functions

Uses native Pages Functions signature: onRequest(context) where context provides request (standard Request) and env (bindings). Reads OpenWeather key from context.env.OPENWEATHER_API_KEY.

### 2.3 worker/index.ts — Cloudflare Worker Entry Point

Worker-first routing pattern:

```ts
export default {
  fetch(request: Request, env: WorkerEnv) {
    const url = new URL(request.url)
    if (url.pathname === '/api/dashboard') {
      return handleDashboardRequest(request, env)
    }
    return env.ASSETS.fetch(request)
  },
}
```

wrangler.toml configuration:
```toml
name = "cpweather"
main = "./worker/index.ts"
compatibility_date = "2026-04-29"
[assets]
directory = "./dist"
binding = "ASSETS"
not_found_handling = "single-page-application"
run_worker_first = ["/api/*"]
```

### 2.4 Custom Vite Plugin for Local API Middleware

A custom Vite plugin named local-dashboard-api mounts the dashboard handler into Vite's internal Connect server:

```ts
{
  name: 'local-dashboard-api',
  configureServer(server) {
    server.middlewares.use('/api/dashboard', (req, res) => {
      dashboardHandler({ method: req.method, url: req.url }, createDevApiResponse(res))
    })
  },
}
```

### 2.5 src/lib/dashboardCache.ts — localStorage Cache

Cache key format: cpweather.dashboard.v5.{locationKey}.{locale}
TTL: 15 minutes (900,000ms)

**readDashboardCache():**
1. Guards against SSR (typeof window check) and private browsing (try/catch)
2. Parses JSON, validates savedAt and payload shape via isDashboardPayload()
3. Computes ageMs and isFresh flag
4. On malformed data: removes corrupt entry, returns null

**writeDashboardCache():**
Validates payload, creates DashboardCacheRecord with savedAt timestamp, stores to localStorage. Returns null on failure (quota exceeded, private browsing).

### 2.6 src/hooks/useDashboard.ts — Core Data Hook

Cache-first, network-refresh strategy:

```
1. CHECK LOCAL STORAGE
     HIT -> Render cached payload immediately, set cacheInfo.status
     MISS -> Keep isLoading = true

2. FETCH /api/dashboard
     SUCCESS -> Update state with live data, write to cache, isLoading = false
     FAILURE -> Keep showing cached data if available, set error message
```

**Race condition protection:**
- activeRequestRef counter — only latest request's response applied
- AbortController — cancels in-flight requests on cleanup
- Both guards checked in .then() and .catch() handlers

**Return shape:**
```ts
type UseDashboardResult = {
  payload: DashboardPayload | null
  isLoading: boolean        // true only on first-ever load (no cache)
  isRefreshing: boolean     // true during any network fetch
  error: string | null      // localized error message
  cacheInfo: ClientCacheInfo
  refresh: () => void       // manual re-fetch trigger
}
```

**Cache statuses:**

| Status | Meaning |
|---|---|
| miss | No cache entry; first visit or cache cleared |
| fresh | Cache hit within 15-min TTL; rendered instantly |
| network | Live fetch succeeded; cache updated |
| stale | Cache older than 15 min + network fetch failed |

---

## 3. Architectural Decisions

### 3.1 Three Handlers, One Contract
Each environment has its own handler file rather than a shared module:
- No cross-environment build complexity
- Each handler is self-contained and auditable
- Validation logic is duplicated (small ~20 lines) not diverged

### 3.2 Cache-Then-Network (Not Network-Then-Cache)
Returning users see instant dashboard content (sub-1ms from localStorage). New users see loading state until first successful fetch. Network response always overwrites cache.

### 3.3 Key Versioning with Prefix Bump
The v5 prefix allows cache busting by bumping to v6 when DashboardPayload shape changes. Old keys orphaned and evicted by browser. No migration code needed.

### 3.4 Two-Layer Caching
| Layer | Mechanism | Fresh Duration | Stale Duration |
|---|---|---|---|
| CDN/Edge | Cache-Control header | 5 min | 15 min |
| Client | localStorage | 15 min | N/A |

CDN cache (5 min) is shorter than client cache (15 min) — re-fetch after 10 min may get CDN-stale response fresher than client's 10-min-old cache.

---

## 4. Challenges Encountered

### 4.1 Vite Middleware Query-Parsing Inconsistency
Vite's internal Connect middleware doesn't consistently parse query strings. Handler handles all three shapes: parsed object, undefined, raw string on req.url.

### 4.2 SSR/Private-Browsing localStorage Guard
window.localStorage throws in some environments. getStorage() wrapper returns null gracefully; readDashboardCache and writeDashboardCache treat null storage as no-op.

### 4.3 Race Conditions on Rapid Location Switching
5 rapid location clicks = 5 fetch requests. activeRequestRef counter ensures only the latest response is applied. AbortController cancels in-flight requests.

---

## 5. Lessons Learned

1. Environment-agnostic handler interfaces pay off quickly — same logic reusable with thin adapters.
2. Cache-first with background revalidation is the right UX for dashboards — sub-1ms perceived performance.
3. Separating isLoading from isRefreshing prevents UI thrash — skeleton only on first visit.
4. Key versioning with prefix string is more maintainable than migration scripts.
5. Three near-identical handler files are better than one fragile shared module across build systems.

---

## 6. Files Created/Modified

| File | Lines | Purpose |
|---|---|---|
| api/dashboard.ts | 127 | Vite dev middleware API handler |
| functions/api/dashboard.ts | 98 | Cloudflare Pages Functions handler |
| worker/index.ts | 106 | Cloudflare Worker entry point |
| vite.config.ts | 57 | Custom Vite plugin local-dashboard-api |
| src/lib/dashboardCache.ts | 110 | localStorage cache with v5 keys and 15-min TTL |
| src/hooks/useDashboard.ts | 170 | Cache-first React hook with race protection |
| wrangler.toml | 10 | Worker + Assets configuration |

---

## Next Day Preview (Day 5)

- Build main.tsx entry point with StrictMode and AppErrorBoundary
- Create App.tsx root component with location/state management and layout
- Implement glass-morphism CSS design system foundations
- Build DashboardHeader with brand logo, location picker, language toggle, clock, refresh
- Create icons.tsx with SVG icon library
- Build loading and error states
- Populate mockData.ts for all 10 locations
