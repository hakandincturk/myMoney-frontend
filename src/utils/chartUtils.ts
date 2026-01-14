import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { CHART_COLORS, THEME_COLORS, CHART_STYLES, CHART_ANIMATIONS } from '../constants/charts'
import type { ChartConfig, ChartTheme, CategoryData, ChartDataPoint, DateRange, PeriodType } from '../types/charts'

export class ChartConfigFactory {
  private theme: ChartTheme
  private t: (key: string, options?: any) => string

  constructor(theme: ChartTheme, translateFn: (key: string, options?: any) => string) {
    this.theme = theme
    this.t = translateFn
  }

  createLineChartConfig(): ChartConfig {
    const colors = this.theme.isDark ? THEME_COLORS.DARK : THEME_COLORS.LIGHT

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: colors.TEXT,
            font: { size: 12, weight: 500 },
            padding: 20,
            usePointStyle: true,
            generateLabels: this.createLegendLabels.bind(this),
          },
        },
        tooltip: this.createLineTooltipConfig(),
      },
      scales: {
        x: {
          ticks: { 
            color: colors.SECONDARY_TEXT,
            font: { size: 11 }
          },
          grid: { 
            color: colors.GRID,
            drawBorder: false
          },
        },
        y: {
          ticks: { 
            color: colors.SECONDARY_TEXT,
            font: { size: 11 },
            callback: (value: any) => '₺' + value.toLocaleString('tr-TR')
          },
          grid: { 
            color: colors.GRID,
            drawBorder: false
          },
        },
      },
      elements: {
        line: {
          tension: CHART_STYLES.LINE_TENSION,
          borderWidth: CHART_STYLES.LINE_WIDTH,
        },
        point: {
          radius: CHART_STYLES.POINT_RADIUS,
          hoverRadius: CHART_STYLES.POINT_HOVER_RADIUS,
          borderWidth: CHART_STYLES.POINT_BORDER_WIDTH,
          hoverBorderWidth: CHART_STYLES.POINT_HOVER_BORDER_WIDTH,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      animation: {
        duration: CHART_ANIMATIONS.DURATION,
        easing: CHART_ANIMATIONS.EASING,
      }
    }
  }

  createDoughnutChartConfig(): ChartConfig {
    const colors = this.theme.isDark ? THEME_COLORS.DARK : THEME_COLORS.LIGHT

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          align: 'center' as const,
          maxHeight: 120,
          onClick: this.handleDoughnutLegendClick,
          onHover: this.handleDoughnutLegendHover,
          onLeave: this.handleDoughnutLegendLeave,
          labels: {
            color: colors.TEXT,
            font: {
              size: 12,
              weight: 600,
              family: 'Inter, system-ui, -apple-system, sans-serif'
            },
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 14,
            boxHeight: 14,
            generateLabels: this.createDoughnutLegendLabels.bind(this),
          },
        },
        tooltip: this.createDoughnutTooltipConfig(),
      },
      cutout: CHART_STYLES.DOUGHNUT_CUTOUT,
      elements: {
        arc: {
          borderWidth: CHART_STYLES.ARC_BORDER_WIDTH,
          borderColor: this.theme.isDark ? '#1E293B' : '#FFFFFF',
          hoverBorderWidth: CHART_STYLES.ARC_HOVER_BORDER_WIDTH,
          hoverBorderColor: this.theme.isDark ? '#3B82F6' : '#2563EB',
          hoverOffset: CHART_STYLES.ARC_HOVER_OFFSET,
          borderSkipped: false,
          borderRadius: CHART_STYLES.ARC_BORDER_RADIUS,
          hoverBorderRadius: CHART_STYLES.ARC_HOVER_BORDER_RADIUS,
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: CHART_ANIMATIONS.DOUGHNUT_DURATION,
        easing: CHART_ANIMATIONS.DOUGHNUT_EASING,
      },
      transitions: {
        active: {
          animation: {
            duration: CHART_ANIMATIONS.ACTIVE_DURATION
          }
        }
      },
      interaction: {
        intersect: true,
        mode: 'point' as const,
      },
      onHover: (event: any, elements: any) => {
        event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default'
      }
    }
  }

  private createLegendLabels(chart: any) {
    return chart.data.datasets.map((dataset: any, index: number) => ({
      text: dataset.label === 'income' ? this.t('transaction.income') : this.t('transaction.expense'),
      fillStyle: dataset.borderColor,
      strokeStyle: dataset.borderColor,
      lineWidth: 2,
      hidden: !chart.isDatasetVisible(index),
      index: index,
      fontColor: this.theme.isDark ? THEME_COLORS.DARK.TEXT : THEME_COLORS.LIGHT.TEXT
    }))
  }

  private createLineTooltipConfig() {
    const colors = this.theme.isDark ? THEME_COLORS.DARK : THEME_COLORS.LIGHT

    return {
      backgroundColor: colors.TOOLTIP_BACKGROUND,
      titleColor: colors.TOOLTIP_TITLE,
      bodyColor: colors.TOOLTIP_BODY,
      borderColor: colors.TOOLTIP_BORDER,
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        size: 13,
        weight: 600,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      },
      bodyFont: {
        size: 12,
        weight: 500,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      },
      displayColors: false,
      boxPadding: 4,
      usePointStyle: true,
      maxWidth: 280,
      maxHeight: 120,
      position: 'nearest' as const,
      xAlign: 'center' as const,
      yAlign: 'bottom' as const,
      callbacks: {
        title: (context: any) => context[0].label,
        label: (context: any) => {
          const value = context.parsed.y
          const type = context.dataset.label === 'income' ? this.t('transaction.income') : this.t('transaction.expense')
          const emoji = context.dataset.label === 'income' ? '📈' : '📉'
          const prefix = context.dataset.label === 'income' ? '+' : '-'
          return `${emoji} ${type}: ${prefix}₺${value.toLocaleString('tr-TR')}`
        },
        afterBody: (context: any) => {
          if (context.length === 2) {
            const income = context.find((c: any) => c.dataset.label === 'income')?.parsed.y || 0
            const expense = context.find((c: any) => c.dataset.label === 'expense')?.parsed.y || 0
            const net = income - expense
            const netEmoji = net >= 0 ? '💚' : '❤️'
            const netText = net >= 0 ? 
              `${netEmoji} Net: +₺${net.toLocaleString('tr-TR')}` : 
              `${netEmoji} Net: -₺${Math.abs(net).toLocaleString('tr-TR')}`
            
            return [netText]
          }
          return []
        },
      }
    }
  }

  private createDoughnutTooltipConfig() {
    const colors = this.theme.isDark ? THEME_COLORS.DARK : THEME_COLORS.LIGHT

    return {
      backgroundColor: colors.TOOLTIP_BACKGROUND,
      titleColor: colors.TOOLTIP_TITLE,
      bodyColor: colors.TOOLTIP_BODY,
      borderColor: colors.TOOLTIP_BORDER,
      borderWidth: 2,
      cornerRadius: 8,
      padding: 16,
      titleFont: {
        size: 14,
        weight: 700,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      },
      bodyFont: {
        size: 13,
        weight: 600,
        family: 'Inter, system-ui, -apple-system, sans-serif'
      },
      displayColors: false,
      boxPadding: 4,
      callbacks: {
        title: (context: any) => `📊 ${context[0].label}`,
        label: (context: any) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return [
            `💰 ${this.t('dashboard.amount')}: ₺${value.toLocaleString('tr-TR')}`,
            `📈 ${this.t('dashboard.percentage')}: %${percentage}`,
            `📦 ${this.t('dashboard.total')}: ₺${total.toLocaleString('tr-TR')}`
          ]
        },
        afterLabel: (context: any) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const avgPercentage = (100 / context.dataset.data.length).toFixed(1)
          const currentPercentage = ((value / total) * 100).toFixed(1)
          
          if (parseFloat(currentPercentage) > parseFloat(avgPercentage)) {
            return `🔥 ${this.t('dashboard.aboveAverage')}`
          } else if (parseFloat(currentPercentage) < parseFloat(avgPercentage)) {
            return `📉 ${this.t('dashboard.belowAverage')}`
          }
          return `⚖️ ${this.t('dashboard.averageLevel')}`
        }
      }
    }
  }

  private createDoughnutLegendLabels(chart: any) {
    const data = chart.data
    if (data.labels.length && data.datasets.length) {
      const dataset = data.datasets[0]
      const total = dataset.data.reduce((a: number, b: number) => a + b, 0)
      
      return data.labels.map((label: string, index: number) => {
        const value = dataset.data[index]
        const percentage = ((value / total) * 100).toFixed(1)
        const meta = chart.getDatasetMeta(0)
        const isHidden = meta.data[index] && meta.data[index].hidden
        
        return {
          text: `${label} (${percentage}%)`,
          fillStyle: isHidden ? 
            (this.theme.isDark ? '#64748B' : '#94A3B8') : 
            dataset.backgroundColor[index],
          strokeStyle: isHidden ? 
            (this.theme.isDark ? '#475569' : '#CBD5E1') : 
            (this.theme.isDark ? '#1E293B' : '#FFFFFF'),
          lineWidth: 2,
          hidden: isHidden,
          index: index,
          fontColor: isHidden ? 
            (this.theme.isDark ? '#64748B' : '#94A3B8') : 
            (this.theme.isDark ? '#E2E8F0' : '#1E293B')
        }
      })
    }
    return []
  }

  private handleDoughnutLegendClick(e: any, legendItem: any, legend: any) {
    const chart = legend.chart
    const index = legendItem.index
    const meta = chart.getDatasetMeta(0)
    
    meta.data[index].hidden = !meta.data[index].hidden
    chart.update('active')
  }

  private handleDoughnutLegendHover(e: any, legendItem: any, legend: any) {
    e.native.target.style.cursor = 'pointer'
  }

  private handleDoughnutLegendLeave(e: any, legendItem: any, legend: any) {
    e.native.target.style.cursor = 'default'
  }
}

