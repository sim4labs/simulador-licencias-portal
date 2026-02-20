'use client'

import Link from 'next/link'
import { Bus, Truck, Car, Bike, CircleDashed, Settings, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Device } from '@/lib/iot-api'
import { Button } from '@/components/ui/Button'

interface VehicleConfig {
  icon: typeof Bus
  label: string
  borderColor: string
  iconBg: string
  iconColor: string
}

const vehicleConfig: Record<string, VehicleConfig> = {
  passenger_bus: {
    icon: Bus,
    label: 'Camion Pasajeros',
    borderColor: 'border-t-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  cargo_truck: {
    icon: Truck,
    label: 'Camion Carga',
    borderColor: 'border-t-amber-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  car: {
    icon: Car,
    label: 'Automovil',
    borderColor: 'border-t-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  motorcycle: {
    icon: Bike,
    label: 'Motocicleta',
    borderColor: 'border-t-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
}

const spareConfig: VehicleConfig = {
  icon: CircleDashed,
  label: 'Sin asignar',
  borderColor: '',
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-400',
}

function getRssiLabel(rssi: number): { text: string; color: string } {
  if (rssi >= -50) return { text: 'Excelente', color: 'text-emerald-600' }
  if (rssi >= -70) return { text: 'Buena', color: 'text-amber-600' }
  return { text: 'Debil', color: 'text-red-600' }
}

interface SimulatorCardProps {
  device: Device
  onEdit: (device: Device) => void
}

export function SimulatorCard({ device, onEdit }: SimulatorCardProps) {
  const isSpare = !device.vehicleType
  const config = device.vehicleType ? vehicleConfig[device.vehicleType] || spareConfig : spareConfig
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg flex flex-col',
        isSpare
          ? 'border-2 border-dashed border-gray-300 bg-gray-50/50'
          : `border border-gray-200 border-t-4 ${config.borderColor} bg-white shadow-sm`
      )}
    >
      {/* Encabezado */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className={cn('flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center', config.iconBg)}>
            <Icon className={cn('h-5 w-5', config.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 truncate">
                {device.nickname || device.thingName}
              </h3>
              <span className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    device.online ? 'bg-emerald-500' : 'bg-gray-300'
                  )}
                />
                <span className={cn('text-xs', device.online ? 'text-emerald-600' : 'text-gray-400')}>
                  {device.online ? 'En linea' : 'Fuera de linea'}
                </span>
              </span>
            </div>
            <p className="text-sm text-gray-500">{config.label}</p>
            {device.serialNumber && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">S/N: {device.serialNumber}</p>
            )}
          </div>
        </div>

        {isSpare && (
          <div className="mt-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-xs text-amber-700 font-medium">Respaldo — Sin asignar</p>
          </div>
        )}
      </div>

      {/* Datos tecnicos */}
      <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        <div>
          <span className="text-gray-400 text-xs">FW</span>
          <p className="font-mono text-gray-700 text-xs">{device.firmwareVersion || '—'}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">RSSI</span>
          {device.rssi != null ? (
            <p className="text-xs">
              <span className="font-mono text-gray-700">{device.rssi} dBm</span>
              {' '}
              <span className={cn('font-medium', getRssiLabel(device.rssi).color)}>
                [{getRssiLabel(device.rssi).text}]
              </span>
            </p>
          ) : (
            <p className="text-xs text-gray-400">—</p>
          )}
        </div>
        <div>
          <span className="text-gray-400 text-xs">IP</span>
          <p className="font-mono text-gray-700 text-xs">{device.ip || '—'}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">Ultima</span>
          <p className="text-gray-700 text-xs">
            {device.lastUpdate
              ? new Date(device.lastUpdate * 1000).toLocaleString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between mt-auto">
        <Button variant="outline" size="sm" onClick={() => onEdit(device)}>
          <Settings className="h-3.5 w-3.5 mr-1.5" />
          {isSpare ? 'Asignar simulador' : 'Configurar'}
        </Button>
        <Link href={`/admin/iot/${device.thingName}`}>
          <Button variant="ghost" size="sm">
            Ver detalle
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
