import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

interface QuickAction {
  title: string
  description: string
  icon: string
  color: 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'indigo'
  path: string
  isExternal?: boolean
}

interface QuickActionsProps {
  className?: string
}

export const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  const { t } = useTranslation()

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'bg-emerald-500 hover:bg-emerald-600',
        text: 'text-white',
        icon: 'bg-emerald-400',
      },
      red: {
        bg: 'bg-rose-500 hover:bg-rose-600',
        text: 'text-white',
        icon: 'bg-rose-400',
      },
      blue: {
        bg: 'bg-blue-500 hover:bg-blue-600',
        text: 'text-white',
        icon: 'bg-blue-400',
      },
      purple: {
        bg: 'bg-purple-500 hover:bg-purple-600',
        text: 'text-white',
        icon: 'bg-purple-400',
      },
      amber: {
        bg: 'bg-amber-500 hover:bg-amber-600',
        text: 'text-white',
        icon: 'bg-amber-400',
      },
      indigo: {
        bg: 'bg-indigo-500 hover:bg-indigo-600',
        text: 'text-white',
        icon: 'bg-indigo-400',
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Gelir Ekle',
      description: 'Yeni gelir kaydı oluştur',
      icon: '💰',
      color: 'green',
      path: '/debts/overview?type=credit'
    },
    {
      title: 'Gider Ekle',
      description: 'Yeni gider kaydı oluştur',
      icon: '💸',
      color: 'red',
      path: '/debts/overview?type=debt'
    },
    {
      title: 'Taksit Ekle',
      description: 'Taksitli ödeme planı oluştur',
      icon: '📅',
      color: 'blue',
      path: '/installments'
    },
    {
      title: 'Raporlar',
      description: 'Detaylı mali raporları görüntüle',
      icon: '📊',
      color: 'purple',
      path: '/reports'
    },
    {
      title: 'Hesap Ekle',
      description: 'Yeni banka/nakit hesabı ekle',
      icon: '🏦',
      color: 'indigo',
      path: '/accounts'
    },
    {
      title: 'Kişi Ekle',
      description: 'Yeni kişi/müşteri ekle',
      icon: '👤',
      color: 'amber',
      path: '/contacts'
    }
  ]

  const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => {
    const colors = getColorClasses(action.color)
    
    const buttonContent = (
      <div className={`
        relative overflow-hidden rounded-xl p-4 transition-all duration-200 
        transform hover:scale-105 hover:shadow-lg cursor-pointer
        ${colors.bg} ${colors.text}
      `}>
        <div className="flex items-start gap-3">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${colors.icon}
          `}>
            <span className="text-xl">{action.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">
              {action.title}
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10"></div>
        <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-white/5"></div>
      </div>
    )

    if (action.isExternal) {
      return (
        <a href={action.path} target="_blank" rel="noopener noreferrer">
          {buttonContent}
        </a>
      )
    }

    return (
      <Link to={action.path}>
        {buttonContent}
      </Link>
    )
  }

  return (
    <Card 
      title="Hızlı İşlemler" 
      subtitle="Sık kullanılan kayıt işlemlerine tek tıkla erişin."
      subtitleHelp="Gelir/Gider ekleme ve raporlar gibi en sık yapılan aksiyonlar burada yer alır."
      className={`hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <ActionButton key={index} action={action} />
        ))}
      </div>
      
      {/* Alt bilgi */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Sık kullanılan işlemler</span>
          <Link 
            to="/settings" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Özelleştir
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default QuickActions
