import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { useGetTagSummaryQuery } from '@/services/dashboardApi'
import { MonthlyTrendChart } from './MonthlyTrendChart'
import { TagDistributionChart } from './TagDistributionChart'
import { useChartControls } from '../../hooks/useCharts'
import { ChartDataProcessor, DateUtils } from '../../utils/chartUtils'
import type { ChartDataPoint } from '../../types/charts'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
)

interface DashboardChartsProps {
  monthlyData: ChartDataPoint[]
  isMonthlyLoading?: boolean
  hasMonthlyError?: boolean
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyData,
  isMonthlyLoading = false,
  hasMonthlyError = false
}) => {
  const {
    tagPeriod,
    tagSumMode,
    setTagPeriod,
    setTagSumMode,
  } = useChartControls()

  const { startDate, endDate } = DateUtils.getDateRange(tagPeriod)

  const {
    data: tagSummaryData,
    isLoading: isTagLoading,
    error: tagError,
  } = useGetTagSummaryQuery({
    startDate,
    endDate,
    type: tagPeriod,
    sumMode: tagSumMode,
  }, {
    refetchOnMountOrArgChange: true
  })

  const expenseTags = useMemo(() =>
    ChartDataProcessor.processTags(tagSummaryData),
    [tagSummaryData]
  )

  const isTagError = !!tagError

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <MonthlyTrendChart
        data={monthlyData}
        isLoading={isMonthlyLoading}
        hasError={hasMonthlyError}
      />

      <TagDistributionChart
        tags={expenseTags}
        isLoading={isTagLoading}
        hasError={isTagError}
        tagPeriod={tagPeriod}
        tagSumMode={tagSumMode}
        onPeriodChange={setTagPeriod}
        onSumModeChange={setTagSumMode}
      />
    </div>
  )
}

export default DashboardCharts
