import React from 'react'

type LogoProps = {
  size?: number
  withText?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 32, withText = false, className = '' }) => {
  const box = `h-${Math.round(size/4)} w-${Math.round(size/4)}` // not used directly; inline style below
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className="rounded-lg bg-gradient-to-br from-mm-primary/30 via-mm-secondary/30 to-mm-accent/30 flex items-center justify-center border border-slate-200 dark:border-mm-border"
        style={{ height: size, width: size }}
      >
        <span className="text-mm-primary font-bold">₺</span>
      </div>
      {withText && (
        <span className="text-slate-900 dark:text-mm-text font-semibold">MyMoney</span>
      )}
    </div>
  )
}

export default Logo


