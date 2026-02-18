'use client'

import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const DEFAULT_STEPS = [
  'Tipo de Licencia',
  'Solicitud',
  'Examen Teórico',
  'Agendar Cita',
  'Simulador',
  'Resultados',
]

interface ProgressStepperProps {
  currentStep: number
  steps?: string[]
  className?: string
}

export function ProgressStepper({
  currentStep,
  steps = DEFAULT_STEPS,
  className,
}: ProgressStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((label, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isCompleted &&
                      'bg-primary text-white',
                    isCurrent &&
                      'bg-primary ring-4 ring-primary/20 text-white',
                    !isCompleted &&
                      !isCurrent &&
                      'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={cn(
                    'text-[11px] leading-tight text-center max-w-[80px]',
                    isCurrent
                      ? 'font-semibold text-primary'
                      : isCompleted
                        ? 'text-primary/70'
                        : 'text-gray-400'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 flex-1 transition-colors',
                    stepNum < currentStep ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
