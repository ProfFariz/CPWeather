# CPWeather — Day 6 Logbook: Hero Section & Weather Display

**Date:** Day 6  
**Focus:** Dashboard Hero, Temperature Display, Widgets, Semantic Highlighting & Lottie Animation  
**Status:** Complete

---

## 1. Objectives

- Build DashboardHero.tsx — the main hero section composing temperature display, overview narrative, hiking outlook card, and three status widgets (air quality, rain window, warnings summary).
- Create TemperatureDisplay.tsx — custom animated SVG thermometer rendering current temperature with orbit arcs, sun motif, cloud shape, gauge, and heat lines.
- Implement the hiking outlook card with verdict (Go/Caution/Skip), confidence percentage, title, reason text, and color-coded cue chips.
- Build air quality widget showing AQI number, translated air-band label, and human-readable status copy.
- Build rain window widget showing next rain window, rain-chance badge, and narrative sentence.
- Build warnings summary widget with severity-driven color coding and warning count.
- Create SemanticHighlight.tsx — regex-based component scanning text for ~100 English and BM keywords across four tones (good, caution, danger, info).
- Create display.ts — utility module exporting status copy functions, weather accent helpers, CSS class resolvers, and date formatting.
- Build LottieAnimation.tsx — dynamic Lottie player with lazy loading, reduce-motion respect, and cleanup.
- Implement the overview narrative section.

---

## 2. Tasks Completed

### 2.1 DashboardHero.tsx — Main Hero Component

Five logical zones assembled in a single section:

| Zone | Description |
|---|---|
| Location + timestamp chips | Two surface-chip spans showing {label}, Perak and formatted served-at time |
| Temperature + overview block | TemperatureDisplay SVG + current summary + overview paragraph |
| Hike cue chips | Flex-wrapped row of color-coded surface-chip spans |
| Hiking outlook card | Self-contained surface-section with verdict badge, confidence, title, reason |
| Three status widgets | 3-column grid: air quality, rain window, warnings summary |

Key data resolution:
```tsx
const heroTemperature = resolveCurrentTemp(payload)
// Prefers snapshot.currentTemp -> forecast midpoint -> 28degC default
```

### 2.2 TemperatureDisplay.tsx — Animated SVG Thermometer

SVG viewBox="0 0 278 158" with five layered groups:

| Group | Elements | CSS Animation |
|---|---|---|
| temperature-display-orbit | Two path arcs | orbit-flow (9.6s/7.8s) |
| temperature-display-sun | Circle + six path rays | sun-pulse (6.4s) |
| temperature-display-cloud | Two cloud paths | cloud-drift (8.4s) |
| temperature-display-reading | Large text + degree symbol | breathe (9.8s), degree-pop (4.8s) |
| temperature-display-gauge | Path + circle gauge | gauge-breathe (6.8s) |
| temperature-display-heat-lines | Three wavy paths | heat-rise (3.2s staggered) |

Accessibility: role="img" with aria-labelledby pointing to a title element.

### 2.3 Hiking Outlook Card

Data source: snapshot.hikeTip (HikeTip type):
- target: trail name (e.g. "Lata Iskandar route")
- verdict: Go/Caution/Skip
- confidence: 0-100 percentage
- title: One-line verdict explanation
- reason: Multi-sentence rationale
- cues: Color-coded contextual chips

**Color mapping:**
Go -> emerald/teal tones, "Teruskan"
Caution -> amber tones, "Berhati-hati"
Skip -> rose tones, "Tangguh"

### 2.4 Air Quality Widget

Structure:
```
Air Quality         [WeatherIcon]
AQI 46              [large number]
[Good badge]        [airBandClasses chip]
Air feels comfortable...
```

Color logic: Good->emerald, Moderate->amber, Poor->rose
Status copy localized via statusCopy(airBand, locale)

### 2.5 Rain Window Widget

Structure:
```
Rain Window          [DropIcon]
Best dry window: 8 AM-2 PM  [forecastSummaryClasses color]
Today's forecast... [38%]   [rainChanceClasses badge]
```

Rain chance coloring: <45%->emerald, 45-64%->amber, >=65%->rose
Next rain window colored by summary keywords + rain chance thresholds

### 2.6 Warnings Summary Widget

