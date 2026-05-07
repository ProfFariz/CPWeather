# CPWeather — Day 8 Logbook: Warnings System, i18n & Animations

**Date:** Day 8  
**Focus:** Live warning feed, full bilingual i18n system, decorative SVG overlays, cursor glow, and Three.js shader background  
**Status:** Complete

---

## Objectives

1. Build a live warning detail panel (WarningFeed) with severity-driven styling (Alert/Watch/Monitor) and bilingual labels.
2. Create a complete i18n copy system — getDashboardCopy() returning every UI string for English and Bahasa Malaysia across 9 surface areas.
3. Implement locale resolution logic — localStorage persistence -> navigator.language fallback -> dayjs reconfiguration.
4. Build translation helper functions for type-safe term translation (translateAirBand, translateHikeVerdict, translateSeverity, etc.).
5. Wire dayjs locale switching for 5 date/time formatters.
6. Create three decorative animation components: AnimatedWeatherBackground, NatureDecor, CursorGlow.
7. Build ShaderGradientBackground — Three.js waterPlane shader gradient with noise overlay and floating nature orbs.

---

## Tasks Completed

### 1. WarningFeed.tsx — Live Warning Detail Panel

Receives warnings[], selected location label, and locale. Renders severity-tinted panel:

**Severity Color Mapping:**

| Severity | Chip Classes | Accent Bar | Card Classes |
|---|---|---|---|
| Alert | rose tones | bg-rose-500 | border-rose-200/60 bg-rose-50/50 |
| Watch | amber tones | bg-amber-500 | border-amber-200/60 bg-amber-50/50 |
| Monitor/empty | emerald tones | bg-emerald-500 | default glass |

**Empty state:** Localized clearTitle / clearBody inside neutral emerald card.
**Populated state:** Each WarningItem as bordered glass card with severity accent bar, title + severity chip, time window, body message.

### 2. i18n System — src/i18n/dashboard.ts

310-line self-contained module. Single getDashboardCopy(locale) call returning 9 sections:

| Section | Example Keys |
|---|---|
| common | today, retry, refresh, refreshing, minutes |
| header | brand, subtitle, locationAria, languageAria, updated |
| banner | lastFetchWarning |
| hero | fallbackSummary, hikingOutlook, confidence, airQuality, rainWindow, warnings, clearState, noWarning, rainNarrative (function) |
| sidebar | title, outlook (function), lowSuffix |
| chart | eyebrow, title, description, badges, datasets, axes, tooltipSummary, tooltipHumidity |
| warnings | eyebrow, title, clearTitle, clearBody (function) |
| loading | chip, title, description, animationAlt, animationDescription, credit |
| initialError | chip, title, fallbackMessage |
| footer | servedAt, apiCacheTtl, localCache |

**Locale resolution:**
```typescript
export function resolveInitialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(APP_LOCALE_STORAGE_KEY)
  if (isAppLocale(stored)) return stored
  return navigator.language.toLowerCase().startsWith('ms') ? 'bm' : 'en'
}
```
Chain: localStorage -> navigator.language -> 'en' default.

**Translation helper functions (pure, synchronous, type-safe):**
- translateAirBand(airBand, locale): 'Good' -> 'Baik'
- translateHikeVerdict(verdict, locale): 'Go' -> 'Teruskan', 'Skip' -> 'Tangguh'
- translateSeverity(severity, locale): 'Alert' -> 'Amaran', 'Watch' -> 'Waspada'
- sourceLabel(source, locale): 'live' -> 'API langsung'
- cacheStatusLabel(status, locale): 'stale' -> 'Sandaran lama'
- formatWarningCount(count, locale): handles singular/plural

**dayjs locale switching — 5 date formatters:**
- formatHeaderUpdatedTime: "2:35 PM" / "14:35"
- formatHeroTimestamp: "Thu, 17 Apr - 2:35 PM" / "Kha, 17 Apr - 14:35"
- formatFooterTime: "2:35:17 PM" / "14:35:17"
- formatWeekdayShort: "Thu" / "Kha"
- formatDayMonth: "17 Apr" / "17 Apr"

