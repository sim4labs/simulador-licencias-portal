import { jsPDF } from 'jspdf'
import { LICENSE_TYPE_NAMES, type Tramite } from './tramite'
import { formatDate } from './utils'

const LICENSE_NAMES: Record<string, string> = LICENSE_TYPE_NAMES

// Paleta institucional (tailwind.config.ts)
const VINO: [number, number, number] = [175, 33, 64] // primary #AF2140
const MAGENTA: [number, number, number] = [146, 37, 66] // secondary #922542
const GOLD: [number, number, number] = [208, 183, 134] // gold #D0B786
const GOLD_LIGHT: [number, number, number] = [242, 230, 211] // gold.light #F2E6D3
const GOLD_FG: [number, number, number] = [88, 69, 38] // gold.foreground #584526
const GRAY: [number, number, number] = [74, 80, 87] // foreground #4A5057
const GRAY_LIGHT: [number, number, number] = [107, 114, 128]

const PAGE_W = 215.9 // carta, mm
const MARGIN = 18
const CONTENT_W = PAGE_W - MARGIN * 2

interface RasterLogo {
  dataUrl: string
  width: number
  height: number
}

// Rasteriza un logo (SVG o PNG de public/) a PNG vía canvas para poder
// incrustarlo con jsPDF, que no soporta SVG. Ambos SVGs de public/ traen
// width/height explícitos, así que naturalWidth/naturalHeight son confiables.
async function loadLogo(src: string, targetWidthPx: number): Promise<RasterLogo | null> {
  try {
    const img = new Image()
    img.src = src
    await img.decode()
    if (!img.naturalWidth || !img.naturalHeight) return null
    const canvas = document.createElement('canvas')
    canvas.width = targetWidthPx
    canvas.height = Math.round((targetWidthPx * img.naturalHeight) / img.naturalWidth)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
  } catch {
    // Sin logo el comprobante sigue siendo válido; el encabezado queda en texto.
    return null
  }
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...VINO)
  doc.text(title.toUpperCase(), MARGIN, y)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, y + 1.8, MARGIN + CONTENT_W, y + 1.8)
  return y + 8
}

function fieldRow(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY_LIGHT)
  doc.text(label, MARGIN, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...GRAY)
  // Nombres o valores largos se envuelven dentro del ancho disponible en
  // lugar de desbordarse fuera de la hoja carta.
  const lines = doc.splitTextToSize(value || '—', CONTENT_W - 48) as string[]
  doc.text(lines, MARGIN + 48, y)
  return y + 6.5 + (lines.length - 1) * 5
}

export async function generarComprobantePdf(tramite: Tramite): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'letter' })

  const [logoTlx, logoSmyt] = await Promise.all([
    loadLogo('/Tlaxcala-logo.svg', 640),
    loadLogo('/SMyT-logo.svg', 480),
  ])

  // Encabezado: logos + línea institucional
  let y = 16
  if (logoTlx) {
    const w = 52
    doc.addImage(logoTlx.dataUrl, 'PNG', MARGIN, y, w, (w * logoTlx.height) / logoTlx.width)
  }
  if (logoSmyt) {
    const w = 40
    const h = (w * logoSmyt.height) / logoSmyt.width
    doc.addImage(logoSmyt.dataUrl, 'PNG', PAGE_W - MARGIN - w, y, w, h)
  }
  y = 34
  doc.setDrawColor(...VINO)
  doc.setLineWidth(1)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y + 1.6, PAGE_W - MARGIN, y + 1.6)

  // Título
  y += 12
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...VINO)
  doc.text('Comprobante de cita — Prueba en simulador de manejo', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY_LIGHT)
  doc.text('Secretaría de Movilidad y Transporte · Gobierno del Estado de Tlaxcala', PAGE_W / 2, y, {
    align: 'center',
  })

  // Datos del solicitante
  y += 12
  y = sectionTitle(doc, 'Datos del solicitante', y)
  const nombreCompleto = [
    tramite.personalData.nombre,
    tramite.personalData.apellidoPaterno,
    tramite.personalData.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(' ')
  y = fieldRow(doc, 'Nombre', nombreCompleto, y)
  if (tramite.personalData.curp) {
    y = fieldRow(doc, 'CURP', tramite.personalData.curp, y)
  }
  y = fieldRow(doc, 'Tipo de licencia', LICENSE_NAMES[tramite.licenseType || ''] || tramite.licenseType || '—', y)
  y = fieldRow(doc, 'Folio de trámite', tramite.id, y)

  // Examen teórico. Solo se puede agendar cita con el teórico aprobado
  // (agendar-cita exige status examen-aprobado), así que este comprobante
  // certifica la aprobación.
  y += 4
  y = sectionTitle(doc, 'Examen teórico de conocimientos', y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(22, 128, 61) // verde éxito
  doc.text('APROBADO', MARGIN, y)
  y += 7
  if (tramite.examResult) {
    y = fieldRow(doc, 'Calificación', `${tramite.examResult.score} / 100`, y)
    if (tramite.examResult.completedAt) {
      y = fieldRow(doc, 'Fecha de aplicación', formatDate(tramite.examResult.completedAt), y)
    }
  }

  // Cita
  y += 4
  y = sectionTitle(doc, 'Cita en el simulador', y)
  if (tramite.appointment) {
    y = fieldRow(doc, 'Fecha', formatDate(tramite.appointment.date), y)
    y = fieldRow(doc, 'Hora', `${tramite.appointment.time} hrs`, y)
    y = fieldRow(doc, 'Código de cita', tramite.appointment.code, y)
  }

  // Código del simulador en grande
  y += 6
  const digits = tramite.id.replace(/^TLX-/, '')
  const boxH = 46
  doc.setFillColor(...GOLD_LIGHT)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.6)
  doc.roundedRect(MARGIN, y, CONTENT_W, boxH, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...GOLD_FG)
  doc.text('CÓDIGO PARA INICIAR TU PRUEBA', PAGE_W / 2, y + 10, { align: 'center' })
  doc.setFontSize(34)
  doc.setTextColor(...MAGENTA)
  doc.text(digits.split('').join('  '), PAGE_W / 2, y + 26, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GOLD_FG)
  doc.text(
    'El día de tu cita, ingresa estos seis dígitos en la pantalla del simulador para comenzar tu prueba.',
    PAGE_W / 2,
    y + 36,
    { align: 'center' }
  )
  y += boxH

  // Indicaciones y pie
  y += 12
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY)
  const indicaciones = [
    'Presenta este comprobante junto con tu identificación oficial vigente el día de tu cita.',
    'Llega al menos 15 minutos antes de la hora programada.',
  ]
  indicaciones.forEach((line) => {
    doc.text('•  ' + line, MARGIN, y)
    y += 5.5
  })

  const pageH = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(...GRAY_LIGHT)
  doc.text(
    `Documento informativo generado el ${formatDate(new Date())} · Folio ${tramite.id}`,
    PAGE_W / 2,
    pageH - 14,
    { align: 'center' }
  )

  doc.save(`comprobante-simulador-${tramite.id}.pdf`)
}
