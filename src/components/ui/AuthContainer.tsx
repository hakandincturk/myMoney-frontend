import React from 'react'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'

type AuthContainerProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ title, subtitle, children }) => {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <Logo size={64} />
        <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-mm-text">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-slate-500 dark:text-mm-subtleText">{subtitle}</p>
        )}
      </div>
      <Card className="shadow-2xl shadow-black/30">
        {children}
      </Card>
    </div>
  )
}

export default AuthContainer


