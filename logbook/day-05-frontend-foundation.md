# CPWeather — Day 5 Logbook: Frontend Foundation & Layout

**Date:** Day 5  
**Phase:** Frontend Shell & UI Framework  
**Status:** Complete

---

## 1. Objectives

- Establish the React entry point (main.tsx) with StrictMode and app-level error boundary.
- Build root App.tsx component orchestrating location state, locale state, data fetching, and full dashboard layout grid.
- Create class-based AppErrorBoundary catching render crashes and providing recovery UI.
- Build comprehensive glass-morphism CSS design system in index.css.
- Import and configure Manrope typeface from Google Fonts.
- Build DashboardHeader with animated brand mark, LocationPicker dropdown, language toggle, live clock, cache-status badge, and manual refresh.
- Create icons.tsx — library of 16 hand-crafted SVG icon components including animated brand logo and wordmark.
- Build DashboardLoadingState and DashboardInitialErrorState.
- Populate mockData.ts with realistic location-specific weather snapshots for all 10 Perak locations.

---

## 2. Tasks Completed

### 2.1 Entry Point — src/main.tsx

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AppErrorBoundary from './AppErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
```

### 2.2 Root Component — src/App.tsx

State management:
| State | Type | Purpose |
|---|---|---|
| selectedLocation | LocationKey | Active location; defaults to 'tapah' |
| locale | AppLocale ('en' | 'bm') | Resolved from localStorage -> navigator.language -> 'en' |
| activeForecastIndex | number | null | Hovered forecast day for chart/sidebar sync |

Rendering logic (three-branch):
- !payload && isLoading -> DashboardLoadingState
- !payload -> DashboardInitialErrorState
- otherwise -> full dashboard layout

Full dashboard grid:
```
ShaderGradientBackground (fixed WebGL)
CursorGlow (fixed radial gradient)
  page-grid
    DashboardHeader
    [Error banner if stale-data-with-retry]
    main: DashboardHero + ForecastSidebar (1fr + 22rem)
    section: ForecastTrendChart + WarningFeed (1.18fr + 0.82fr)
    footer
```

### 2.3 Error Boundary — AppErrorBoundary.tsx

Class-based React error boundary (86 lines) with recovery UI:
- "Try rendering again" button — clears error state, re-attempts render
- "Reload page" button — hard reload for corrupted module state
- Rose-tinted callout box showing error message
- Console logging in componentDidCatch for debugging

### 2.4 Glass-Morphism CSS Design System — index.css

**Glass panel hierarchy:**

| Class | Blur | Use Case |
|---|---|---|
| glass-panel / surface-panel | 24px | Header, hero, loading/error screens |
| glass-inner-panel / surface-section | 20px | Nested sections |
| glass-widget / surface-widget | 18px | Compact cards |
| glass-chip / surface-chip | 14px | Badges, segment controls |

**Rim-light directional borders:**
```css
border-top-color: rgba(255,255,255,0.94);     /* brightest */
border-left-color: rgba(255,255,255,0.55);
border-right-color: rgba(255,255,255,0.22);
border-bottom-color: rgba(255,255,255,0.08);  /* darkest */
```

**Diagonal light-sweep on hover:**
::after pseudo-element with 215deg linear gradient, cubic-bezier transition.
Lift-on-hover transforms with translateY(-4px).

### 2.5 DashboardHeader Component

Layout structure:
```
header (surface-panel)
  LEFT: Brand mark + BrandWordmark + "Perak, Malaysia"
  RIGHT:
    LocationPicker dropdown (10 locations, animated menu)
    Language toggle (BM | EN segment control)
    Clock + Cache badge (color-coded: emerald/amber)
    Refresh button
