'use client'

import type { HoriMappingV1 } from '@/lib/simulator-api'
import { Gamepad2 } from 'lucide-react'

interface Props {
  raw: string
  updatedAt?: string | null
}

export function HoriMappingTable({ raw, updatedAt }: Props) {
  let parsed: HoriMappingV1 | null = null
  try { parsed = JSON.parse(raw) } catch { /* fall-through */ }

  if (!parsed || typeof parsed !== 'object') {
    return (
      <div className="text-xs text-red-500 italic">
        controlMapping presente pero no parseable como JSON.
      </div>
    )
  }
  if (parsed.schemaVersion !== 1) {
    return (
      <div className="text-xs text-amber-500 italic">
        Schema desconocido (v{parsed.schemaVersion}). Ignorado.
      </div>
    )
  }

  const formatBtn = (b: { path?: string; required?: boolean; kind?: string }) => {
    if (!b?.path) return <span className="text-red-500 italic">(sin asignar)</span>
    return <span className="font-mono text-xs">{b.path}{b.kind === 'pulse' ? ' (pulse)' : ''}</span>
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <Gamepad2 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Calibración HORI (v1.7.0)
        </h3>
        {updatedAt && (
          <span className="ml-auto text-xs text-gray-500">
            Actualizada {new Date(updatedAt).toLocaleString('es-MX')}
          </span>
        )}
      </div>
      <div className="px-5 py-4 space-y-3 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Identidad</div>
          <Row label="Fingerprint" value={<span className="font-mono text-xs">{parsed.deviceFingerprint}</span>} />
          <Row label="Calibrada por" value={parsed.calibratedBy} />
          {parsed.wheelVID && <Row label="Wheel VID/PID" value={<span className="font-mono text-xs">{parsed.wheelVID}/{parsed.wheelPID}</span>} />}
          {parsed.shifterVID && <Row label="Shifter VID/PID" value={<span className="font-mono text-xs">{parsed.shifterVID}/{parsed.shifterPID}</span>} />}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Axes</div>
          <Row label="Volante" value={<span className="font-mono text-xs">{parsed.axes.steer.path} [{parsed.axes.steer.leftMax.toFixed(2)}, {parsed.axes.steer.rightMax.toFixed(2)}] center={parsed.axes.steer.center.toFixed(2)}</span>} />
          <Row label="Acelerador" value={<span className="font-mono text-xs">{parsed.axes.gas.source} (threshold {parsed.axes.gas.verifyThreshold})</span>} />
          <Row label="Freno" value={<span className="font-mono text-xs">{parsed.axes.brake.path} rest={parsed.axes.brake.rest} press={parsed.axes.brake.press}</span>} />
          <Row label="Clutch" value={<span className="font-mono text-xs">{parsed.axes.clutch.path} rest={parsed.axes.clutch.rest} press={parsed.axes.clutch.press} {parsed.axes.clutch.required ? '· required' : ''}</span>} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Botones</div>
          <Row label="Claxon"        value={formatBtn(parsed.buttons.horn)} />
          <Row label="Intermitentes" value={formatBtn(parsed.buttons.hazards)} />
          <Row label="Flecha izq"    value={formatBtn(parsed.buttons.turnLeft)} />
          <Row label="Flecha der"    value={formatBtn(parsed.buttons.turnRight)} />
          <Row label="Reversa"       value={formatBtn(parsed.buttons.reverse)} />
          <Row label="Marcha 1"      value={formatBtn(parsed.buttons.gear1)} />
          <Row label="Marcha 2"      value={formatBtn(parsed.buttons.gear2)} />
          <Row label="Marcha 3"      value={formatBtn(parsed.buttons.gear3)} />
          <Row label="Marcha 4"      value={formatBtn(parsed.buttons.gear4)} />
          <Row label="Marcha 5"      value={formatBtn(parsed.buttons.gear5)} />
          <Row label="Marcha 6"      value={formatBtn(parsed.buttons.gear6)} />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5">
      <div className="text-gray-600 flex-shrink-0">{label}</div>
      <div className="text-right">{value}</div>
    </div>
  )
}
