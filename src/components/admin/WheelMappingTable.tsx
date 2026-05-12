'use client'

import type { HoriMappingV1, G923MappingV1, MotoMappingV1 } from '@/lib/simulator-api'
import { Gamepad2 } from 'lucide-react'

interface Props {
  raw: string
  updatedAt?: string | null
}

type WheelKind = 'hori' | 'g923' | 'moto' | 'unknown'

function detectWheelKind(parsed: Record<string, unknown> | null): WheelKind {
  if (!parsed || typeof parsed !== 'object') return 'unknown'
  // Moto mappings carry `vehicleType === 'motorcycle'` discriminator (v1.9.0).
  if ((parsed as { vehicleType?: unknown }).vehicleType === 'motorcycle') return 'moto'
  // G923 mappings carry an explicit `variant` discriminator ('PS' | 'Xbox').
  if (typeof (parsed as { variant?: unknown }).variant === 'string') return 'g923'
  // HORI mappings expose wheelVID/shifterVID (no `variant`).
  if ((parsed as { wheelVID?: unknown }).wheelVID || (parsed as { shifterVID?: unknown }).shifterVID) return 'hori'
  return 'unknown'
}

export function WheelMappingTable({ raw, updatedAt }: Props) {
  let parsed: Record<string, unknown> | null = null
  try { parsed = JSON.parse(raw) } catch { /* fall-through */ }

  if (!parsed || typeof parsed !== 'object') {
    return (
      <div className="text-xs text-red-500 italic">
        controlMapping presente pero no parseable como JSON.
      </div>
    )
  }
  const schemaVersion = (parsed as { schemaVersion?: unknown }).schemaVersion
  if (schemaVersion !== 1) {
    return (
      <div className="text-xs text-amber-500 italic">
        Schema desconocido (v{String(schemaVersion)}). Ignorado.
      </div>
    )
  }

  const kind = detectWheelKind(parsed)
  if (kind === 'hori') return <HoriBody parsed={parsed as unknown as HoriMappingV1} updatedAt={updatedAt} />
  if (kind === 'g923') return <G923Body parsed={parsed as unknown as G923MappingV1} updatedAt={updatedAt} />
  if (kind === 'moto') return <MotoBody parsed={parsed as unknown as MotoMappingV1} updatedAt={updatedAt} />
  return (
    <div className="text-xs text-amber-500 italic">
      controlMapping con tipo no reconocido (sin vehicleType, variant ni wheelVID).
    </div>
  )
}

// Re-export legacy name to avoid breaking imports from prior phases.
export const HoriMappingTable = WheelMappingTable

function formatBtn(b: { path?: string; required?: boolean; kind?: string } | undefined) {
  if (!b?.path) return <span className="text-red-500 italic">(sin asignar)</span>
  return <span className="font-mono text-xs">{b.path}{b.kind === 'pulse' ? ' (pulse)' : ''}</span>
}

function HoriBody({ parsed, updatedAt }: { parsed: HoriMappingV1; updatedAt?: string | null }) {
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

function G923Body({ parsed, updatedAt }: { parsed: G923MappingV1; updatedAt?: string | null }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <Gamepad2 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Calibración G923 {parsed.variant} (v1.8.0)
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
          <Row label="Variant" value={<span className="font-mono text-xs">{parsed.variant}</span>} />
          <Row label="Fingerprint" value={<span className="font-mono text-xs">{parsed.deviceFingerprint}</span>} />
          <Row label="Calibrada por" value={parsed.calibratedBy} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Axes</div>
          <Row label="Volante" value={<span className="font-mono text-xs">{parsed.axes.steer.path} [{parsed.axes.steer.leftMax.toFixed(2)}, {parsed.axes.steer.rightMax.toFixed(2)}] center={parsed.axes.steer.center.toFixed(2)}</span>} />
          <Row label="Acelerador" value={<span className="font-mono text-xs">{parsed.axes.gas.path} rest={parsed.axes.gas.rest} press={parsed.axes.gas.press}</span>} />
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
        {parsed.ffb && (
          <div>
            <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Force Feedback</div>
            <Row label="Disponible" value={parsed.ffb.available ? 'Sí' : 'No'} />
            <Row label="Constant max" value={`${(parsed.ffb.constantForceMaxPct * 100).toFixed(0)}%`} />
            <Row label="Bumpy road max" value={`${(parsed.ffb.bumpyRoadMaxPct * 100).toFixed(0)}%`} />
          </div>
        )}
      </div>
    </div>
  )
}

function MotoBody({ parsed, updatedAt }: { parsed: MotoMappingV1; updatedAt?: string | null }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <Gamepad2 className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Calibración Moto Simulator (v1.9.0)
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
          {parsed.vid && parsed.pid && (
            <Row label="VID/PID" value={<span className="font-mono text-xs">{parsed.vid}/{parsed.pid}</span>} />
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Axes</div>
          <Row label="Lean" value={<span className="font-mono text-xs">{parsed.axes.lean.path} [{parsed.axes.lean.min.toFixed(2)}, {parsed.axes.lean.max.toFixed(2)}] center={parsed.axes.lean.center.toFixed(2)}</span>} />
          <Row label="Manubrio" value={<span className="font-mono text-xs">{parsed.axes.handlebar.path} [{parsed.axes.handlebar.min.toFixed(2)}, {parsed.axes.handlebar.max.toFixed(2)}] center={parsed.axes.handlebar.center.toFixed(2)}</span>} />
          <Row label="Acelerador" value={<span className="font-mono text-xs">{parsed.axes.gas.path} rest={parsed.axes.gas.rest.toFixed(2)} press={parsed.axes.gas.press.toFixed(2)}</span>} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">Botones</div>
          <Row label="Freno"  value={formatBtn(parsed.buttons.brake)} />
          <Row label="Clutch" value={formatBtn(parsed.buttons.clutch)} />
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
