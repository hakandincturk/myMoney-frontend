import React, { useMemo } from 'react'

type SparklineProps = {
  values: number[]
  width?: number
  height?: number
  /** Tailwind stroke colour class, e.g. "stroke-blue-500 dark:stroke-blue-400". */
  className?: string
  ariaLabel?: string
}

const PADDING = 3

/**
 * Dependency-free trend line. The series is always gap-free (the API zero-fills empty
 * months), so a plain polyline is enough — no interpolation needed.
 */
export const Sparkline: React.FC<SparklineProps> = ({
  values,
  width = 92,
  height = 26,
  className = 'stroke-blue-500 dark:stroke-blue-400',
  ariaLabel,
}) => {
  const { points, lastPoint } = useMemo(() => {
    if (values.length === 0) return { points: '', lastPoint: null }

    const max = Math.max(...values)
    const min = Math.min(...values)
    const span = max - min

    const innerWidth = width - PADDING * 2
    const innerHeight = height - PADDING * 2
    const step = values.length > 1 ? innerWidth / (values.length - 1) : 0

    const coords = values.map((value, index) => {
      const x = PADDING + step * index
      // A flat series renders on the vertical middle instead of collapsing to an edge.
      const ratio = span === 0 ? 0.5 : (value - min) / span
      const y = PADDING + innerHeight - ratio * innerHeight
      return { x, y }
    })

    return {
      points: coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' '),
      lastPoint: coords[coords.length - 1],
    }
  }, [values, width, height])

  if (!points) return null

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
      {lastPoint && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2.8} className={`${className} fill-current`} />
      )}
    </svg>
  )
}

export default Sparkline
