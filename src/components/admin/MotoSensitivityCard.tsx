'use client';

interface MotoSensitivitySummary {
  schemaVersion: number;
  activePreset: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  summary: {
    lean:  { dz: number; curve: string; scale: number };
    hbar:  { dz: number; curve: string; scale: number };
    gas:   { dz: number; curve: string; scale: number; rampUp: number };
    brake: { scale: number };
    clutch:{ scale: number };
    blend: { startKmh: number; endKmh: number; highWeight: number };
  };
}

export function MotoSensitivityCard({ payload }: { payload: string | null | undefined }) {
  if (!payload) return null;

  let data: MotoSensitivitySummary;
  try {
    data = JSON.parse(payload);
  } catch {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 mt-4">
        <p className="text-sm text-red-800">MotoSensitivity payload corrupto en heartbeat.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 mt-4">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-lg font-semibold">Sensibilidad de Moto</h3>
        <span className="text-sm text-gray-500">
          Preset activo: <span className="font-mono font-semibold">{data.activePreset}</span>
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Modificado: {data.lastModifiedAt} ({data.lastModifiedBy})
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-600">
            <th className="py-2">Canal</th>
            <th>Deadzone</th>
            <th>Curva</th>
            <th>Escala</th>
            <th>Extra</th>
          </tr>
        </thead>
        <tbody>
          <Row label="Lean"      dz={data.summary.lean.dz}  curve={data.summary.lean.curve}  scale={data.summary.lean.scale}  />
          <Row label="Handlebar" dz={data.summary.hbar.dz}  curve={data.summary.hbar.curve}  scale={data.summary.hbar.scale}  />
          <Row label="Gas"       dz={data.summary.gas.dz}   curve={data.summary.gas.curve}   scale={data.summary.gas.scale}
               extra={`ramp ${data.summary.gas.rampUp.toFixed(1)}/s`} />
          <Row label="Freno"     scale={data.summary.brake.scale} />
          <Row label="Clutch"    scale={data.summary.clutch.scale} />
        </tbody>
      </table>

      <p className="text-sm text-gray-700 mt-4">
        Mezcla por velocidad: {data.summary.blend.startKmh.toFixed(0)} → {data.summary.blend.endKmh.toFixed(0)} km/h,
        peso lean alta vel {(data.summary.blend.highWeight * 100).toFixed(0)}%.
      </p>
    </div>
  );
}

function Row({ label, dz, curve, scale, extra }: { label: string; dz?: number; curve?: string; scale: number; extra?: string }) {
  return (
    <tr className="border-b">
      <td className="py-2 font-medium">{label}</td>
      <td>{dz !== undefined ? dz.toFixed(3) : '—'}</td>
      <td>{curve ?? '—'}</td>
      <td>{scale.toFixed(2)}</td>
      <td>{extra ?? '—'}</td>
    </tr>
  );
}
