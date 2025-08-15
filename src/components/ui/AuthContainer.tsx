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
    <div className="min-h-screen flex">
      {/* Left Side - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-mm-bg dark:via-[#0a0a0a] dark:to-[#1a1a1a] relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-mm-primary/20 to-mm-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-br from-mm-accent/20 to-mm-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-10 w-32 h-32 bg-gradient-to-br from-mm-secondary/15 to-mm-accent/10 rounded-full blur-2xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <Logo size={72} withText={true} className="mb-8" />
          </div>
          
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
            Finansal Geleceğinizi Yönetin
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Gelir, gider ve tasarruflarınızı akıllıca takip edin. Finansal hedeflerinize ulaşın.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 bg-mm-primary rounded-full mr-4"></div>
              <span>Güvenli ve şifreli veri koruma</span>
            </div>
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 bg-mm-secondary rounded-full mr-4"></div>
              <span>Akıllı harcama analizi</span>
            </div>
            <div className="flex items-center text-slate-200">
              <div className="w-2 h-2 bg-mm-accent rounded-full mr-4"></div>
              <span>Otomatik kategorizasyon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f0f0f] dark:via-mm-bg dark:to-[#1a1a1a] p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6">
              <Logo size={64} />
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-mm-text dark:via-mm-primary dark:to-mm-text bg-clip-text text-transparent mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-600 dark:text-mm-subtleText">{subtitle}</p>
            )}
          </div>
          
          <Card className="backdrop-blur-sm shadow-2xl shadow-slate-900/10 dark:shadow-black/30 border-slate-200/50 dark:border-mm-border/50">
            {children}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AuthContainer