### 3. AnimatedWeatherBackground.tsx

Decorative SVG (1200x760) with three layers:
1. Grid: 6 horizontal + 6 vertical lines
2. Isobars: 3 flowing cubic bezier paths (pressure contours)
3. Markers & fronts: rectangles, circles, front notation boxes

Positioned fixed, z-index 0, low opacity — ambient texture.

### 4. NatureDecor.tsx

Three variant modes:

| Variant | Elements |
|---|---|
| hero-leaves | Monstera leaf top-right, fern/vine bottom-left, accent leaf mid-right |
| sidebar-droplets | 3 water droplets with highlight ellipses |
| hero-corner | Single simplified leaf |

All SVGs: aria-hidden, fill="currentColor", low opacity. CSS animations: leaf-sway (8s), droplet-float (6s) — disabled under reduced-motion.

### 5. CursorGlow.tsx

Mouse-following radial gradient via CSS custom properties:
```css
background: radial-gradient(500px circle at var(--mx) var(--my),
  rgba(16, 185, 129, 0.08), transparent 35%);
```

Performance & accessibility:
- rAF-throttled mousemove (single update per frame via ticking flag)
- Touch device guard: 'ontouchstart' in window || navigator.maxTouchPoints > 0 -> returns null
- Reduced-motion guard: matchMedia check -> returns null
- CSS mix-blend-mode: screen, pointer-events: none

### 6. ShaderGradientBackground.tsx

5 stacked layers (all aria-hidden):

1. ShaderGradientCanvas (fixed, z-index 0) — Three.js waterPlane shader at 30% opacity
2. Noise overlay — SVG feTurbulence fractal noise at 1.2% opacity, mix-blend-mode: soft-light
3. Nature orb 1: 650px emerald, top-right, animation-delay: 0s
4. Nature orb 2: 550px green, bottom-left, animation-delay: -6s
5. Nature orb 3: 450px amber, center, animation-delay: -11s

Staggered negative delays prevent synchronization — perpetual organic drift.
Nature orb animation: translate(+/-35px, +/-25px) scale(0.94-1.06) on 16s cycle.

---

## Challenges

### 1. Bilingual Content Management at Scale
~60+ translatable strings across 9 sections. getDashboardCopy pattern (single function returning fully-typed object) made this manageable. TypeScript enforces structural parity between languages.

### 2. Three.js / @shadergradient Integration
Three.js v0.169 + @react-three/fiber v9.6 + @shadergradient/react v2.4.20 adds ~600KB. Mitigation: canvas pointer-events: none, pixelDensity: 1, 30% CSS opacity.

### 3. Accessibility Across Animations
Every decorative component respects prefers-reduced-motion:
- CursorGlow: returns null
- CSS keyframes: single @media block disables all (40+ animations)
- LottieAnimation: calls goToAndStop(0)
- ShaderGradient: static decorative background remains

### 4. dayjs Locale Side-Effect Import
import 'dayjs/locale/ms' must execute before .locale('ms') call. ES module hoisting guarantees this; ~2KB gzipped overhead acceptable.

---

## Lessons Learned

1. The "single copy function" pattern scales well — add key to both language branches, use in any component.
2. Severity -> CSS class mapping should be centralized — some inline computation still occurs; future refactor opportunity.
3. rAF throttling for mousemove is essential — prevents layout thrashing at 120Hz+.
4. Three.js as decorative background works when opacity is low — perceived as ambient depth.
5. Nature-themed SVG decorations add disproportionate polish relative to their complexity.
6. Staggered negative animation-delay on ambient elements prevents synchronization — perpetual organic drift.

---

## Next Day Preview (Day 9)

- Complete full glass-morphism CSS design system
- Implement all CSS animations (brand logo, temperature, hero, sidebar, chart)
- Add responsive design with breakpoints at 1180px and 640px
- Add @media (prefers-reduced-motion: reduce) support
- Final visual polish and consistency checks