```

Location picker behavior:
- Click trigger toggles menu; mousedown/keydown listeners for outside-click close
- Each option: aria-selected, role="option"
- Active option: green check icon + "Current" badge
- Menu entry animation: header-location-menu-in (260ms)

### 2.6 Icon Library — icons.tsx

16 hand-crafted SVG icons:
WeatherIcon, BrandWeatherLogo (animated: orbit spin, sun pulse, cloud drift, rain fall, signal pulse), BrandWordmark (gradient text + sheen + underline), ThermometerIcon, SkyIcon, AirIcon, RiskIcon, DropIcon, TrailIcon, AlertIcon, RefreshIcon, ChartIcon, LocationPinIcon, ClockIcon, ChevronDownIcon, CheckIcon

### 2.7 Loading & Error States

**DashboardLoadingState:**
- Uses same page-shell + page-grid structure as real dashboard
- Two placeholder panels with animate-pulse
- Preview of the asymmetric hero + sidebar layout ratio
- All copy localized via getDashboardCopy(locale)

**DashboardInitialErrorState:**
- Full-page error screen with recovery
- Retry button + "Switch to mock data" option
- Error message in rose-tinted surface-panel
- All copy localized

### 2.8 mockData.ts

Complete mock payloads for all 10 Perak locations with:
- Location-specific temperature ranges (Cameron Highlands 17-23degC, Ipoh 26-34degC)
- Realistic weather summaries
- Location-specific warning scenarios
- Per-location hiking verdicts and reasons
- 5-day forecast data
- Style class maps (hikeClasses, airBandClasses, rainChanceClasses, severityChipClasses)

### 2.9 CSS Animations

Brand logo animations: orbit-spin (14s), sun-pulse (5.8s), cloud-drift (7.6s), rain-fall (1.9s staggered), signal-pulse (4.2s)
Brand wordmark animations: weather-float (8.6s), sun-pulse (6.2s), rain-fall (2.3s), sheen-slide (9.4s), line-flow (7.8s)
Header: location-menu-in (260ms), location-value-swap (320ms), location-check-pop (360ms)
Reduced-motion: @media block disables all animations, hides cursor glow

---

## 3. Challenges

### 3.1 SVG Composition for Brand Logo
5 independently animated groups (orbit, sun, cloud, rain x3, signal) in a 64x64 viewBox required careful coordinate alignment and staggered animation timings.

### 3.2 Location Picker Dropdown Positioning
Dropdown must overflow the glass panel but remain accessible. Used position: absolute with top:[calc(100%+0.7rem)] on the trigger container with relative positioning.

### 3.3 Glass Panel Stacking Context
::after diagonal sweep pseudo-elements were blocking clicks on interactive children. Fixed with isolation: isolate on the panel and z-index: -1 + pointer-events: none on ::after.

### 3.4 mockData.ts Size
Maintaining realistic data for 10 locations with consistent contract shapes required careful data entry and verification with isDashboardPayload().

---

## 4. Lessons Learned

1. Error boundaries should have recovery, not just fallback UI — "Try again" is gentler than forcing a full page reload.
2. Glass-morphism requires rim-light borders (not uniform borders) to sell the material illusion.
3. SVG icons with currentColor inherit parent color — same icon renders in different semantic colors.
4. The key prop is a legitimate state-reset mechanism for third-party components.
5. Loading state should mirror the real layout structure for seamless transition.

---

## 5. Files Created/Modified

| File | Lines | Purpose |
|---|---|---|
| src/main.tsx | 14 | React DOM entry point |
| src/App.tsx | 150 | Root component with layout orchestration |
| src/AppErrorBoundary.tsx | 86 | Class-based error boundary |
| src/index.css | ~1271 | Complete glass design system + animations |
| src/components/dashboard/DashboardHeader.tsx | 264 | Header with all controls |
| src/components/dashboard/icons.tsx | 365 | 16 SVG icon components |
| src/components/dashboard/DashboardLoadingState.tsx | 32 | Loading skeleton |
| src/components/dashboard/DashboardInitialErrorState.tsx | 39 | Error recovery screen |
| src/mockData.ts | ~400 | Mock payloads for all 10 locations |

---

## Next Day Preview (Day 6)

- Build DashboardHero with temperature display, overview, hiking card, AQI/rain/warnings widgets
- Create TemperatureDisplay — animated SVG thermometer
- Implement hiking outlook card with verdict/confidence/reason/cues
- Build Air Quality, Rain Window, and Warnings Summary widgets
- Create SemanticHighlight for keyword highlighting
- Build LottieAnimation component
