'use client'

import { useParams } from 'next/navigation'
import { Loader2, Sliders, RefreshCw, Settings2, Gamepad2, GitBranch } from 'lucide-react'
import { useSimulatorPC } from '@/lib/simulator-queries'
import { Button } from '@/components/ui/Button'
import type { PCCalibration } from '@/lib/simulator-api'
import { WheelMappingTable } from '@/components/admin/WheelMappingTable'

function formatDate(iso?: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtFloat(v: number | undefined, digits = 3): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '-'
  return v.toFixed(digits)
}

function fmtStr(v: string | undefined): string {
  if (!v) return '-'
  return v
}

function fmtBool(v: boolean | undefined): string {
  if (typeof v !== 'boolean') return '-'
  return v ? 'Sí' : 'No'
}

export default function PCCalibracionPage() {
  const params = useParams()
  const pcId = params?.pcId as string
  const { data: pc, isLoading, error, refetch, isFetching } = useSimulatorPC(pcId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !pc) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {(error as Error)?.message || 'PC no encontrada'}
      </div>
    )
  }

  const cal: PCCalibration | null | undefined = pc.calibration
  const lastUpdate = pc.calibrationUpdatedAt

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Calibración del simulador</h2>
          <p className="text-sm text-gray-500 mt-1">
            {lastUpdate ? <>Última lectura: <span className="font-medium text-gray-700">{formatDate(lastUpdate)}</span></> : 'Sin datos de calibración aún'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {!cal ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Sliders className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Sin datos de calibración</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Esta PC aún no ha enviado su calibración. Llega en cada heartbeat
            (cada ~3 min) una vez que el cliente Unity esté actualizado y el
            volante haya sido calibrado en la Pantalla 2 del menú.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Device + transmisión */}
          <Section icon={GitBranch} title="Dispositivo">
            <Row label="Huella del device" mono small value={fmtStr(cal.deviceFingerprint)} />
            <Row label="Reversa calibrada" value={fmtBool(cal.reverseDone)} />
            <Row label="Transmisión manual" value={fmtBool(cal.transmisionManual)} />
          </Section>

          {/* Volante */}
          <Section icon={Sliders} title="Volante (rango físico)">
            <Row label="Centro raw" mono value={fmtFloat(cal.steerCenter)} />
            <Row label="Máximo (derecha)" mono value={fmtFloat(cal.steerMax)} />
            <Row label="Mínimo (izquierda)" mono value={fmtFloat(cal.steerMin)} />
            <Row label="Rango total" mono value={
              typeof cal.steerMax === 'number' && typeof cal.steerMin === 'number'
                ? fmtFloat(cal.steerMax - cal.steerMin)
                : '-'
            } />
          </Section>

          {/* Pedales */}
          <Section icon={Sliders} title="Pedales">
            <SubGroup title="Acelerador">
              <Row label="Eje" mono small value={fmtStr(cal.gasAxis)} />
              <Row label="Reposo" mono value={fmtFloat(cal.gasRest)} />
              <Row label="Pisado" mono value={fmtFloat(cal.gasPress)} />
              <Row label="Δ útil" mono value={
                typeof cal.gasPress === 'number' && typeof cal.gasRest === 'number'
                  ? fmtFloat(Math.abs(cal.gasPress - cal.gasRest))
                  : '-'
              } />
            </SubGroup>
            <SubGroup title="Freno">
              <Row label="Eje" mono small value={fmtStr(cal.brakeAxis)} />
              <Row label="Reposo" mono value={fmtFloat(cal.brakeRest)} />
              <Row label="Pisado" mono value={fmtFloat(cal.brakePress)} />
              <Row label="Δ útil" mono value={
                typeof cal.brakePress === 'number' && typeof cal.brakeRest === 'number'
                  ? fmtFloat(Math.abs(cal.brakePress - cal.brakeRest))
                  : '-'
              } />
            </SubGroup>
          </Section>

          {/* Tuning F9 */}
          <Section icon={Settings2} title="Sensibilidades (F9 — AdvancedInputPanel)">
            <Row label="Curva del volante" mono value={fmtFloat(cal.advSteerCurveA)} hint="1.00 = lineal · menor = más sensible cerca del centro" />
            <Row label="Deadzone del volante" mono value={fmtFloat(cal.advSteerDeadzone)} />
            <Row label="Punto de quiebre del freno" mono value={fmtFloat(cal.advBrakeSoftEnd, 2)} />
            <Row label="Freno en quiebre" mono value={fmtFloat(cal.advBrakeSoftMaxOutput, 2)} />
            <Row label="Curva del acelerador" mono value={fmtFloat(cal.advGasCurveN)} hint="1.00 = lineal · <1 arranque vivo · >1 control fino" />
          </Section>

          {/* Bindings */}
          <Section icon={Gamepad2} title="Bindings (F8 — BindingsPanel)">
            <Row label="Eje del volante" mono small value={fmtStr(cal.bindSteerAxis)} />
            <Row label="Reversa" mono small value={fmtStr(cal.bindReverse)} />
            <Row label="Drive" mono small value={fmtStr(cal.bindDrive)} />
            <Row label="Paddle izquierdo" mono small value={fmtStr(cal.bindPaddleLeft)} />
            <Row label="Paddle derecho" mono small value={fmtStr(cal.bindPaddleRight)} />
          </Section>
        </div>
      )}

      {/* v1.7.0/v1.8.0: wheel mapping (HORI o G923, autodetectado por discriminator) */}
      {pc.controlMapping && (
        <WheelMappingTable raw={pc.controlMapping} updatedAt={pc.controlMappingUpdatedAt} />
      )}
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-200">
        <Icon className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function SubGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary/30 pl-3 space-y-1">
      <div className="text-xs uppercase tracking-wide text-primary font-medium mb-1">{title}</div>
      {children}
    </div>
  )
}

function Row({ label, value, mono, small, hint }: { label: string; value: React.ReactNode; mono?: boolean; small?: boolean; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <div className="text-sm text-gray-600 flex-shrink-0">{label}</div>
      <div className="text-right">
        <div className={`${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-sm'} text-gray-900`}>{value}</div>
        {hint && <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div>}
      </div>
    </div>
  )
}
