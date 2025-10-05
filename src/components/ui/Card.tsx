import React from 'react'

type CardProps = React.PropsWithChildren<{ 
  className?: string; 
  title?: string;
  subtitle?: string;
  subtitleHelp?: string;
}>

export const Card: React.FC<CardProps> = ({ className = '', title, subtitle, subtitleHelp, children }) => {
  const [showHelp, setShowHelp] = React.useState(false)

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-mm-border bg-white dark:bg-mm-card ${className}`}>
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-mm-border">
          <div className="flex items-start justify-between gap-3">
            {title && (
              <div className="font-semibold text-slate-900 dark:text-mm-text">{title}</div>
            )}
          </div>
          {subtitle && (
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span>{subtitle}</span>
              {subtitleHelp && (
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowHelp(true)}
                  onMouseLeave={() => setShowHelp(false)}
                >
                  <button 
                    type="button" 
                    aria-label="Bilgi"
                    onClick={() => setShowHelp(v => !v)}
                    className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[10px] hover:bg-slate-100 dark:hover:bg-slate-700"
                    title={subtitleHelp}
                  >
                    ?
                  </button>
                  {showHelp && (
                    <div className="absolute z-20 top-6 left-0 min-w-[200px] max-w-xs p-2 rounded-md text-xs bg-slate-900 text-white dark:bg-slate-800 shadow-lg">
                      {subtitleHelp}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export default Card
