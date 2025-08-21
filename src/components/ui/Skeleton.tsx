import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md' 
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`
        animate-pulse bg-slate-200 dark:bg-slate-700
        ${roundedClasses[rounded]}
        ${className}
      `}
      style={style}
    />
  )
}

// Table row skeleton
export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
)

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns: number }> = ({ 
  rows = 5, 
  columns 
}) => (
  <div className="animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Table skeleton */}
    <div className="bg-white dark:bg-mm-card rounded-xl border border-slate-200 dark:border-mm-border overflow-hidden">
      {/* Table header */}
      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-mm-border">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3 border-b border-slate-100 dark:border-mm-border last:border-b-0">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-mm-card rounded-xl border border-slate-200 dark:border-mm-border p-6 ${className}`}>
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
)

// Form field skeleton
export const FormFieldSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
)

// Modal skeleton
export const ModalSkeleton: React.FC = () => (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
    <div className="relative w-full max-w-lg bg-white dark:bg-mm-card shadow-2xl rounded-xl border border-slate-200 dark:border-mm-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-mm-border">
        <Skeleton className="h-6 w-32" />
      </div>
      
      {/* Body */}
      <div className="p-6 space-y-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-mm-border bg-slate-50 dark:bg-mm-bg">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  </div>
)

export default Skeleton
