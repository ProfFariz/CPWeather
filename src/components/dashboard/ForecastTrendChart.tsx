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
import { type ForecastDay } from '../../shared/dashboard.ts'
import { formatForecastLabel } from './display.ts'
import { ChartIcon } from './icons.tsx'

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
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#64748b',
        font: {
          family: 'Manrope',
          weight: 700,
        },
      },
    },
    temp: {
      type: 'linear',
      position: 'left',
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
  forecastDays: ForecastDay[]
}

export function ForecastTrendChart({
  forecastDays,
}: ForecastTrendChartProps) {
  const forecastChartData = {
    labels: forecastDays.map((day) => formatForecastLabel(day.date)),
    datasets: [
      {
        label: 'High',
        data: forecastDays.map((day) => day.high),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.14)',
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.38,
        yAxisID: 'temp',
      },
      {
        label: 'Low',
        data: forecastDays.map((day) => day.low),
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.08)',
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.34,
        yAxisID: 'temp',
      },
      {
        label: 'Rain %',
        data: forecastDays.map((day) => day.rainChance),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.28,
        yAxisID: 'rain',
      },
    ],
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
                Temperature and rain over the next five days
              </h2>
            </div>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-7 text-slate-600">
          This restores the charting signal in the portfolio while keeping the new glass layout
          intact.
        </p>
      </div>

      <div className="mt-6 h-[260px] rounded-2xl border border-white/40 bg-white/30 p-3 backdrop-blur-xl sm:h-[320px] sm:p-5">
        <Line data={forecastChartData} options={chartOptions} />
      </div>
    </article>
  )
}
