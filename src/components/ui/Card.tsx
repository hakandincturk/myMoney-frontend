import React from 'react'

type CardProps = React.PropsWithChildren<{ className?: string; title?: string }>

export const Card: React.FC<CardProps> = ({ className = '', title, children }) => {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-mm-border bg-white dark:bg-mm-card ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-mm-border font-semibold text-slate-900 dark:text-mm-text">{title}</div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export default Card
