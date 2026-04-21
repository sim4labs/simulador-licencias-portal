export const FAQ_ITEMS = [
  {
    question: '¿Qué pasa si repruebo el examen teórico?',
    answer:
      'Puedes volver a presentar el examen teórico después de 24 horas. No hay límite de intentos, pero deberás iniciar una nueva solicitud cada vez.',
  },
  {
    question: '¿Puedo reagendar mi cita?',
    answer:
      'Sí, puedes cancelar tu cita actual e iniciar un nuevo proceso de agendamiento. Te recomendamos hacerlo con al menos 24 horas de anticipación.',
  },
  {
    question: '¿Cuánto dura la prueba en el simulador?',
    answer:
      'La prueba práctica en el simulador tiene una duración aproximada de 15 a 20 minutos, dependiendo del tipo de licencia.',
  },
  {
    question: '¿Qué documentos necesito llevar el día de mi cita?',
    answer:
      'Debes presentar tu identificación oficial vigente (INE/IFE o pasaporte), el código QR de tu cita y tu comprobante de pago.',
  },
  {
    question: '¿El examen teórico tiene límite de intentos?',
    answer:
      'No, puedes presentar el examen teórico las veces que sea necesario. Sin embargo, cada intento requiere iniciar una nueva solicitud.',
  },
  {
    question: '¿Qué tipo de vehículo usa el simulador?',
    answer:
      'El simulador es de última generación con 2 grados de libertad (2DOF) que reproduce condiciones reales de manejo, incluyendo aceleración, frenado y fuerzas laterales en curvas.',
  },
] as const

export const STEP_LABELS: Record<number, string> = {
  1: 'Tipo de Licencia',
  2: 'Solicitud',
  3: 'Examen Teórico',
  4: 'Agendar Cita',
  5: 'Simulador',
  6: 'Resultados',
}

export const STEP_ROUTES: Record<number, string> = {
  1: '/portal/tipo-licencia',
  2: '/portal/solicitud',
  3: '/portal/examen',
  4: '/portal/agendar',
  5: '/portal/confirmacion',
  6: '/portal/resultados',
}

export const PROCESS_STEPS = [
  { num: 1, title: 'Tipo de Licencia', desc: 'Selecciona el tipo de licencia que deseas obtener' },
  { num: 2, title: 'Examen Teórico', desc: 'Aprueba el examen de conocimientos sobre leyes de tránsito' },
  { num: 3, title: 'Agenda tu cita', desc: 'Selecciona fecha y hora para tu prueba en el simulador' },
  { num: 4, title: 'Prueba Práctica', desc: 'Preséntate con tu QR y realiza la prueba en el simulador' },
  { num: 5, title: 'Consulta resultados', desc: 'Revisa tus resultados en línea una vez completada la prueba' },
] as const

export const COSTS = [
  { type: 'Motocicleta', price: '$850', duration: '3 años' },
  { type: 'Particular', price: '$1,200', duration: '3 años' },
  { type: 'Transporte Público', price: '$1,800', duration: '2 años' },
  { type: 'Carga Pesada', price: '$2,500', duration: '2 años' },
] as const
