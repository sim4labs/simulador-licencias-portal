'use client'

import { useInView } from '@/hooks/useInView'

interface ScrollRevealProps {
  children: React.ReactNode
  threshold?: number
  className?: string
}

export function ScrollReveal({ children, threshold = 0.15, className }: ScrollRevealProps) {
  const { ref, isVisible } = useInView(threshold)

  return (
    <section ref={ref} className={className} data-revealed={isVisible ? 'true' : 'false'}>
      {children}
    </section>
  )
}
