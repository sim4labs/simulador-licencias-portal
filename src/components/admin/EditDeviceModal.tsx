'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/admin/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select'
import { iotApi, type Device, type VehicleType } from '@/lib/iot-api'

const vehicleOptions: { value: VehicleType; label: string; prefix: string }[] = [
  { value: 'passenger_bus', label: 'Camion Pasajeros', prefix: 'CPAS' },
  { value: 'cargo_truck', label: 'Camion Carga', prefix: 'CCAR' },
  { value: 'car', label: 'Automovil', prefix: 'AUTO' },
  { value: 'motorcycle', label: 'Motocicleta', prefix: 'MOTO' },
]

function suggestSerial(type: VehicleType | null, nickname: string): string {
  if (!type || !nickname) return ''
  const opt = vehicleOptions.find((o) => o.value === type)
  if (!opt) return ''
  return `SMYT-${nickname}-26`
}

interface EditDeviceModalProps {
  device: Device | null
  onClose: () => void
  onSaved: () => void
}

export function EditDeviceModal({ device, onClose, onSaved }: EditDeviceModalProps) {
  const [vehicleType, setVehicleType] = useState<VehicleType | ''>('')
  const [nickname, setNickname] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (device) {
      setVehicleType(device.vehicleType || '')
      setNickname(device.nickname || '')
      setSerialNumber(device.serialNumber || '')
      setLocation('')
      setError(null)
    }
  }, [device])

  // Auto-sugerir serial cuando cambia tipo o nickname
  useEffect(() => {
    if (vehicleType && nickname && !serialNumber) {
      const suggested = suggestSerial(vehicleType as VehicleType, nickname)
      if (suggested) setSerialNumber(suggested)
    }
  }, [vehicleType, nickname, serialNumber])

  const handleSave = async () => {
    if (!device) return
    setSaving(true)
    setError(null)

    const res = await iotApi.updateDevice(device.thingName, {
      vehicleType: vehicleType ? (vehicleType as VehicleType) : null,
      nickname: nickname || undefined,
      serialNumber: serialNumber || null,
      location: location || null,
    })

    setSaving(false)

    if (res.error) {
      setError(res.error)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Modal open={!!device} onClose={onClose} title={device ? `Configurar ${device.nickname || device.thingName}` : ''}>
      <div className="space-y-4">
        {/* Tipo de vehiculo */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tipo de vehiculo</label>
          <Select value={vehicleType} onValueChange={(v) => setVehicleType(v as VehicleType | '')}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              {vehicleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nickname */}
        <Input
          label="Nombre corto (nickname)"
          placeholder="Ej: CPAS-01"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        {/* Numero de serie */}
        <Input
          label="Numero de serie"
          placeholder="Ej: SMYT-CPAS-01-26"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          helperText={vehicleType && nickname ? `Sugerido: ${suggestSerial(vehicleType as VehicleType, nickname)}` : undefined}
        />

        {/* Ubicacion */}
        <Input
          label="Ubicacion"
          placeholder="Ej: Centro de Evaluacion Tlaxcala"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
