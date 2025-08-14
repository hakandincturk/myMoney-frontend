import React from 'react'

type AppLayoutProps = {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-full">
      <main>
        {children}
      </main>
    </div>
  )
}


