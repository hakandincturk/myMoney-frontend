import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'

interface Transaction {
  id: number
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string
  category?: string
  contact?: string
}

interface PendingPayment {
  id: number
  title: string
  amount: number
  dueDate: string
  type: 'installment' | 'bill' | 'debt'
  contact?: string
  status: 'pending' | 'overdue' | 'upcoming'
}

interface DashboardTablesProps {
  recentTransactions: Transaction[]
  pendingPayments: PendingPayment[]
}

export const DashboardTables: React.FC<DashboardTablesProps> = ({
  recentTransactions,
  pendingPayments
}) => {
  const { t } = useTranslation()

  const formatCurrency = (amount: number) => {
    return `₺${Math.abs(amount).toLocaleString('tr-TR')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? '📈' : '📉'
  }

  const getTransactionColor = (type: string) => {
    return type === 'income' 
      ? 'text-emerald-600 dark:text-emerald-400' 
      : 'text-rose-600 dark:text-rose-400'
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
      case 'upcoming':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'Gecikmiş'
      case 'upcoming':
        return 'Yaklaşan'
      default:
        return 'Bekliyor'
    }
  }

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'installment':
        return '💳'
      case 'bill':
        return '🧾'
      case 'debt':
        return '💰'
      default:
        return '📋'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Son İşlemler */}
      <Card 
        title="Son İşlemler" 
        subtitle="En son kaydedilen gelir ve gider hareketleri."
        subtitleHelp="Tutarlar pozitifse gelir, negatifse giderdir. Tarihe göre geriden öne listelenir."
        className="hover:shadow-md transition-all duration-200"
      >
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            <>
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                        : 'bg-rose-100 dark:bg-rose-900/30'
                    }`}>
                      <span className="text-lg">
                        {getTransactionIcon(transaction.type)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <span>{transaction.category}</span>
                          </>
                        )}
                        {transaction.contact && (
                          <>
                            <span>•</span>
                            <span>{transaction.contact}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <Link 
                  to="/transactions" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Tüm işlemleri görüntüle →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <div className="text-4xl mb-2">📊</div>
              <p>Henüz işlem bulunmuyor</p>
            </div>
          )}
        </div>
      </Card>

      {/* Yaklaşan Ödemeler */}
      <Card 
        title="Yaklaşan Ödemeler" 
        subtitle="Kısa süre içinde ödenmesi gereken taksit ve faturalar."
        subtitleHelp="Durum: Gecikmiş, Yaklaşan veya Bekliyor olarak gösterilir. Tarihler yerel forma göre görüntülenir."
        className="hover:shadow-md transition-all duration-200"
      >
        <div className="space-y-3">
          {pendingPayments.length > 0 ? (
            <>
              {pendingPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-lg">
                        {getPaymentTypeIcon(payment.type)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {payment.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>{formatDate(payment.dueDate)}</span>
                        {payment.contact && (
                          <>
                            <span>•</span>
                            <span>{payment.contact}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusColor(payment.status)}`}>
                      {getPaymentStatusText(payment.status)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <Link 
                  to="/installments" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Tüm ödemeleri görüntüle →
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <div className="text-4xl mb-2">✅</div>
              <p>Yaklaşan ödeme bulunmuyor</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default DashboardTables
