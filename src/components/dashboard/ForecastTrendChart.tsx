import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartDataset,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { type ForecastDay } from '../../shared/dashboard.ts'
import { getDashboardCopy, type AppLocale } from '../../i18n/dashboard.ts'
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

type ForecastTrendChartProps = {
  selectedLocationLabel: string
  forecastDays: ForecastDay[]
  activeForecastIndex: number | null
  onActiveForecastIndexChange: (index: number | null) => void
  locale: AppLocale
}

export function ForecastTrendChart({
  selectedLocationLabel,
  forecastDays,
  activeForecastIndex,
  onActiveForecastIndexChange,
  locale,
}: ForecastTrendChartProps) {
  const copy = getDashboardCopy(locale)
  const highlightedIndex = activeForecastIndex ?? 0

  const rainDataset: ChartDataset<ForecastChartType> = {
    type: 'bar',
    label: copy.chart.datasets.rain,
    data: forecastDays.map((day) => day.rainChance),
    backgroundColor: forecastDays.map((_, index) =>
      index === highlightedIndex
        ? 'rgba(14, 165, 233, 0.34)'
        : index === 0
          ? 'rgba(14, 165, 233, 0.24)'
          : 'rgba(14, 165, 233, 0.14)',
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
    label: copy.chart.datasets.high,
    data: forecastDays.map((day) => day.high),
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
    pointBackgroundColor: forecastDays.map((_, index) =>
      index === highlightedIndex ? '#0f172a' : index === 0 ? '#1d4ed8' : '#2563eb',
    ),
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: forecastDays.map((_, index) =>
      index === highlightedIndex ? 6 : index === 0 ? 5 : 4,
    ),
    pointHoverRadius: 7,
    fill: true,
    tension: 0.38,
    yAxisID: 'temp',
    order: 1,
  }

  const lowDataset: ChartDataset<ForecastChartType> = {
    type: 'line',
    label: copy.chart.datasets.low,
    data: forecastDays.map((day) => day.low),
    borderColor: '#60a5fa',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    pointBackgroundColor: forecastDays.map((_, index) =>
      index === highlightedIndex ? '#0ea5e9' : index === 0 ? '#38bdf8' : '#60a5fa',
    ),
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: forecastDays.map((_, index) =>
      index === highlightedIndex ? 6 : index === 0 ? 5 : 4,
    ),
    pointHoverRadius: 7,
    fill: false,
    tension: 0.34,
    yAxisID: 'temp',
    order: 2,
  }

  const chartLabels = forecastDays.map((day, index) =>
    index === 0
      ? `${formatForecastLabel(day.date, locale)} - ${copy.common.today}`
      : formatForecastLabel(day.date, locale),
  )

  const forecastChartData: ChartData<ForecastChartType> = {
    labels: chartLabels,
    datasets: [rainDataset, highDataset, lowDataset],
  }

  const chartOptions: ChartOptions<ForecastChartType> = {
    responsive: true,
    maintainAspectRatio: false,
    locale: locale === 'bm' ? 'ms-MY' : 'en-US',
    animation: {
      duration: 620,
      easing: 'easeOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    onHover: (_event, activeElements) => {
      const hoveredIndex = activeElements[0]?.index

      onActiveForecastIndexChange(typeof hoveredIndex === 'number' ? hoveredIndex : null)
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

            return String(item.label)
          },
          label(context) {
            const label = context.dataset.label ?? ''
            const value = context.parsed.y
            const unit = context.dataset.yAxisID === 'rain' ? '%' : '\u00B0C'

            return `${label}: ${value}${unit}`
          },
          afterBody(items) {
            const firstItem = items[0]
            const day =
              typeof firstItem?.dataIndex === 'number'
                ? forecastDays[firstItem.dataIndex]
              : null

            if (!day) {
              return []
            }

            return [
              `${copy.chart.tooltipSummary}: ${day.summary}`,
              `${copy.chart.tooltipHumidity}: ${day.humidity}%`,
            ]
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
          text: copy.chart.axes.day,
          color: '#64748b',
          font: {
            family: 'Manrope',
            size: 12,
            weight: 700,
          },
        },
        ticks: {
          font: {
            family: 'Manrope',
            weight(context) {
              return context.index === highlightedIndex ? 800 : 700
            },
          },
          color(context) {
            return context.index === highlightedIndex ? '#0f172a' : '#64748b'
          },
        },
      },
      temp: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: copy.chart.axes.temp,
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
          text: copy.chart.axes.rain,
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
                {copy.chart.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {copy.chart.title(selectedLocationLabel)}
              </h2>
            </div>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-7 text-slate-600">
          {copy.chart.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
        {copy.chart.badges.map((badge) => (
          <span key={badge} className="glass-chip text-slate-700">
            {badge}
          </span>
        ))}
      </div>

      <div
        key={`${selectedLocationLabel}-${locale}`}
        className="chart-stage-in mt-6 h-[260px] rounded-2xl border border-white/40 bg-white/30 p-3 backdrop-blur-xl sm:h-[320px] sm:p-5"
        onMouseLeave={() => onActiveForecastIndexChange(null)}
      >
        <Chart<'bar' | 'line'> type="bar" data={forecastChartData} options={chartOptions} />
      </div>
    </article>
  )
}
