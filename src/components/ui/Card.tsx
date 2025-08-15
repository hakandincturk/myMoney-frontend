import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-white/95 dark:bg-mm-surface/95 backdrop-blur-xl border border-white/20 dark:border-mm-border/20 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/20 dark:from-mm-surface/50 dark:to-transparent rounded-2xl pointer-events-none"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default Card
