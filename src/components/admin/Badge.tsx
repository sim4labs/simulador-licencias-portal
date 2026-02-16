'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-50 text-primary-700',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        destructive: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        secondary: 'bg-purple-100 text-purple-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export const statusVariant: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  'iniciado': 'default',
  'tipo-seleccionado': 'info',
  'examen-aprobado': 'primary',
  'cita-agendada': 'warning',
  'simulador-completado': 'success',
  'finalizado': 'success',
}

export const statusLabel: Record<string, string> = {
  'iniciado': 'Iniciado',
  'tipo-seleccionado': 'Tipo Seleccionado',
  'examen-aprobado': 'Examen Aprobado',
  'cita-agendada': 'Cita Agendada',
  'simulador-completado': 'Simulador Completado',
  'finalizado': 'Finalizado',
}

export const difficultyVariant: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  'medio': 'warning',
  'avanzado': 'destructive',
}

export const categoryVariant: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
  'general': 'default',
  'motocicleta': 'info',
  'particular': 'primary',
  'publico': 'warning',
  'carga': 'destructive',
}
