import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200 dark:bg-mm-surface dark:border-mm-border rounded-2xl p-8 ${className}`}>
      {children}
    </div>
  )
}

export default Card
