import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartDataset,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import dayjs from 'dayjs'
import { Chart } from 'react-chartjs-2'
import { type ForecastDay } from '../../shared/dashboard.ts'
import { formatForecastLabel } from './display.ts'
import { ChartIcon } from './icons.tsx'

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

type ForecastChartType = 'bar' | 'line'

const chartOptions: ChartOptions<ForecastChartType> = {
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
        usePointStyle: false,
        boxWidth: 14,
        color: '#334155',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      padding: 12,
      displayColors: true,
      callbacks: {
        title(items) {
          const item = items[0]

          if (!item) {
            return ''
          }

          return dayjs(item.label).isValid()
            ? dayjs(item.label).format('ddd, D MMM')
            : String(item.label)
        },
        label(context) {
          const label = context.dataset.label ?? ''
          const value = context.parsed.y
          const unit = context.dataset.yAxisID === 'rain' ? '%' : '\u00B0C'

          return `${label}: ${value}${unit}`
        },
        afterBody(items) {
          const item = items[0]
          const raw = item?.raw
          const humidity =
            raw &&
            typeof raw === 'object' &&
            'humidity' in raw &&
            typeof raw.humidity === 'number'
              ? raw.humidity
              : null

          if (typeof humidity !== 'number') {
            return []
          }

          return [`Humidity: ${humidity}%`]
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      title: {
        display: true,
        text: 'Day',
        color: '#64748b',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
      ticks: {
        color(context) {
          return context.index === 0 ? '#0f172a' : '#64748b'
        },
        font: {
          family: 'Manrope',
          weight(context) {
            return context.index === 0 ? 800 : 700
          },
        },
      },
    },
    temp: {
      type: 'linear',
      position: 'left',
      title: {
        display: true,
        text: 'Temperature (\u00B0C)',
        color: '#64748b',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
      ticks: {
        color: '#64748b',
        callback: (value) => `${value}\u00B0`,
        font: {
          family: 'Manrope',
          weight: 600,
        },
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.18)',
      },
      border: {
        display: false,
      },
    },
    rain: {
      type: 'linear',
      position: 'right',
      min: 0,
      max: 100,
      title: {
        display: true,
        text: 'Rain Probability (%)',
        color: '#64748b',
        font: {
          family: 'Manrope',
          size: 12,
          weight: 700,
        },
      },
      ticks: {
        color: '#64748b',
        callback: (value) => `${value}%`,
        font: {
          family: 'Manrope',
          weight: 600,
        },
      },
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
    },
  },
}

type ForecastTrendChartProps = {
  selectedLocationLabel: string
  forecastDays: ForecastDay[]
}

export function ForecastTrendChart({
  selectedLocationLabel,
  forecastDays,
}: ForecastTrendChartProps) {
  const rainDataset: ChartDataset<ForecastChartType> = {
    type: 'bar',
    label: 'Rain %',
    data: forecastDays.map((day) => day.rainChance),
    backgroundColor: forecastDays.map((_, index) =>
      index === 0 ? 'rgba(14, 165, 233, 0.28)' : 'rgba(14, 165, 233, 0.16)',
    ),
    borderColor: '#0ea5e9',
    borderRadius: 999,
    borderSkipped: false,
    maxBarThickness: 22,
    yAxisID: 'rain',
    order: 3,
  }

  const highDataset: ChartDataset<ForecastChartType> = {
    type: 'line',
    label: 'High',
    data: forecastDays.map((day) => day.high),
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
    pointBackgroundColor: forecastDays.map((_, index) =>
      index === 0 ? '#0f172a' : '#2563eb',
    ),
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: forecastDays.map((_, index) => (index === 0 ? 5 : 4)),
    pointHoverRadius: 6,
    fill: true,
    tension: 0.38,
    yAxisID: 'temp',
    order: 1,
  }

  const lowDataset: ChartDataset<ForecastChartType> = {
    type: 'line',
    label: 'Low',
    data: forecastDays.map((day) => day.low),
    borderColor: '#60a5fa',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    pointBackgroundColor: forecastDays.map((_, index) =>
      index === 0 ? '#38bdf8' : '#60a5fa',
    ),
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: forecastDays.map((_, index) => (index === 0 ? 5 : 4)),
    pointHoverRadius: 6,
    fill: false,
    tension: 0.34,
    yAxisID: 'temp',
    order: 2,
  }

  const chartLabels = forecastDays.map((day, index) =>
    index === 0 ? `${formatForecastLabel(day.date)} • Today` : formatForecastLabel(day.date),
  )

  const forecastChartData: ChartData<ForecastChartType> = {
    labels: chartLabels,
    datasets: [rainDataset, highDataset, lowDataset],
  }

  return (
    <article className="glass-panel min-w-0 p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 text-sky-600">
            <span className="icon-pill">
              <ChartIcon />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700/85">
                Forecast Trend
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                5-day temperature and rain trend for {selectedLocationLabel}
              </h2>
            </div>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-7 text-slate-600">
          High and low temperatures stay on the left axis, while rain probability uses the right
          axis so the pattern reads faster.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
        <span className="glass-chip text-slate-700">Today is highlighted first</span>
        <span className="glass-chip text-slate-700">Rain uses bars on the right axis</span>
      </div>

      <div className="mt-6 h-[260px] rounded-2xl border border-white/40 bg-white/30 p-3 backdrop-blur-xl sm:h-[320px] sm:p-5">
        <Chart<'bar' | 'line'> type="bar" data={forecastChartData} options={chartOptions} />
      </div>
    </article>
  )
}
