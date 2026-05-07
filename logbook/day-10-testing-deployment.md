# CPWeather — Day 10 Logbook: Testing, Deployment & Documentation

**Date:** Day 10  
**Focus:** Test Suite, Cloudflare Workers Deployment, Documentation & Final QA  
**Status:** Complete

---

## 1. Objectives

- Write integration tests for buildDashboardPayload using vi.stubGlobal('fetch') for full API mocking.
- Write runtime shape-validation tests for the shared DashboardPayload contract.
- Configure Vitest for the dual-frontend/backend codebase.
- Test all three hiking decision-engine verdicts: Go, Caution, and Skip.
- Configure Cloudflare Workers deployment (wrangler.toml).
- Build worker/index.ts as the Workers entry point.
- Wire up Cloudflare Assets binding and SPA fallback.
- Produce comprehensive README.md covering project overview, tech stack, features, setup, and architecture.
- Create .env.example template.
- Write public/manifest.webmanifest for PWA installability.
- Run final QA: lint, test suite, type-check, and production build.

---

## 2. Tasks Completed

### 2.1 Integration Tests — api/dashboardService.test.ts

The most involved test file. Uses vi.stubGlobal('fetch', ...) to mock all 5 upstream APIs, allowing buildDashboardPayload to exercise its real Promise.allSettled pipeline end-to-end.

**Mock infrastructure:**
```ts
function installProviderScenario(scenario: ProviderScenario) {
  vi.stubGlobal('fetch', vi.fn(async (input) => {
    // URL matching: api.data.gov.my/weather/forecast, /warning,
    // api.openweathermap.org/data/2.5/weather, /forecast, /air_pollution
    // Returns jsonResponse for matching URLs, throws for unhandled
  }))
}
```

**Test fixtures:**
- Fake timers locked to fixed Malaysia-time morning (FIXED_NOW)
- Helper factories: buildMalaysiaForecast(), buildOpenWeatherAir(), jsonResponse(), toUnix()
- process.env.OPENWEATHER_API_KEY set to 'test-key' in beforeEach

**Test: "uses the true current-weather endpoint for hero temperature and summary"**
- All 5 providers return live data
- Assertions: source === 'live', currentTemp === 26, currentSummary === 'Few Clouds'
- Confirms service prefers current-weather endpoint over forecast midpoint

**Test: "marks the hiking verdict as Skip when active storm warning overlaps near-term rain"**
- Inputs: Malaysia forecast = 'Ribut petir', warnings = "Second category thunderstorm for Batang Padang" (08:00-14:00), OpenWeather current = 25degC/86% humidity, forecast = 95% pop + 6.4mm rain at 10:00 with 'thunderstorm with rain'
- Assertions: verdict === 'Skip', reason contains 'already active', cue includes 'active now', confidence === 90

**Test: "marks the hiking verdict as Go when air is good, warnings absent, rain only much later"**
- Inputs: Malaysia forecast = 'Tiada hujan', warnings = [], OpenWeather current = 30degC 'clear sky', forecast rain at 22:00 (pop=0.55), air aqi=1
- Assertions: verdict === 'Go', reason contains 'No location-specific warning is active', cue includes 'No active warning', confidence === 84

### 2.2 Payload Shape Validation Tests — dashboardValidation.test.ts

Three focused tests:
```ts
// Test 1: Mock payload passes validation
expect(isDashboardPayload(buildMockDashboardPayload('tapah'))).toBe(true)

// Test 2: Missing required field fails validation
delete snapshot.currentSummary
expect(isDashboardPayload(payload)).toBe(false)

// Test 3: Error payloads pass validation
expect(isDashboardErrorPayload({
  error: { code: 'INVALID_LOCATION', message: 'Unknown location "x".' },
  meta: { servedAt: new Date().toISOString() },
})).toBe(true)
```

### 2.3 Vitest Configuration

