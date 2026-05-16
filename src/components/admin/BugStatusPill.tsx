'use client'

import { Badge } from './Badge'
import type { BugStatus, BugOrigin } from '@/lib/bugs-api'

const STATUS_LABEL: Record<BugStatus, string> = {
  'open': 'Abierto',
  'awaiting-verification': 'Esperando verificación',
  'verified': 'Verificado',
}

export function BugStatusPill({ status }: { status: BugStatus }) {
  if (status === 'verified') return <Badge variant="success">{STATUS_LABEL[status]}</Badge>
  if (status === 'awaiting-verification') return <Badge variant="warning">{STATUS_LABEL[status]}</Badge>
  return <Badge variant="destructive">{STATUS_LABEL[status]}</Badge>
}

const ORIGIN_LABEL: Record<BugOrigin, string> = {
  'portal-admin': 'Portal admin',
  'portal-ciudadano': 'Portal ciudadano',
  'simulador-manejo': 'Simulador Manejo',
}

export function BugOriginPill({ origin }: { origin: BugOrigin | null }) {
  if (!origin) return <Badge variant="default">Sin origen</Badge>
  if (origin === 'portal-admin') return <Badge variant="info">{ORIGIN_LABEL[origin]}</Badge>
  if (origin === 'portal-ciudadano') return <Badge variant="primary">{ORIGIN_LABEL[origin]}</Badge>
  return <Badge variant="secondary">{ORIGIN_LABEL[origin]}</Badge>
}
