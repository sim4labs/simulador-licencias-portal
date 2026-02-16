'use client'

import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

type StatVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'

const variantStyles: Record<StatVariant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  secondary: { bg: 'bg-purple-100', text: 'text-purple-700' },
  success: { bg: 'bg-green-100', text: 'text-green-700' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700' },
  error: { bg: 'bg-red-100', text: 'text-red-700' },
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  variant?: StatVariant
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, variant = 'primary', className }: StatCardProps) {
  const styles = variantStyles[variant]
  return (
    <div className={cn('bg-white rounded-lg shadow p-5 flex items-start gap-4', className)}>
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', styles.bg)}>
        <Icon className={cn('h-6 w-6', styles.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
      </div>
    </div>
  )
}