```ts
export default defineConfig({
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts', 'src/**/*.test.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    clearMocks: true,
  },
})
```

All 6 tests pass: 3 in dashboardService.test.ts + 3 in dashboardValidation.test.ts.

### 2.4 Cloudflare Workers Deployment

**wrangler.toml:**
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

**Deployment architecture:**
```
Incoming Request -> Cloudflare Workers Runtime
  |
  pathname === '/api/*' ?
    YES -> Worker fetch() -> JSON response
    NO  -> Assets Binding (./dist)
             Static file exists?
               YES -> Serve file
               NO  -> SPA fallback -> index.html
```

### 2.5 Worker Entry Point — worker/index.ts

Mirrors api/dashboard.ts but adapted for Workers runtime:
- Request/Response instead of Node HTTP
- env.OPENWEATHER_API_KEY instead of process.env
- Response.json() instead of res.json()
- env.ASSETS.fetch(request) for non-API routes
- Same validation, mock fallback, Cache-Control header

### 2.6 Comprehensive README.md

Sections:
- Title & Tagline
- Presentation Summary (problem statement, solution)
- What A User Can Do (11 bullet points)
- Simple User Flow & Developer Flow
- System Flow (architecture diagram)
- Current Features (21 shipped, checkmarked)
- Current Locations (10 Perak locations)
- Dashboard Sections (8 UI sections)
- API Route documentation
- Shared Data Contract (top-level and snapshot fields)
- Tech Stack (full list with versions)
- Key Files (directory tree)
- Data Sources (5 upstream providers)
- Setup instructions (requirements, install, dev, lint, test, build)
- Environment Variables (.env.local setup, security notes)
- Cache Behavior (localStorage, 15-min TTL, stale-while-revalidate)
- Hiking Decision Logic (data sources, verdicts, cue chips)
- What Is Still Missing (deployment, mobile QA, screenshots)
- Recommended Next Order (4-step priority)
- Things Not To Forget (9 reminders)

### 2.7 Environment Template

.env.example:
```
OPENWEATHER_API_KEY=your_openweather_api_key
```

Single line, safe placeholder. Key consumed server-side only, never VITE_-prefixed, cannot leak to client bundle.

### 2.8 PWA Manifest

public/manifest.webmanifest:
```json
{
  "name": "CuacaPerak",
  "short_name": "CuacaPerak",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#FACC15",
  "orientation": "portrait",
  "icons": [{ "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }]
}
```

### 2.9 Final QA

All three gates pass cleanly:
```powershell
pnpm lint    # eslint . -- 0 errors, 0 warnings
pnpm test    # vitest run -- 6/6 tests pass
pnpm build   # tsc -b && vite build -- success, outputs to ./dist
```

TypeScript project references: tsconfig.app.json (React frontend) + tsconfig.node.json (API/Worker/Vite config) compiled in dependency order via tsc -b.

Vite build produces: dist/index.html, dist/assets/ (hashed JS/CSS), manifest.webmanifest, favicon.svg from public/.

---

## 3. Challenges

### 3.1 Cloudflare Workers Compatibility
buildDashboardPayload used Node.js constructs (process.env, AbortSignal.timeout).
Resolution:
- process.env replaced with explicit options.openWeatherApiKey parameter
- AbortSignal.timeout(8000) works in Workers runtime (V8 engine)
- typeof process !== 'undefined' guards added

### 3.2 Fetch Mocking Complexity
Five upstream endpoints, each needing distinct mock responses per test scenario.
Solution: ProviderScenario interface with all 5 shapes, installProviderScenario() with URL-matching dispatch. Each test builds a complete world in 30-60 lines.

### 3.3 Test Timezone Determinism
Forecast-relative calculations (hours away, today-key, wet-slot filtering) depend on current time.
Solution: vi.useFakeTimers() + vi.setSystemTime(FIXED_NOW) locking all tests to same Malaysia-time morning.

