'use client'

import {
  ClipboardList,
  TrendingUp,
  CalendarDays,
  BarChart3,
  MapPin,
  Cpu,
  Signal,
  Wifi,
} from 'lucide-react'
import { Badge } from './Badge'
import { StatCard } from './StatCard'
import type { DeviceDetail, DeviceStats, ShadowReported, VehicleType } from '@/lib/iot-api'

const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  motorcycle: 'Motocicleta',
  car: 'Automóvil',
  passenger_bus: 'Transporte Público',
  cargo_truck: 'Carga Pesada',
}

interface DeviceHeaderProps {
  device: DeviceDetail
  shadow: ShadowReported
  stats: DeviceStats
}

export function DeviceHeader({ device, shadow, stats }: DeviceHeaderProps) {
  const vehicleLabel = device.vehicleType
    ? VEHICLE_TYPE_LABEL[device.vehicleType] || device.vehicleType
    : 'Sin asignar'

  const infoItems: string[] = []
  if (device.location) infoItems.push(device.location)
  infoItems.push(vehicleLabel)
  if (device.firmwareVersion) infoItems.push(`v${device.firmwareVersion}`)
  if (shadow.rssi != null) infoItems.push(`${shadow.rssi} dBm`)
  if (shadow.ip) infoItems.push(shadow.ip)

  return (
    <div className="mb-6">
      {/* Línea 1: Nombre + badge */}
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-gray-900">
          {device.nickname || device.thingName}
        </h1>
        <Badge variant={device.online ? 'success' : 'destructive'} className="text-sm px-3 py-1">
          {device.online ? 'En línea' : 'Fuera de línea'}
        </Badge>
      </div>

      {/* Línea 2: Info compacta */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-5 flex-wrap">
        {device.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {device.location}
          </span>
        )}
        {device.location && <span className="text-gray-300">·</span>}
        <span className="inline-flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5" />
          {vehicleLabel}
        </span>
        {device.firmwareVersion && (
          <>
            <span className="text-gray-300">·</span>
            <span className="font-mono">v{device.firmwareVersion}</span>
          </>
        )}
        {shadow.rssi != null && (
          <>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Signal className="h-3.5 w-3.5" />
              {shadow.rssi} dBm
            </span>
          </>
        )}
        {shadow.ip && (
          <>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Wifi className="h-3.5 w-3.5" />
              {shadow.ip}
            </span>
          </>
        )}
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pruebas totales"
          value={stats.totalSessions}
          icon={ClipboardList}
          variant="primary"
        />
        <StatCard
          label="Tasa de aprobación"
          value={`${stats.passRate}%`}
          icon={TrendingUp}
          variant={stats.passRate >= 70 ? 'success' : 'error'}
        />
        <StatCard
          label="Citas hoy"
          value={stats.todayAppointments}
          icon={CalendarDays}
          variant="info"
        />
        <StatCard
          label="Promedio calificación"
          value={stats.avgScore}
          icon={BarChart3}
          variant="warning"
        />
      </div>
    </div>
  )
}
