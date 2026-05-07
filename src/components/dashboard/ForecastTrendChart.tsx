import {
  BarElement,
  BarController,
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartDataset,
  Filler,
  Legend,
  LineElement,
  LineController,
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
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
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
  const rainBarColor = (rainChance: number, index: number) => {
    const opacity = index === highlightedIndex ? 0.4 : index === 0 ? 0.28 : 0.18

    if (rainChance >= 65) {
      return `rgba(244, 63, 94, ${opacity})`
    }

    if (rainChance >= 45) {
      return `rgba(245, 158, 11, ${opacity})`
    }

    return `rgba(16, 185, 129, ${opacity})`
  }

  const rainDataset: ChartDataset<ForecastChartType> = {
    type: 'bar',
    label: copy.chart.datasets.rain,
    data: forecastDays.map((day) => day.rainChance),
    backgroundColor: forecastDays.map((day, index) => rainBarColor(day.rainChance, index)),
    borderColor: forecastDays.map((day) =>
      day.rainChance >= 65 ? '#f43f5e' : day.rainChance >= 45 ? '#f59e0b' : '#10b981',
    ),
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
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    pointBackgroundColor: forecastDays.map((_, index) =>
      index === highlightedIndex ? '#064e3b' : index === 0 ? '#059669' : '#10b981',
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
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
    pointBackgroundColor: forecastDays.map((_, index) =>
      index === highlightedIndex ? '#064e3b' : index === 0 ? '#34d399' : '#6ee7b7',
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
      duration: 220,
      easing: 'easeOutCubic',
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
          color: '#065f46',
          font: {
            family: 'Manrope',
            size: 12,
            weight: 700,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(6, 78, 59, 0.95)',
        titleColor: '#ecfdf5',
        bodyColor: '#d1fae5',
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
          color: '#047857',
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
            return context.index === highlightedIndex ? '#064e3b' : '#047857'
          },
        },
      },
      temp: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: copy.chart.axes.temp,
          color: '#047857',
          font: {
            family: 'Manrope',
            size: 12,
            weight: 700,
          },
        },
        ticks: {
          color: '#047857',
          callback: (value) => `${value}\u00B0`,
          font: {
            family: 'Manrope',
            weight: 600,
          },
        },
        grid: {
          color: 'rgba(5, 150, 105, 0.1)',
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
          color: '#047857',
          font: {
            family: 'Manrope',
            size: 12,
            weight: 700,
          },
        },
        ticks: {
          color: '#047857',
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
    <article className="analytics-panel surface-panel min-w-0 p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 text-emerald-600">
            <span className="icon-pill">
              <ChartIcon />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600/80">
                {copy.chart.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-emerald-900">
                {copy.chart.title(selectedLocationLabel)}
              </h2>
            </div>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-7 text-emerald-800/70">
          {copy.chart.description}
        </p>
      </div>

      <div
        key={`${selectedLocationLabel}-${locale}`}
        className="chart-canvas-frame mt-6 h-[260px] rounded-2xl border border-emerald-100 bg-white/60 p-3 sm:h-[320px] sm:p-5"
        onMouseLeave={() => onActiveForecastIndexChange(null)}
      >
        <Chart<'bar' | 'line'> type="bar" data={forecastChartData} options={chartOptions} />
      </div>
    </article>
  )
}