Severity-driven styling cascade:
- strongestWarningSeverity derived from warnings array (Alert > Watch > Monitor > null)
- Accent bar: rose/amber/emerald by severity
- Card border/background: rose/amber/emerald by severity
- Summary text: rose-800/amber-800/emerald-700

Zero-warnings state: emerald "Clear/Selamat" display

### 2.7 SemanticHighlight.tsx

Four SemanticTermGroup arrays with ~100 total terms across EN and BM:

| Tone | Example English | Example BM | Count |
|---|---|---|---|
| danger | "active warning", "thunderstorm", "skip" | "amaran aktif", "ribut", "tangguh" | ~30 |
| caution | "rain", "caution", "humidity" | "hujan", "waspada", "kelembapan" | ~28 |
| good | "comfortable", "dry window", "safest" | "selesa", "selamat", "tiada amaran" | ~14 |
| info | "aqi", "confidence", "forecast" | "keyakinan", "ramalan" | ~10 |

Implementation: Single RegExp built from all terms sorted longest-first, whole-word boundary detection using Unicode letter checks, wraps matches in semantic-term-{tone} spans.

### 2.8 display.ts — Display Utility Module

Pure functions centralizing display logic:
- statusCopy(airBand, locale) -> human-readable AQI description
- weatherAccent(summary, locale) -> dynamic weather label
- cacheStatusClasses(status) -> Tailwind classes for cache badge
- hikeCueClasses(tone) -> Tailwind classes for hike cue chips
- warningToneClasses(severity) -> Tailwind classes for warning border
- rainChanceClasses(rainChance) -> Tailwind classes by thresholds
- airQualityMetricClasses(airBand) -> Tailwind text color
- forecastSummaryClasses(summary, rainChance) -> combined keyword + threshold logic
- resolveCurrentTemp(payload) -> temperature with fallback chain
- formatForecastLabel(date, locale) -> dayjs-formatted weekday

### 2.9 LottieAnimation.tsx

Dynamic Lottie player design:
- Props: ariaLabel, description, className, loadAnimationData thunk
- Lazy loads lottie-web/build/player/lottie_light + animation JSON in parallel
- Detects prefers-reduced-motion: autoplay/loop disabled, freezes on frame 0
- isMounted flag prevents state updates after unmount
- animation.destroy() on cleanup releases all resources

### 2.10 Overview Narrative Section

Assembly from four sub-parts:
1. Weather accent label (dynamic chip like "Soft tropical conditions")
2. Current summary paragraph
3. Overview prose paragraph
4. Dynamic key prop triggers CSS re-entry animation on data change

---

## 3. Technical Deep-Dive: Widget Color System

Consistent tri-color language across all widgets:

| Data Band | Emerald | Amber | Rose |
|---|---|---|---|
| Air Band | Good | Moderate | Poor |
| Rain Chance | <45% | 45-64% | >=65% |
| Severity | Monitor | Watch | Alert |
| Hike Verdict | Go | Caution | Skip |
| Cue Tone | positive | caution | danger |

---

## 4. Challenges

1. **SVG thermometer composition:** 6 groups in 278x158 viewBox required careful coordinate alignment to avoid overlap.
2. **Regex whole-word matching:** Multi-word phrases like "active warning" needed longest-first sorting and Unicode boundary detection to avoid partial matches.
3. **Lottie reduce-motion:** Had to handle both autoplay/loop flags AND goToAndStop(0) for the static-first-frame fallback.
4. **Unified color thresholds:** Maintaining consistency between rainChanceClasses, forecastSummaryClasses, and SemanticHighlight tone groups required centralized logic in display.ts.

---

## 5. Files Created/Modified

| File | Lines | Purpose |
|---|---|---|
| src/components/dashboard/DashboardHero.tsx | 248 | Main hero section |
| src/components/dashboard/TemperatureDisplay.tsx | 73 | Animated SVG thermometer |
| src/components/dashboard/SemanticHighlight.tsx | 203 | Keyword highlighting |
| src/components/dashboard/display.ts | 159 | Display utility functions |
| src/components/dashboard/LottieAnimation.tsx | ~60 | Dynamic Lottie player |

---

## Next Day Preview (Day 7)

- Build ForecastSidebar with 5-day forecast and rain progress bars
- Build ForecastTrendChart with Chart.js dual-axis combo chart
- Implement hover sync between sidebar and chart
- Configure Chart.js with glass-morphism compatible styling
