import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Line, Doughnut } from 'react-chartjs-2'
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

interface MonthlyData {
  income: number[]
  expense: number[]
  months: string[]
}

interface ExpenseCategory {
  name: string
  amount: number
  color: string
  percentage: number
}

interface DashboardChartsProps {
  monthlyData: MonthlyData
  expenseCategories: ExpenseCategory[]
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  monthlyData, 
  expenseCategories 
}) => {
  const { t } = useTranslation()

  // Tema kontrolü için yardımcı fonksiyon
  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark')
  }

  // Line chart seçenekleri
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode() ? '#E2E8F0' : '#1E293B',
          font: {
            size: 12,
            weight: '500' as const
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode() ? '#334155' : '#FFFFFF',
        titleColor: isDarkMode() ? '#E2E8F0' : '#1E293B',
        bodyColor: isDarkMode() ? '#E2E8F0' : '#1E293B',
        borderColor: isDarkMode() ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₺${context.parsed.y.toLocaleString('tr-TR')}`
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { 
          color: isDarkMode() ? '#CBD5E1' : '#475569',
          font: { size: 11 }
        },
        grid: { 
          color: isDarkMode() ? '#334155' : '#F1F5F9',
          drawBorder: false
        },
      },
      y: {
        ticks: { 
          color: isDarkMode() ? '#CBD5E1' : '#475569',
          font: { size: 11 },
          callback: function(value: any) {
            return '₺' + value.toLocaleString('tr-TR')
          }
        },
        grid: { 
          color: isDarkMode() ? '#334155' : '#F1F5F9',
          drawBorder: false
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 2,
      }
    }
  }

  // Doughnut chart seçenekleri
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: isDarkMode() ? '#E2E8F0' : '#1E293B',
          font: {
            size: 12,
            weight: '500' as const
          },
          padding: 15,
          usePointStyle: true,
          generateLabels: function(chart: any) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i]
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        },
      },
      tooltip: {
        backgroundColor: isDarkMode() ? '#334155' : '#FFFFFF',
        titleColor: isDarkMode() ? '#E2E8F0' : '#1E293B',
        bodyColor: isDarkMode() ? '#E2E8F0' : '#1E293B',
        borderColor: isDarkMode() ? '#475569' : '#E2E8F0',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ₺${value.toLocaleString('tr-TR')} (${percentage}%)`
          }
        }
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: isDarkMode() ? '#1E293B' : '#FFFFFF',
      }
    }
  }

  // Line chart verisi
  const lineChartData = {
    labels: monthlyData.months,
    datasets: [
      {
        label: t('transaction.income'),
        data: monthlyData.income,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: t('transaction.expense'),
        data: monthlyData.expense,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
    ],
  }

  // Doughnut chart verisi
  const doughnutData = {
    labels: expenseCategories.map(cat => cat.name),
    datasets: [
      {
        data: expenseCategories.map(cat => cat.amount),
        backgroundColor: expenseCategories.map(cat => cat.color),
        borderColor: expenseCategories.map(cat => cat.color),
        borderWidth: 0,
        hoverBorderWidth: 3,
      },
    ],
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Aylık Gelir/Gider Grafiği */}
      <Card 
        title="Aylık Gelir/Gider Trendi" 
        className="hover:shadow-md transition-all duration-200"
      >
        <div className="h-80">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </Card>

      {/* Harcama Kategorileri Dağılımı */}
      <Card 
        title="Harcama Kategorileri Dağılımı" 
        className="hover:shadow-md transition-all duration-200"
      >
        <div className="h-80">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </Card>
    </div>
  )
}

export default DashboardCharts
