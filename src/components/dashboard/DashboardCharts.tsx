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
import { useGetCategorySummaryQuery } from '@/services/dashboardApi'
import { MonthlyTrendChart } from './MonthlyTrendChart'
import { CategoryDistributionChart } from './CategoryDistributionChart'
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

/**
 * Ana dashboard charts komponenti - SOLID prensipleri uygulanarak refactor edildi
 * 
 * SRP: Her chart tipi için ayrı komponent oluşturuldu
 * OCP: Yeni chart tipleri eklemek için sadece yeni komponent eklenmesi yeterli
 * LSP: Tüm chart komponentleri aynı interface'i kullanıyor
 * ISP: Her chart sadece ihtiyacı olan props'ları alıyor
 * DIP: Konkret sınıflar yerine abstraction'lar kullanıyor
 */
export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  monthlyData, 
  isMonthlyLoading = false,
  hasMonthlyError = false 
}) => {
  const {
    categoryPeriod,
    categorySumMode,
    setCategoryPeriod,
    setCategorySumMode,
  } = useChartControls()

  // Seçili periode göre tarih aralığını al
  const { startDate, endDate } = DateUtils.getDateRange(categoryPeriod)

  // Kategori verisi için API çağrısı
  const {
    data: categorySummaryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useGetCategorySummaryQuery({
    startDate,
    endDate,
    type: categoryPeriod,
    sumMode: categorySumMode,
  }, {
    refetchOnMountOrArgChange: true
  })

  // Kategori verilerini işle - Utility sınıfını kullanarak
  const expenseCategories = useMemo(() => 
    ChartDataProcessor.processCategories(categorySummaryData), 
    [categorySummaryData]
  )

  const isCategoryError = !!categoryError

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <MonthlyTrendChart 
        data={monthlyData}
        isLoading={isMonthlyLoading}
        hasError={hasMonthlyError}
      />
      
      <CategoryDistributionChart 
        categories={expenseCategories}
        isLoading={isCategoryLoading}
        hasError={isCategoryError}
        categoryPeriod={categoryPeriod}
        categorySumMode={categorySumMode}
        onPeriodChange={setCategoryPeriod}
        onSumModeChange={setCategorySumMode}
      />
    </div>
  )
}

export default DashboardCharts