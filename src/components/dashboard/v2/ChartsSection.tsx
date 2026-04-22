import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import TrendsPanel from './TrendsPanel'
import TagPanel from './TagPanel'
import type { ChartDataPoint } from '../../../types/charts'

// Register chart.js building blocks once for the v2 dashboard. Idempotent — safe if
// another section registers the same modules.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
)

type ChartsSectionProps = {
  monthlyData: ChartDataPoint[]
  isMonthlyLoading: boolean
  hasMonthlyError: boolean
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  monthlyData,
  isMonthlyLoading,
  hasMonthlyError,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <TrendsPanel
        data={monthlyData}
        isLoading={isMonthlyLoading}
        hasError={hasMonthlyError}
      />
      <TagPanel />
    </div>
  )
}

export default ChartsSection
