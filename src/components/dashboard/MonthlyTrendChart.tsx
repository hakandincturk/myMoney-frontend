import React from 'react'
import { useTranslation } from 'react-i18next'
import { Line } from 'react-chartjs-2'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { ChartConfigFactory, ChartDataProcessor } from '../../utils/chartUtils'
import { useChartTheme } from '../../hooks/useCharts'
import { CHART_DIMENSIONS } from '../../constants/charts'
import type { ChartDataPoint } from '../../types/charts'

interface MonthlyTrendChartProps {
  data: ChartDataPoint[]
  isLoading?: boolean
  hasError?: boolean
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  isLoading = false,
  hasError = false,
}) => {
  const { t } = useTranslation()
  const theme = useChartTheme()

  const configFactory = new ChartConfigFactory(theme, t)
  const chartConfig = configFactory.createLineChartConfig()
  const chartData = ChartDataProcessor.createLineChartData(data)

  if (isLoading) {
    return (
      <Card 
        title={t('dashboard.monthlyIncomeExpenseTrend')} 
        subtitle={t('dashboard.chartsDataLoading')}
        className="hover:shadow-md transition-all duration-200"
      >
        <div className={`h-${CHART_DIMENSIONS.LINE_CHART_HEIGHT / 4} flex items-center justify-center relative`}>
          <div className="space-y-4 w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {t('dashboard.chartsDataLoading')}
              </span>
            </div>
            <Skeleton className="h-4 w-3/4 animate-pulse" />
            <Skeleton className="h-4 w-1/2 animate-pulse" />
            <Skeleton className="h-32 w-full animate-pulse rounded-lg" />
            <div className="flex justify-center space-x-2">
              <Skeleton className="h-3 w-16 animate-pulse" />
              <Skeleton className="h-3 w-16 animate-pulse" />
              <Skeleton className="h-3 w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card 
        title={t('dashboard.monthlyIncomeExpenseTrend')} 
        subtitle={t('dashboard.chartsLoadError')}
        className="hover:shadow-md transition-all duration-200"
      >
        <div className={`h-${CHART_DIMENSIONS.LINE_CHART_HEIGHT / 4} flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-4`}>
          <div className="text-6xl animate-bounce">⚠️</div>
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {t('dashboard.chartLoadError')}
            </h3>
            <p className="text-sm leading-relaxed max-w-sm">
              {t('dashboard.monthlyTrendLoadError')}<br />
              {t('dashboard.pleaseTryRefresh')}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              🔄 {t('dashboard.refreshPage')}
            </button>
          </div>
        </div>
      </Card>
    )
  }

  const hasData = data && data.length > 0

  return (
    <Card 
      title={t('dashboard.monthlyIncomeExpenseTrend')} 
      subtitle={t('dashboard.monthlyTrendSubtitle')}
      subtitleHelp="Yeşil alan gelirleri, kırmızı alan giderleri temsil eder. Değerler Türk Lirası cinsindedir. Grafik üzerinde gezinerek detaylı bilgi alabilirsiniz."
      className="hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700"
    >
      <div className="h-80 p-2">
        {hasData ? (
          <Line data={chartData} options={chartConfig} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-center text-sm">
              İlk işlemlerinizi ekledikten sonra<br />
              aylık trend grafiğiniz burada görünecek.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}