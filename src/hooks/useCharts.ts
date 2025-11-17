import { useState, useEffect } from 'react'
import type { ChartTheme, ChartControlsState, PeriodType, SumModeType } from '../types/charts'

export const useChartTheme = (): ChartTheme => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  return {
    isDark,
    colors: {
      text: isDark ? '#E2E8F0' : '#1E293B',
      grid: isDark ? '#334155' : '#F1F5F9',
      background: isDark ? '#0F172A' : '#FFFFFF',
      border: isDark ? '#475569' : '#E2E8F0',
    }
  }
}

export const useChartControls = () => {
  const [controls, setControls] = useState<ChartControlsState>({
    categoryPeriod: 'MONTHLY',
    categorySumMode: 'DISTRIBUTED',
  })

  const setCategoryPeriod = (period: PeriodType) => {
    setControls(prev => ({ ...prev, categoryPeriod: period }))
  }

  const setCategorySumMode = (mode: SumModeType) => {
    setControls(prev => ({ ...prev, categorySumMode: mode }))
  }

  return {
    ...controls,
    setCategoryPeriod,
    setCategorySumMode,
  }
}

export const useChartRef = () => {
  const [chartRef, setChartRef] = useState<any>(null)

  const updateChart = () => {
    if (chartRef?.current) {
      chartRef.current.update('none')
    }
  }

  return {
    chartRef: setChartRef,
    updateChart,
  }
}