export class ChartDataProcessor {
  static createLineChartData(monthlyData: ChartDataPoint[]) {
    return {
      labels: monthlyData.map(item => item.title),
      datasets: [
        {
          label: 'income',
          data: monthlyData.map(item => item.income),
          borderColor: '#10B981',
          backgroundColor: (context: any) => {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return 'rgba(16, 185, 129, 0.1)'
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)')
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)')
            return gradient
          },
          fill: true,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#10B981',
        },
        {
          label: 'expense',
          data: monthlyData.map(item => item.expense),
          borderColor: '#EF4444',
          backgroundColor: (context: any) => {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return 'rgba(239, 68, 68, 0.1)'
            
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)')
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)')
            return gradient
          },
          fill: true,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#EF4444',
        },
      ],
    }
  }

  static createDoughnutChartData(categories: CategoryData[], isDark: boolean) {
    return {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          data: categories.map(cat => cat.amount),
          backgroundColor: categories.map(cat => cat.color),
          borderColor: categories.map(() => isDark ? '#1E293B' : '#FFFFFF'),
          borderWidth: CHART_STYLES.ARC_BORDER_WIDTH,
          hoverBackgroundColor: categories.map(cat => {
            const color = cat.color
            if (color.startsWith('#')) {
              const r = parseInt(color.substr(1, 2), 16)
              const g = parseInt(color.substr(3, 2), 16)
              const b = parseInt(color.substr(5, 2), 16)
              return `rgba(${Math.min(255, r + 20)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)}, 0.9)`
            }
            return color
          }),
          hoverBorderWidth: CHART_STYLES.ARC_HOVER_BORDER_WIDTH,
          hoverBorderColor: isDark ? '#3B82F6' : '#2563EB',
          hoverOffset: CHART_STYLES.ARC_HOVER_OFFSET,
          borderRadius: CHART_STYLES.ARC_BORDER_RADIUS,
          borderSkipped: false,
        },
      ],
    }
  }

  static processCategories(categorySummaryData: any): CategoryData[] {
    if (!categorySummaryData?.data?.categorySummaryDatas) return []
    
    return categorySummaryData.data.categorySummaryDatas.map((category: any, index: number) => ({
      name: category.name,
      amount: category.amount,
      percentage: category.percentage,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
  }
}

export class DateUtils {
  static getDateRange(period: PeriodType): DateRange {
    if (period === 'MONTHLY') {
      return {
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD')
      }
    } else {
      return {
        startDate: moment().startOf('year').format('YYYY-MM-DD'),
        endDate: moment().endOf('year').format('YYYY-MM-DD')
      }
    }
  }

  static getDateRangeDisplay(period: PeriodType, t: (key: string, options?: any) => string): string {
    if (period === 'MONTHLY') {
      const monthIndex = moment().month()
      const monthKey = `date.months.${monthIndex}`
      const monthName = t(monthKey, { fallback: 'Month' })
      return `${monthName} ${moment().year()}`
    } else {
      return `${moment().year()}`
    }
  }

  /**
   * Backend'den gelen İngilizce ay isimlerini mevcut dile çevirir
   * @param monthName Backend'den gelen ay ismi (örn: "JANUARY", "FEBRUARY")
   * @param t i18n translate fonksiyonu
   * @returns Çevrilmiş ay ismi
   */
  static translateMonthName(monthName: string, t: (key: string) => string): string {
    const monthKey = `months.${monthName}`
    return t(monthKey)
  }
}