### 3.4 Worker vs. Pages Functions Route Conflict
Both worker/index.ts and functions/api/dashboard.ts could handle /api/dashboard.
Resolution: wrangler deploy uses worker/index.ts; functions/ directory is for Cloudflare Pages deployment path (alternative target).

---

## 4. Lessons Learned

1. **vi.stubGlobal('fetch') is powerful but needs careful URL-matching.** Each URL pattern in the mock must be distinct enough to route to the correct handler.
2. **Fake timers are essential for time-dependent logic.** Without vi.useFakeTimers, tests would produce different results depending on when they run.
3. **ProviderScenario abstraction pays off.** Each test constructs one scenario object rather than managing 5 separate mocks.
4. **SPA fallback through Assets binding is elegant.** No need for a separate router — Cloudflare handles it natively.
5. **Contract validation tests are canary tests.** They catch drift between mock data, validation, and real API responses.
6. **Three deployment targets (Vite/Pages/Worker) share the same business logic.** Only the http adapter layer differs.
7. **A good README is worth the investment.** It serves as onboarding doc, architecture reference, and handoff document.
8. **PWA manifest with SVG icon works universally.** No need to generate multiple icon sizes.

---

## 5. Project Reflection

### What Went Well
- Data contract-first design prevented frontend/backend drift throughout development
- Cache-first strategy delivered instant load times for returning users
- Glass-morphism design system achieved premium feel with CSS-only approach
- Bilingual i18n implemented cleanly without external dependencies
- Cloudflare Workers deployment configured correctly on first attempt

### What Could Be Improved
- Add jsdom-based component tests for UI rendering
- Implement Cloudflare KV or D1 for server-side caching (reduce API calls)
- Add CI/CD pipeline (GitHub Actions for lint/test/build on push)
- Add error tracking/monitoring (Sentry or Cloudflare Analytics)
- Complete mobile QA across iOS Safari and Android Chrome
- Add screenshot gallery to README

### Technologies Learned
- React 19 with hooks and concurrent patterns
- TypeScript 6.0 with project references and erasableSyntaxOnly
- Tailwind CSS v4 with CSS-first configuration
- Chart.js 4.5 with mixed chart types and dual axes
- Three.js via @react-three/fiber and @shadergradient
- Cloudflare Workers + Assets binding
- ESLint 9 flat config with typescript-eslint
- Vitest with fetch mocking and fake timers

---

## 6. Files Inventory

| File | Purpose |
|---|---|
| api/dashboardService.test.ts | 3 integration tests for buildDashboardPayload |
| src/shared/dashboardValidation.test.ts | 3 validation tests for payload contracts |
| vitest.config.ts | Test runner configuration |
| wrangler.toml | Cloudflare Workers deployment config |
| worker/index.ts | Worker entry point with API routing |
| readme.md | Complete project documentation |
| .env.example | Environment variable template |
| public/manifest.webmanifest | PWA manifest |

---

## 7. Delivery Checklist

- [x] All 6 tests passing (pnpm test)
- [x] ESLint clean (pnpm lint)
- [x] TypeScript compiles (tsc -b)
- [x] Production build succeeds (vite build)
- [x] Cloudflare Workers deployment configured
- [x] Client-side caching implemented (15-min TTL, v5 keys)
- [x] Server-side caching headers configured (s-maxage=300, stale-while-revalidate=900)
- [x] Bilingual i18n complete (English + Bahasa Malaysia)
- [x] 10 Perak locations configured with coordinates and warnings
- [x] 5 upstream API providers integrated with graceful fallback
- [x] Hiking decision engine (Go/Caution/Skip) operational
- [x] Glass-morphism design system complete
- [x] Responsive at 1180px and 640px breakpoints
- [x] Reduced-motion accessibility respected
- [x] PWA manifest + favicon configured
- [x] README documentation complete

---

*End of Day 10 logbook entry — CPWeather project complete.*
