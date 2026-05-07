# CPWeather — Day 7 Logbook: Forecast & Charts

**Date:** Day 7  
**Focus:** ForecastSidebar, ForecastTrendChart, Chart.js Integration, and Hover Synchronization  
**Status:** Complete

---

## Objectives

1. Build a vertical 5-day forecast sidebar (ForecastSidebar.tsx) with daily high/low temps, rain probability %, humidity %, summary text, and animated rain progress bars.
2. Build a forecast trend chart (ForecastTrendChart.tsx) using Chart.js 4.5.1 + react-chartjs-2 5.3.1 — combo chart with temperature lines on left Y-axis and precipitation bars on right Y-axis.
3. Implement bidirectional hover sync between chart and sidebar.
4. Configure Chart.js with glass-morphism-compatible colors, custom tooltips, responsive resizing, and locale-aware formatting.

---

## Tasks Completed

### 1. ForecastSidebar.tsx — Vertical 5-Day Forecast Rail

Rendered as a surface-panel aside (116 lines). Each forecast card structure:
- Weekday abbreviation + "Today" chip on index 0
- High temperature (text-2xl) + low temperature ("low" suffix)
- Weather summary text (color-coded via forecastSummaryClasses)
- Rain chance pill (color-coded via rainChanceClasses)
- Rain progress bar: h-2 rounded track with gradient-filled div at Math.min(rainChance, 100)% width

**Rain progress bar implementation:**
```tsx
<div className="mt-3 h-2 rounded-full bg-emerald-100/70">
  <div
    className={`h-full rounded-full bg-gradient-to-r ${
      day.rainChance >= 65 ? 'from-rose-400 to-rose-500'
      : day.rainChance >= 45 ? 'from-amber-400 to-amber-500'
      : 'from-emerald-400 to-emerald-500'
    }`}
    style={{ width: `${Math.min(day.rainChance, 100)}%` }}
  />
</div>
```

The bar animates via forecast-progress-fill CSS keyframe (820ms with spring curve).

**Hover/Focus handlers for chart sync:**
```tsx
onMouseEnter={() => onActiveForecastIndexChange(index)}
onMouseLeave={() => onActiveForecastIndexChange(null)}
```

Active card gets border-emerald-300/60 bg-white/80 + glow animation. Today's card (index 0) always has subtle elevated background.

### 2. ForecastTrendChart.tsx — Chart.js Combo Chart

331 lines. Registered controllers: BarController, BarElement, CategoryScale, LinearScale, PointElement, LineController, LineElement, Filler, Tooltip, Legend.

**Three Datasets:**

1. Rain Dataset (Bar, right Y-axis yAxisID: 'rain'):
   - data: forecastDays rainChance values
   - backgroundColor per-index with hue (rose/amber/emerald) + opacity tiers (0.4 highlighted, 0.28 today, 0.18 others)
   - borderRadius: 999 (fully rounded), maxBarThickness: 22

2. High Temperature Dataset (Line, left Y-axis yAxisID: 'temp'):
   - borderColor: #059669 (emerald-600)
   - fill: true with emerald tint
   - point radius varies: 6 for highlighted, 5 for today, 4 for others
   - tension: 0.38

3. Low Temperature Dataset (Line, same left Y-axis):
   - borderColor: #34d399 (emerald-400)
   - fill: false
   - tension: 0.34

**Dual-Axis Configuration:**
```ts
scales: {
  temp: { type: 'linear', position: 'left', title: 'Temperature (degC)' },
  rain: { type: 'linear', position: 'right', min: 0, max: 100, title: 'Rain Probability (%)' },
}
```

**Custom Tooltip:**
Dark emerald glass background (rgba(6, 78, 59, 0.95)) with three lines: title (formatted day label), body (dataset + value with unit), afterBody (weather summary + humidity).

### 3. Hover Sync Mechanism — Bidirectional Highlighting

Single state in App.tsx:
```ts
const [activeForecastIndex, setActiveForecastIndex] = useState<number | null>(null)
```

**Sidebar -> Chart:**
onMouseEnter sets index, onMouseLeave sets null. Chart re-renders with updated pointRadius, pointBackgroundColor, backgroundColor arrays.

**Chart -> Sidebar:**
```ts
onHover: (_event, activeElements) => {
  const hoveredIndex = activeElements[0]?.index
  onActiveForecastIndexChange(typeof hoveredIndex === 'number' ? hoveredIndex : null)
}
```
interaction.mode: 'index' ensures vertical-slice activation across all datasets.

### 4. Chart.js Configuration

- Animation: duration 220ms, easing easeOutCubic
- responsive: true, maintainAspectRatio: false
- locale: 'ms-MY' for BM, 'en-US' for English
- Legend: position top, Manrope font, emerald-800 color
- X-axis ticks: highlighted day bolder/darker
- Grid: temp gridlines faint emerald (rgba(5,150,105,0.1)), rain gridlines hidden
- Canvas wrapper key={selectedLocationLabel}-{locale} forces remount on changes

---

## Challenges Encountered

### 1. Chart.js Mixed Chart Type Complexity
Chart.js doesn't natively support mixed 'bar' | 'line' types without explicit controller registration. Required registering both BarController and LineController, setting type='bar' on Chart while each dataset carries its own type.

### 2. Chart.js Internal State Staleness
When switching locations, chart retained previous data for one frame. Fixed with key={selectedLocationLabel}-{locale} on the wrapper div forcing React remount.

### 3. Hover Event Debouncing
onHover fires on every pixel of mouse movement. Chart.js handles this internally with requestAnimationFrame throttling; React reconciliation is light enough (only two component re-renders).

### 4. Dual-Axis Grid Alignment
Temp gridlines could clash with rain bars. Disabled rain gridlines and set temp gridlines to very faint (opacity 0.1).

### 5. X-Axis Label Density
Five day labels could overlap on 320px mobile. responsive: true + maintainAspectRatio: false + Tailwind h-[260px] sm:h-[320px] ensures enough vertical space. maxBarThickness: 22 prevents overly wide bars.

---

## Lessons Learned

1. Chart.js tree-shaking matters — registering only 10 modules keeps the bundle significantly smaller than importing chart.js/auto.
2. Per-dataset opacity arrays create "focus highlight" effects entirely within Chart.js — no CSS hacks needed.
3. key prop is a legitimate state-reset mechanism for third-party libraries with internal mutable state.
4. onMouseLeave on wrapper div is more reliable than Chart.js leave detection for guaranteed cleanup.
5. Glass-morphism + data visualization works best with restrained opacity (0.06-0.28 alpha).
6. Dual Y-axes need thoughtful defaults — fixed min:0, max:100 on rain axis, auto-scale temperature for variable ranges.

---

## Files Created/Modified

| File | Lines | Action |
|---|---|---|
| src/components/dashboard/ForecastSidebar.tsx | 116 | Created |
| src/components/dashboard/ForecastTrendChart.tsx | 331 | Created |
| src/components/dashboard/display.ts | 159 | Extended (formatForecastLabel, rainChanceClasses, forecastSummaryClasses) |
| src/i18n/dashboard.ts | 310 | Extended (sidebar, chart copy sections EN + BM) |
| src/App.tsx | 150 | Modified (sidebar + chart integration, activeForecastIndex state) |
| src/index.css | ~1271 | Extended (sidebar/chart animations) |

---

## Next Day Preview (Day 8)

- Build WarningFeed with severity-driven styling
- Implement full bilingual i18n system (English/Bahasa Malaysia)
- Build translation helper functions
- Wire dayjs locale switching
- Create decorative animation components (NatureDecor, CursorGlow, ShaderGradientBackground)
