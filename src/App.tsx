import { useState } from 'react'
import dayjs from 'dayjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import {
  airBandClasses,
  dashboardMocks,
  hikeClasses,
  locations,
  severityClasses,
  type AirBand,
  type LocationKey,
} from './mockData'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 10,
        color: '#244137',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
    },
    tooltip: {
      backgroundColor: '#0f2b24',
      titleColor: '#f6f2e8',
      bodyColor: '#eef4ed',
      padding: 12,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#4f655c',
        font: {
          family: 'Manrope',
          weight: 700,
        },
      },
    },
    y: {
      suggestedMin: 20,
      suggestedMax: 36,
      ticks: {
        color: '#4f655c',
        callback: (value) => `${value}°`,
        font: {
          family: 'Manrope',
          weight: 600,
        },
      },
      grid: {
        color: 'rgba(79, 101, 92, 0.14)',
      },
      border: {
        display: false,
      },
    },
  },
}

function formatForecastLabel(date: string) {
  return dayjs(date).format('ddd')
}

function formatForecastDate(date: string) {
  return dayjs(date).format('D MMM')
}

function statusCopy(airBand: AirBand) {
  if (airBand === 'Good') return 'Easy day for most outdoor plans.'
  if (airBand === 'Moderate') return 'Fine for most people, but pace sensitive activities.'
  return 'Reduce long outdoor exposure where possible.'
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>('ipoh')
  const snapshot = dashboardMocks[selectedLocation]

  const tempChartData = {
    labels: snapshot.forecast.map((day) => formatForecastLabel(day.date)),
    datasets: [
      {
        label: 'Day High',
        data: snapshot.forecast.map((day) => day.high),
        borderColor: '#14532d',
        backgroundColor: 'rgba(20, 83, 45, 0.16)',
        pointBackgroundColor: '#14532d',
        pointBorderColor: '#f8f5eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Night Low',
        data: snapshot.forecast.map((day) => day.low),
        borderColor: '#d5a03d',
        backgroundColor: 'rgba(213, 160, 61, 0.12)',
        pointBackgroundColor: '#d5a03d',
        pointBorderColor: '#f8f5eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.35,
      },
    ],
  }

  const warningCountLabel =
    snapshot.warnings.length === 1 ? '1 active watch' : `${snapshot.warnings.length} active items`

  return (
    <div className="relative min-h-screen overflow-hidden text-[#17352d]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="panel relative overflow-hidden p-6 sm:p-7 lg:p-9">
          <div className="absolute inset-y-0 right-0 hidden w-2/5 rounded-l-[48px] ambient-cut lg:block" />

          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="subtle-label rounded-full border border-white/70 bg-white/65 px-3 py-1">
                  Perak Weather + API Dashboard
                </span>
                <span className="rounded-full border border-amber-900/10 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/75">
                  Mock UI Mode
                </span>
              </div>

              <div className="mt-5 max-w-3xl">
                <h1 className="display-face text-4xl leading-tight text-[#102820] sm:text-5xl lg:text-[3.55rem]">
                  Plan around haze, sudden rain, and the trips people actually take.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-950/75 sm:text-lg">
                  This first screen runs on dummy JSON so we can shape the experience before real
                  API wiring. The focus stays practical: forecast confidence, AQI, local warnings,
                  and one fast answer for today’s outdoor plan.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {locations.map((location) => {
                  const isActive = location.key === selectedLocation

                  return (
                    <button
                      key={location.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedLocation(location.key)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-[#16392f] text-white shadow-[0_14px_28px_-18px_rgba(11,37,30,0.9)]'
                          : 'border border-white/80 bg-white/60 text-emerald-950/75 hover:bg-white'
                      }`}
                    >
                      {location.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="value-card">
                  <p className="subtle-label">Current Lens</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.label}</p>
                  <p className="mt-1 text-sm text-emerald-950/65">{snapshot.district}</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Air Quality</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-sm font-bold ${airBandClasses[snapshot.airBand]}`}>
                      AQI {snapshot.aqi}
                    </span>
                    <span className="text-sm font-semibold text-emerald-950/70">{snapshot.airBand}</span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-950/65">{statusCopy(snapshot.airBand)}</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Rain Timing</p>
                  <p className="mt-3 text-xl font-extrabold text-[#102820]">{snapshot.nextRainWindow}</p>
                  <p className="mt-2 text-sm text-emerald-950/65">{warningCountLabel}</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Cache Freshness</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.cacheAgeMinutes} min</p>
                  <p className="mt-1 text-sm text-emerald-950/65">
                    Last refreshed {dayjs(snapshot.updatedAt).format('h:mm A')}
                  </p>
                </div>
              </div>
            </div>

            <aside className="relative rounded-[30px] p-6 text-white shadow-[0_26px_80px_-34px_rgba(9,27,22,0.9)] ambient-cut sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/65">
                Trip Lens
              </p>
              <h2 className="display-face mt-4 text-3xl leading-tight sm:text-[2.2rem]">
                Can I hike {snapshot.hikeTip.target} today?
              </h2>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-4 py-2 text-sm font-bold ${hikeClasses[snapshot.hikeTip.verdict]}`}>
                  {snapshot.hikeTip.verdict}
                </span>
                <span className="text-sm font-semibold text-white/72">
                  Confidence {snapshot.hikeTip.confidence}%
                </span>
              </div>
              <p className="mt-5 text-lg font-semibold text-white/94">{snapshot.hikeTip.title}</p>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/78">{snapshot.hikeTip.reason}</p>

              <div className="mt-8 rounded-[24px] border border-white/10 bg-black/15 p-4 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
                  Field Note
                </p>
                <p className="mt-3 text-sm leading-7 text-white/80">{snapshot.overview}</p>
              </div>
            </aside>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="panel p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="subtle-label">5-Day Forecast</p>
                <h2 className="display-face mt-2 text-3xl text-[#102820]">Temperature swing for the next five days</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-emerald-950/65">
                Dummy data for now, but the layout is ready for the OpenWeather 5-day feed and Malaysia warning blend.
              </p>
            </div>

            <div className="mt-6 h-[300px] rounded-[26px] border border-white/70 bg-[#f8f5eb]/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:p-5">
              <Line data={tempChartData} options={chartOptions} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {snapshot.forecast.map((day) => (
                <article key={day.date} className="forecast-row">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#18382f]">
                        {formatForecastLabel(day.date)}
                      </p>
                      <p className="mt-1 text-sm text-emerald-950/60">{formatForecastDate(day.date)}</p>
                    </div>
                    <p className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-950/65">
                      {day.rainChance}% rain
                    </p>
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <p className="text-3xl font-black text-[#102820]">{day.high}°</p>
                    <p className="pb-1 text-sm font-semibold text-emerald-950/55">/{day.low}°</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-emerald-950/72">{day.summary}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-emerald-950/55">
                      <span>Humidity</span>
                      <span>{day.humidity}%</span>
                    </div>
                    <div className="stat-meter mt-2">
                      <span style={{ width: `${day.humidity}%` }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6">
            <section className="panel p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="subtle-label">Air Quality</p>
                  <h2 className="display-face mt-2 text-3xl text-[#102820]">AQI snapshot</h2>
                </div>
                <span className={`rounded-full px-3 py-2 text-sm font-bold ${airBandClasses[snapshot.airBand]}`}>
                  {snapshot.airBand}
                </span>
              </div>

              <div className="mt-6 rounded-[26px] bg-[#f7f4eb] p-5">
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-black tracking-tight text-[#102820]">{snapshot.aqi}</p>
                  <p className="pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-950/55">
                    AQI Index
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-emerald-950/68">{statusCopy(snapshot.airBand)}</p>
                <div className="stat-meter mt-5">
                  <span style={{ width: `${Math.min((snapshot.aqi / 120) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="value-card">
                  <p className="subtle-label">PM2.5</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.pollutants.pm25} µg/m³</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">PM10</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.pollutants.pm10} µg/m³</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">Ozone</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.pollutants.o3} µg/m³</p>
                </div>
                <div className="value-card">
                  <p className="subtle-label">NO₂</p>
                  <p className="mt-3 text-2xl font-extrabold text-[#102820]">{snapshot.pollutants.no2} µg/m³</p>
                </div>
              </div>
            </section>

            <section className="panel p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="subtle-label">Malaysia Warnings</p>
                  <h2 className="display-face mt-2 text-3xl text-[#102820]">What needs attention today</h2>
                </div>
                <span className="rounded-full border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-emerald-950/72">
                  {warningCountLabel}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {snapshot.warnings.map((warning) => (
                  <article
                    key={`${warning.title}-${warning.window}`}
                    className={`rounded-[24px] border p-4 ${severityClasses[warning.severity]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-extrabold">{warning.title}</p>
                      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]">
                        {warning.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-current/60">
                      {warning.window}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-current/80">{warning.message}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <article className="panel p-6 sm:p-7">
            <p className="subtle-label">Source Blend</p>
            <h2 className="display-face mt-2 text-3xl text-[#102820]">How the live version will work</h2>
            <div className="mt-6 space-y-4">
              {[
                ['OpenWeather 5-day forecast', 'Primary temperature and rain trend for the chart.', 'queued'],
                ['OpenWeather air pollution', 'AQI plus PM2.5, PM10, O3 and NO2 readout.', 'queued'],
                ['MET Malaysia warnings', 'Government-issued warning copy for local risk context.', 'must-have'],
              ].map(([title, detail, status]) => (
                <div key={title} className="flex items-start justify-between gap-4 rounded-[22px] bg-[#f8f5eb]/90 px-4 py-4">
                  <div>
                    <p className="font-bold text-[#102820]">{title}</p>
                    <p className="mt-1 text-sm text-emerald-950/65">{detail}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                    status === 'must-have' ? 'bg-[#18392f] text-emerald-50' : 'bg-emerald-950 text-emerald-50'
                  }`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="subtle-label">Decision Rule</p>
                <h2 className="display-face mt-2 text-3xl text-[#102820]">How the hiking tip is decided</h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-emerald-950/65">
                We are keeping this logic explicit so the final app feels trustworthy instead of mysterious.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['Rule 1', 'Active warning beats everything', 'If there is a meaningful thunderstorm or heavy-rain warning, the answer tilts toward caution or skip.'],
                ['Rule 2', 'AQI changes the comfort level', 'Moderate air still allows most plans, but a poor reading downgrades long walks or hikes quickly.'],
                ['Rule 3', 'Rain timing shapes the final call', 'The app should explain when the dry window ends, not just say yes or no.'],
              ].map(([label, title, detail]) => (
                <div key={label} className="value-card">
                  <p className="subtle-label">{label}</p>
                  <p className="mt-3 text-lg font-extrabold text-[#102820]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-950/67">{detail}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}

export default App
