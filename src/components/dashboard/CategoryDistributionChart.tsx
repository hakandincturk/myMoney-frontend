import React from 'react'
import { useTranslation } from 'react-i18next'
import { Doughnut } from 'react-chartjs-2'
import { Card } from '../ui/Card'
import { Select } from '../ui/Select'
import { Skeleton } from '../ui/Skeleton'
import { ChartConfigFactory, ChartDataProcessor, DateUtils } from '../../utils/chartUtils'
import { useChartTheme, useChartRef } from '../../hooks/useCharts'
import { CHART_DIMENSIONS } from '../../constants/charts'
import type { CategoryData, PeriodType, SumModeType } from '../../types/charts'

interface CategoryDistributionChartProps {
  categories: CategoryData[]
  isLoading?: boolean
  hasError?: boolean
  categoryPeriod: PeriodType
  categorySumMode: SumModeType
  onPeriodChange: (period: PeriodType) => void
  onSumModeChange: (mode: SumModeType) => void
}

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  categories,
  isLoading = false,
  hasError = false,
  categoryPeriod,
  categorySumMode,
  onPeriodChange,
  onSumModeChange,
}) => {
  const { t } = useTranslation()
  const theme = useChartTheme()
  const { chartRef, updateChart } = useChartRef()

  React.useEffect(() => {
    updateChart()
  }, [theme.isDark, updateChart])

  const configFactory = new ChartConfigFactory(theme, t)
  const chartConfig = configFactory.createDoughnutChartConfig()
  const chartData = ChartDataProcessor.createDoughnutChartData(categories, theme.isDark)

  const periodOptions = [
    { value: 'MONTHLY', label: t('dashboard.thisMonth') },
    { value: 'YEARLY', label: t('dashboard.thisYear') },
  ]

  const sumModeOptions = [
    { value: 'DISTRIBUTED', label: t('dashboard.distributed') },
    { value: 'DOUBLE_COUNT', label: t('dashboard.doubleCount') },
  ]

  const dateRangeDisplay = DateUtils.getDateRangeDisplay(categoryPeriod, t)

  if (isLoading) {
    return (
      <Card 
        title={t('dashboard.categoryDistribution')} 
        subtitle={t('dashboard.categoryDataLoading')}
        className="hover:shadow-md transition-all duration-200 relative [&>div:first-child]:pr-72"
      >
        <div className="absolute top-3 right-4 flex gap-2 z-10">
          <Skeleton className="h-8 w-24 animate-pulse" />
          <Skeleton className="h-8 w-32 animate-pulse" />
        </div>
        <div className="h-96 p-2">
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="relative flex-shrink-0">
              <div className="w-44 h-44 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800"></div>
              </div>
              <div className="absolute inset-0 w-44 h-44">
                <div className="w-full h-full rounded-full bg-gradient-conic from-blue-200 via-green-200 via-yellow-200 via-red-200 via-purple-200 to-blue-200 dark:from-blue-800/50 dark:via-green-800/50 dark:via-yellow-800/50 dark:via-red-800/50 dark:via-purple-800/50 dark:to-blue-800/50 animate-spin opacity-30" style={{animationDuration: '3s'}}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                  <span className="text-xl animate-pulse">📊</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-xs">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Skeleton className="w-3 h-3 rounded-full animate-pulse" />
                    <Skeleton className="h-3 flex-1 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="text-center space-y-3">
                <Skeleton className="h-4 w-32 mx-auto animate-pulse" />
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card 
        title={t('dashboard.categoryDistribution')} 
        subtitle={t('dashboard.categoryChartsLoadError')}
        className="hover:shadow-md transition-all duration-200 relative [&>div:first-child]:pr-72"
      >
        <div className="absolute top-3 right-4 flex gap-2 z-10">
          <Select
            id="category-period-select-error"
            value={categoryPeriod}
            onChange={(value) => onPeriodChange(value as PeriodType)}
            options={periodOptions}
            placeholder={t('dashboard.period')}
            disabled={false}
            searchable={false}
            className="text-xs w-24"
          />
          <Select
            id="category-summode-select-error"
            value={categorySumMode}
            onChange={(value) => onSumModeChange(value as SumModeType)}
            options={sumModeOptions}
            placeholder={t('dashboard.sumMode')}
            disabled={false}
            searchable={false}
            className="text-xs w-32"
          />
        </div>
        <div className="h-72 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-4">
          <div className="text-6xl animate-pulse">📊</div>
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              {t('dashboard.categoryLoadError')}
            </h3>
            <p className="text-sm leading-relaxed max-w-sm">
              {t('dashboard.categoryDataLoadError')}<br />
              {t('dashboard.pleaseTryAgain')}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              🔄 {t('dashboard.tryAgain')}
            </button>
          </div>
        </div>
      </Card>
    )
  }

  const hasData = categories && categories.length > 0

  return (
    <Card 
      title={t('dashboard.categoryDistribution')} 
      subtitle={`${dateRangeDisplay} ${t('dashboard.categoryDistributionPeriod')}`}
      subtitleHelp="Her dilimde kategoriye ait toplam gider ve yüzde oranı gösterilir. Dilimlere tıklayarak detay görüntüleyebilirsiniz."
      className="hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-700 relative [&>div:first-child]:pr-72"
    >
      <div className="absolute top-3 right-4 flex gap-2 z-10">
        <Select
          id="category-period-select"
          value={categoryPeriod}
          onChange={(value) => onPeriodChange(value as PeriodType)}
          options={periodOptions}
          placeholder={t('dashboard.period')}
          disabled={isLoading}
          searchable={false}
          className="text-xs w-24"
        />
        <Select
          id="category-summode-select"
          value={categorySumMode}
          onChange={(value) => onSumModeChange(value as SumModeType)}
          options={sumModeOptions}
          placeholder={t('dashboard.sumMode')}
          disabled={isLoading}
          searchable={false}
          className="text-xs w-32"
        />
      </div>

      <div className="h-96 p-2">
        {hasData ? (
          <Doughnut ref={chartRef} data={chartData} options={chartConfig} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-6">
            <div className="relative">
              <div className="text-8xl opacity-20 animate-pulse">🍩</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl animate-bounce">📊</div>
              </div>
            </div>
            <div className="text-center space-y-3 max-w-sm">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                {t('dashboard.noDataThisMonth', { 
                  period: categoryPeriod === 'MONTHLY' ? t('dashboard.thisMonth') : t('dashboard.thisYear')
                })}
              </h3>
              <p className="text-sm leading-relaxed">
                {t('dashboard.dataWillAppearAfterTransactions')}
              </p>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  <div className="w-3 h-3 bg-red-300 rounded-full animate-pulse [animation-delay:0.6s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}