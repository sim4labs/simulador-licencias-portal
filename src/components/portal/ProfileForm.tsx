'use client'

import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import {
  validateCURP,
  validatePhone,
  validateRFC,
  validateCP,
  TIPOS_SANGRE,
  ESTADOS_CIVIL,
  ESTADO_CIVIL_LABELS,
  NACIONALIDADES,
  NACIONALIDAD_LABELS,
  ESTADOS_MX,
  ESTADO_MX_LABELS,
  type PersonalData,
} from '@/lib/tramite'

export const emptyProfileData: PersonalData = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  nacionalidad: 'MEXICANA',
  curp: '',
  rfc: '',
  email: '',
  telefono: '',
  tipoSangre: '',
  alergias: '',
  estadoCivil: '',
  calle: '',
  noExterior: '',
  noInterior: '',
  codigoPostal: '',
  municipio: '',
  colonia: '',
  estado: 'TLAXCALA',
  donador: true,
}

export type ProfileErrors = Partial<Record<keyof PersonalData, string>>

interface SectionProps {
  values: PersonalData
  errors: ProfileErrors
  onChange: <K extends keyof PersonalData>(field: K, value: PersonalData[K]) => void
  disabled?: boolean
}

export function PersonalSection({ values, errors, onChange, disabled }: SectionProps) {
  return (
    <Card padding="lg">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Datos personales</h2>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nombre(s)"
            placeholder="Ej: Juan Carlos"
            value={values.nombre}
            onChange={(e) => onChange('nombre', e.target.value)}
            error={errors.nombre}
            disabled={disabled}
            required
          />
          <Input
            label="Apellido Paterno"
            placeholder="Ej: García"
            value={values.apellidoPaterno}
            onChange={(e) => onChange('apellidoPaterno', e.target.value)}
            error={errors.apellidoPaterno}
            disabled={disabled}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Apellido Materno"
            placeholder="Ej: López"
            value={values.apellidoMaterno}
            onChange={(e) => onChange('apellidoMaterno', e.target.value)}
            error={errors.apellidoMaterno}
            disabled={disabled}
            required
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={values.fechaNacimiento}
            onChange={(e) => onChange('fechaNacimiento', e.target.value)}
            error={errors.fechaNacimiento}
            disabled={disabled}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="CURP"
            placeholder="GALO850101HTLRPN09"
            value={values.curp}
            onChange={(e) => onChange('curp', e.target.value.toUpperCase())}
            error={errors.curp}
            helperText="18 caracteres"
            disabled={disabled}
            required
            className="uppercase"
          />
          <Input
            label="RFC"
            placeholder="GALO850101XX1"
            value={values.rfc}
            onChange={(e) => onChange('rfc', e.target.value.toUpperCase())}
            error={errors.rfc}
            helperText="12 o 13 caracteres"
            disabled={disabled}
            required
            className="uppercase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nacionalidad <span className="text-red-500">*</span>
          </label>
          <select
            value={values.nacionalidad}
            onChange={(e) => onChange('nacionalidad', e.target.value as PersonalData['nacionalidad'])}
            disabled={disabled}
            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
            required
          >
            <option value="" disabled>Selecciona...</option>
            {NACIONALIDADES.map((n) => (
              <option key={n} value={n}>{NACIONALIDAD_LABELS[n]}</option>
            ))}
          </select>
          {errors.nacionalidad && (
            <p className="mt-1 text-xs text-red-600">{errors.nacionalidad}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

export function DomicilioSection({ values, errors, onChange, disabled }: SectionProps) {
  return (
    <Card padding="lg">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Contacto y domicilio</h2>
      <div className="space-y-4">
        <Input
          label="Teléfono"
          type="tel"
          placeholder="2461234567"
          value={values.telefono}
          onChange={(e) => onChange('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
          error={errors.telefono}
          helperText="10 dígitos"
          disabled={disabled}
          required
        />
        <Input
          label="Calle"
          placeholder="Av. Independencia"
          value={values.calle}
          onChange={(e) => onChange('calle', e.target.value)}
          error={errors.calle}
          disabled={disabled}
          required
        />
        <div className="grid sm:grid-cols-3 gap-4">
          <Input
            label="Número Exterior"
            placeholder="123"
            value={values.noExterior}
            onChange={(e) => onChange('noExterior', e.target.value)}
            error={errors.noExterior}
            disabled={disabled}
            required
          />
          <Input
            label="Número Interior"
            placeholder="A (opcional)"
            value={values.noInterior}
            onChange={(e) => onChange('noInterior', e.target.value)}
            disabled={disabled}
          />
          <Input
            label="Código Postal"
            placeholder="00000"
            value={values.codigoPostal}
            onChange={(e) => onChange('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
            error={errors.codigoPostal}
            helperText="5 dígitos"
            disabled={disabled}
            required
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input
            label="Colonia"
            placeholder="Centro"
            value={values.colonia}
            onChange={(e) => onChange('colonia', e.target.value)}
            error={errors.colonia}
            disabled={disabled}
            required
          />
          <Input
            label="Municipio"
            placeholder="Tlaxcala"
            value={values.municipio}
            onChange={(e) => onChange('municipio', e.target.value)}
            error={errors.municipio}
            disabled={disabled}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={values.estado}
              onChange={(e) => onChange('estado', e.target.value as PersonalData['estado'])}
              disabled={disabled}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              required
            >
              <option value="" disabled>Selecciona...</option>
              {ESTADOS_MX.map((s) => (
                <option key={s} value={s}>{ESTADO_MX_LABELS[s]}</option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-xs text-red-600">{errors.estado}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function MedicaSection({ values, errors, onChange, disabled }: SectionProps) {
  return (
    <Card padding="lg">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Información médica y cívica</h2>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sangre <span className="text-red-500">*</span>
            </label>
            <select
              value={values.tipoSangre}
              onChange={(e) => onChange('tipoSangre', e.target.value as PersonalData['tipoSangre'])}
              disabled={disabled}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              required
            >
              <option value="" disabled>Selecciona...</option>
              {TIPOS_SANGRE.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipoSangre && (
              <p className="mt-1 text-xs text-red-600">{errors.tipoSangre}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Civil <span className="text-red-500">*</span>
            </label>
            <select
              value={values.estadoCivil}
              onChange={(e) => onChange('estadoCivil', e.target.value as PersonalData['estadoCivil'])}
              disabled={disabled}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
              required
            >
              <option value="" disabled>Selecciona...</option>
              {ESTADOS_CIVIL.map((s) => (
                <option key={s} value={s}>{ESTADO_CIVIL_LABELS[s]}</option>
              ))}
            </select>
            {errors.estadoCivil && (
              <p className="mt-1 text-xs text-red-600">{errors.estadoCivil}</p>
            )}
          </div>
        </div>
        <Input
          label="Alergias"
          placeholder="Ej: Penicilina (opcional)"
          value={values.alergias}
          onChange={(e) => onChange('alergias', e.target.value)}
          helperText="Deja en blanco si no aplica"
          disabled={disabled}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Deseas ser donador de órganos? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="donador"
                checked={values.donador === true}
                onChange={() => onChange('donador', true)}
                disabled={disabled}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Sí</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="donador"
                checked={values.donador === false}
                onChange={() => onChange('donador', false)}
                disabled={disabled}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function validateSectionPersonal(d: PersonalData): ProfileErrors {
  const e: ProfileErrors = {}
  if (!d.nombre.trim()) e.nombre = 'Requerido'
  if (!d.apellidoPaterno.trim()) e.apellidoPaterno = 'Requerido'
  if (!d.apellidoMaterno.trim()) e.apellidoMaterno = 'Requerido'
  if (!d.fechaNacimiento) e.fechaNacimiento = 'Requerido'
  if (!d.nacionalidad) e.nacionalidad = 'Requerido'
  if (!d.curp.trim()) e.curp = 'Requerido'
  else if (!validateCURP(d.curp)) e.curp = 'CURP no válido (18 caracteres)'
  if (!d.rfc.trim()) e.rfc = 'Requerido'
  else if (!validateRFC(d.rfc)) e.rfc = 'RFC no válido'
  return e
}

export function validateSectionDomicilio(d: PersonalData): ProfileErrors {
  const e: ProfileErrors = {}
  if (!d.telefono.trim()) e.telefono = 'Requerido'
  else if (!validatePhone(d.telefono)) e.telefono = 'Debe tener 10 dígitos'
  if (!d.calle.trim()) e.calle = 'Requerido'
  if (!d.noExterior.trim()) e.noExterior = 'Requerido'
  if (!d.codigoPostal.trim()) e.codigoPostal = 'Requerido'
  else if (!validateCP(d.codigoPostal)) e.codigoPostal = 'CP inválido (5 dígitos)'
  if (!d.municipio.trim()) e.municipio = 'Requerido'
  if (!d.colonia.trim()) e.colonia = 'Requerido'
  if (!d.estado) e.estado = 'Requerido'
  return e
}

export function validateSectionMedica(d: PersonalData): ProfileErrors {
  const e: ProfileErrors = {}
  if (!d.tipoSangre) e.tipoSangre = 'Requerido'
  if (!d.estadoCivil) e.estadoCivil = 'Requerido'
  return e
}

export function validateAll(d: PersonalData): ProfileErrors {
  return {
    ...validateSectionPersonal(d),
    ...validateSectionDomicilio(d),
    ...validateSectionMedica(d),
  }
}
