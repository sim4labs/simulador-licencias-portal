/**
 * Documentación oficial del sistema, listada en el apartado /admin/documentos.
 *
 * Los PDFs se alojan en oio (`oio a <archivo> --public --permanent`) y se
 * enlazan por su URL pública. Para agregar un documento nuevo (p. ej. el
 * Manual de Unity): subirlo a oio y añadir una entrada a este arreglo.
 *
 * Nota: re-subir un archivo a oio genera una URL nueva; al actualizar un
 * documento hay que actualizar también su `url` aquí.
 */
export interface AdminDocumento {
  /** Identificador estable, usado como key de React. */
  id: string
  titulo: string
  descripcion: string
  /** Versión del documento (p. ej. "1.1"). */
  version: string
  /** Fecha de emisión en formato ISO (YYYY-MM-DD). */
  fechaEmision: string
  /** Para quién está pensado el documento. */
  audiencia: string
  /** URL pública de oio que abre el PDF. */
  url: string
}

export const adminDocumentos: AdminDocumento[] = [
  {
    id: 'manual-portal-admin',
    titulo: 'Manual de Operaciones — Portal Administrativo',
    descripcion:
      'Guía completa de operación del portal admin: gestión de trámites, simuladores, IoT, builds Unity, procedimientos diarios y manejo de incidencias.',
    version: '1.1',
    fechaEmision: '2026-05-11',
    audiencia: 'Operadores administrativos, supervisores de sede y soporte técnico.',
    url: 'https://share.yumaverse.com/0s',
  },
  {
    id: 'instrucciones-dns',
    titulo: 'Instrucciones DNS — Portal de Licencias',
    descripcion:
      'Registros CNAME que el equipo de IT de Tlaxcala debe crear para publicar el portal bajo el dominio tlaxcala.gob.mx.',
    version: '1.0',
    fechaEmision: '2026-05-14',
    audiencia: 'Equipo de IT del Gobierno del Estado de Tlaxcala.',
    url: 'https://share.yumaverse.com/wj',
  },
]
