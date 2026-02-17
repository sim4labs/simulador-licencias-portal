// Pool de preguntas para exámenes de licencia de conducir
// Basado en la Ley de Movilidad y Seguridad Vial del Estado de Tlaxcala
// y el Reglamento de Tránsito en Carreteras y Puentes de Jurisdicción Federal

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number // índice de la respuesta correcta (0-3)
  explanation: string
  category: 'general' | 'motocicleta' | 'particular' | 'publico' | 'carga'
  difficulty: 'medio' | 'avanzado'
}

// Preguntas generales que aplican a todos los tipos de licencia
export const generalQuestions: Question[] = [
  // JERARQUÍA DE MOVILIDAD
  {
    id: 'gen-001',
    question: 'Según la Ley de Movilidad y Seguridad Vial, ¿cuál es el orden correcto de la jerarquía de movilidad?',
    options: [
      'Vehículos particulares, transporte público, ciclistas, peatones',
      'Peatones, ciclistas, transporte público, vehículos de carga, vehículos particulares',
      'Transporte público, peatones, ciclistas, vehículos particulares',
      'Ciclistas, peatones, transporte público, vehículos particulares'
    ],
    correctAnswer: 1,
    explanation: 'La Ley General de Movilidad y Seguridad Vial establece la jerarquía: 1) Peatones, 2) Ciclistas, 3) Transporte público, 4) Transporte de carga, 5) Vehículos particulares.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-002',
    question: '¿Qué es una "Zona 30" según el Reglamento de Movilidad?',
    options: [
      'Una zona donde solo pueden circular 30 vehículos por hora',
      'Un área con velocidad máxima de 30 km/h donde peatones y ciclistas tienen preferencia sobre vehículos motorizados',
      'Una zona de estacionamiento con capacidad para 30 vehículos',
      'Un tramo de carretera de 30 kilómetros de longitud'
    ],
    correctAnswer: 1,
    explanation: 'La Zona 30 es un área señalizada donde la velocidad máxima es de 30 km/h, otorgando preferencia permanente a peatones, ciclistas y usuarios de transporte público sobre automóviles y motocicletas.',
    category: 'general',
    difficulty: 'medio'
  },

  // LÍMITES DE VELOCIDAD
  {
    id: 'gen-003',
    question: '¿Cuál es el límite de velocidad máximo en zonas escolares durante horarios de entrada y salida de alumnos?',
    options: [
      '30 km/h',
      '40 km/h',
      '20 km/h',
      '25 km/h'
    ],
    correctAnswer: 2,
    explanation: 'En zonas escolares, la velocidad máxima una hora antes y una hora después de la entrada o salida de alumnos es de 20 km/h para proteger a los estudiantes.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-004',
    question: '¿Cuál es la velocidad máxima permitida en intersecciones con o sin semáforos?',
    options: [
      '60 km/h',
      '40 km/h',
      '50 km/h',
      '30 km/h'
    ],
    correctAnswer: 2,
    explanation: 'Ninguna intersección, tenga o no semáforos, puede tener una velocidad de operación mayor a 50 km/h en cualquiera de sus accesos.',
    category: 'general',
    difficulty: 'avanzado'
  },
  {
    id: 'gen-005',
    question: '¿Cuál es la velocidad máxima en estacionamientos y vías peatonales donde se permite acceso a vehículos?',
    options: [
      '20 km/h',
      '15 km/h',
      '10 km/h',
      '5 km/h'
    ],
    correctAnswer: 2,
    explanation: 'En estacionamientos y vías peatonales donde se permite el acceso a vehículos, la velocidad máxima es de 10 km/h.',
    category: 'general',
    difficulty: 'avanzado'
  },
  {
    id: 'gen-006',
    question: '¿Cuál es el límite de velocidad en zonas de hospitales, asilos, albergues y casas hogar?',
    options: [
      '30 km/h',
      '25 km/h',
      '20 km/h',
      '40 km/h'
    ],
    correctAnswer: 2,
    explanation: 'En zonas de hospitales, asilos, albergues y casas hogar, la velocidad máxima es de 20 km/h.',
    category: 'general',
    difficulty: 'medio'
  },

  // SEÑALES DE TRÁNSITO
  {
    id: 'gen-007',
    question: '¿Cuál es la característica principal de las señales preventivas?',
    options: [
      'Fondo blanco con aro rojo, indican prohibiciones',
      'Fondo amarillo en forma de diamante, alertan sobre condiciones peligrosas adelante',
      'Fondo verde rectangular, indican destinos y distancias',
      'Fondo azul cuadrado, informan sobre servicios disponibles'
    ],
    correctAnswer: 1,
    explanation: 'Las señales preventivas tienen forma de diamante con fondo amarillo y pictogramas negros, alertando sobre condiciones peligrosas o cambios en la vía.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-008',
    question: '¿Qué consecuencia tiene desobedecer una señal restrictiva?',
    options: [
      'Ninguna, son solo recomendaciones',
      'Solo una advertencia verbal',
      'Sanciones establecidas en los Reglamentos de Tránsito',
      'Solo aplica en carreteras federales'
    ],
    correctAnswer: 2,
    explanation: 'La desobediencia de señales restrictivas implica sanciones establecidas en los Reglamentos de Tránsito, ya que son mandatos claros de limitaciones o prohibiciones.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-009',
    question: '¿Cómo se identifican las señales informativas de destino en carreteras y autopistas?',
    options: [
      'Rectangulares de fondo amarillo',
      'Rectangulares de fondo verde',
      'Circulares de fondo azul',
      'Triangulares de fondo blanco'
    ],
    correctAnswer: 1,
    explanation: 'Las señales informativas de destino son rectangulares con fondo verde para carreteras y autopistas, indicando nombres de ciudades, distancias y direcciones.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-010',
    question: 'Las señales restrictivas se caracterizan por:',
    options: [
      'Forma de diamante con fondo amarillo',
      'Color blanco con un aro de color rojo',
      'Fondo verde con letras blancas',
      'Fondo azul con símbolos blancos'
    ],
    correctAnswer: 1,
    explanation: 'Las señales restrictivas son de color blanco con un aro de color rojo, indicando limitaciones o prohibiciones que regulan el tránsito.',
    category: 'general',
    difficulty: 'medio'
  },

  // ALCOHOLÍMETRO
  {
    id: 'gen-011',
    question: '¿Cuál es el límite máximo de alcohol en sangre permitido para conducir vehículos particulares?',
    options: [
      '0.5 gramos por litro',
      '0.8 gramos por litro',
      '1.0 gramos por litro',
      '0.4 gramos por litro'
    ],
    correctAnswer: 1,
    explanation: 'El límite es 0.8 gramos de alcohol por litro de sangre, o 0.4 miligramos por litro de aire espirado para vehículos particulares.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-012',
    question: '¿Qué sanción se aplica por no aprobar la prueba del alcoholímetro?',
    options: [
      'Solo multa económica de $1,000 pesos',
      'Advertencia y retiro del vehículo',
      'Arresto inconmutable de 20 a 36 horas, puntos de penalización y remisión del vehículo',
      'Suspensión de licencia por 24 horas únicamente'
    ],
    correctAnswer: 2,
    explanation: 'La sanción incluye arresto administrativo INCONMUTABLE de 20 a 36 horas, 6 puntos de penalización a la licencia y remisión del vehículo al depósito.',
    category: 'general',
    difficulty: 'avanzado'
  },
  {
    id: 'gen-013',
    question: '¿Cuántos puntos de penalización se cancelan la licencia de conducir?',
    options: [
      '6 puntos',
      '10 puntos',
      '12 puntos',
      '15 puntos'
    ],
    correctAnswer: 2,
    explanation: 'Si se acumulan 12 puntos de penalización, la licencia de conducir será cancelada por 3 años.',
    category: 'general',
    difficulty: 'avanzado'
  },

  // DOCUMENTOS Y SEGUROS
  {
    id: 'gen-014',
    question: '¿Qué documento es obligatorio para circular en vías públicas además de la licencia?',
    options: [
      'Solo la tarjeta de circulación',
      'Póliza de seguro de responsabilidad civil vigente',
      'Solo el comprobante de pago de tenencia',
      'Permiso especial de circulación'
    ],
    correctAnswer: 1,
    explanation: 'Los vehículos deben contar con una póliza de seguro de responsabilidad civil vigente que ampare daños y perjuicios a usuarios o terceros.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-015',
    question: 'El rebase de vehículos debe efectuarse:',
    options: [
      'Por cualquier lado si hay espacio suficiente',
      'Exclusivamente por el lado izquierdo',
      'Por el lado derecho en vías urbanas',
      'Por el carril central únicamente'
    ],
    correctAnswer: 1,
    explanation: 'Todo rebase debe efectuarse exclusivamente por el lado izquierdo, nunca por el mismo carril que el vehículo adelantado.',
    category: 'general',
    difficulty: 'medio'
  },

  // DERECHOS DEL PEATÓN
  {
    id: 'gen-016',
    question: '¿Qué grupos de peatones tienen enfoque prioritario según la Ley de Movilidad?',
    options: [
      'Solo adultos mayores',
      'Personas con discapacidad, movilidad limitada y enfoque de género',
      'Solo personas en silla de ruedas',
      'Únicamente menores de edad'
    ],
    correctAnswer: 1,
    explanation: 'La ley establece un enfoque equitativo y diferenciado en razón de género, personas con discapacidad y movilidad limitada.',
    category: 'general',
    difficulty: 'avanzado'
  },
  {
    id: 'gen-017',
    question: '¿En qué caso los vehículos de emergencia tienen prioridad sobre la jerarquía de movilidad?',
    options: [
      'Nunca, siempre aplica la jerarquía normal',
      'Solo si llevan las sirenas apagadas',
      'Cuando la situación de emergencia así lo requiera',
      'Únicamente en carreteras federales'
    ],
    correctAnswer: 2,
    explanation: 'Las autoridades establecerán el uso prioritario de la vía a vehículos que presten servicios de emergencia cuando la situación así lo requiera.',
    category: 'general',
    difficulty: 'medio'
  },

  // VÍAS DE CIRCULACIÓN
  {
    id: 'gen-018',
    question: '¿Cuál es el límite de velocidad en vialidades primarias urbanas?',
    options: [
      '60 km/h',
      '50 km/h',
      '40 km/h',
      '80 km/h'
    ],
    correctAnswer: 1,
    explanation: 'En vialidades primarias urbanas el límite es de 50 km/h, mientras que en secundarias es de 40 km/h.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-019',
    question: '¿Cuál es el límite de velocidad en zonas de tránsito calmado?',
    options: [
      '20 km/h',
      '40 km/h',
      '30 km/h',
      '50 km/h'
    ],
    correctAnswer: 2,
    explanation: 'En zonas de tránsito calmado la velocidad máxima es de 30 km/h.',
    category: 'general',
    difficulty: 'medio'
  },
  {
    id: 'gen-020',
    question: '¿Cuál es la velocidad máxima en carreteras estatales fuera de zonas urbanas?',
    options: [
      '100 km/h',
      '90 km/h',
      '80 km/h',
      '70 km/h'
    ],
    correctAnswer: 2,
    explanation: 'En carreteras estatales el límite es de 80 km/h fuera de zonas urbanas y 50 km/h dentro de zonas urbanas.',
    category: 'general',
    difficulty: 'avanzado'
  },
]

// Preguntas específicas para motocicletas
export const motocicletaQuestions: Question[] = [
  {
    id: 'moto-001',
    question: '¿Qué equipo de protección es obligatorio para el conductor y pasajero de motocicleta?',
    options: [
      'Solo casco para el conductor',
      'Casco certificado para conductor y pasajero',
      'Chaleco reflejante únicamente',
      'Guantes y rodilleras solamente'
    ],
    correctAnswer: 1,
    explanation: 'Es obligatorio el uso de casco certificado tanto para el conductor como para el pasajero de motocicleta.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-002',
    question: '¿Pueden las motocicletas circular entre carriles o hileras de vehículos?',
    options: [
      'Sí, siempre que sea con precaución',
      'No, está prohibido circular entre carriles o hileras adyacentes de vehículos',
      'Solo en embotellamientos',
      'Únicamente en horario nocturno'
    ],
    correctAnswer: 1,
    explanation: 'Las motocicletas no pueden ser conducidas entre los carriles de tránsito o entre hileras adyacentes de vehículos.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-003',
    question: '¿Cuántas motocicletas pueden transitar de forma paralela en el mismo carril?',
    options: [
      'Hasta tres motocicletas',
      'Dos motocicletas máximo',
      'Solo una, está prohibido transitar en paralelo',
      'Sin límite si hay espacio'
    ],
    correctAnswer: 2,
    explanation: 'Si dos o más motocicletas transitan de forma paralela en el mismo carril, es motivo de infracción.',
    category: 'motocicleta',
    difficulty: 'avanzado'
  },
  {
    id: 'moto-004',
    question: 'El motociclista tiene derecho a:',
    options: [
      'Compartir carril con vehículos de cuatro ruedas',
      'Uso total de un carril, que solo puede compartir con otra motocicleta',
      'Rebasar por el mismo carril a cualquier vehículo',
      'Circular por el acotamiento en todo momento'
    ],
    correctAnswer: 1,
    explanation: 'El conductor de motocicleta está autorizado para el uso total de un carril, que puede ser compartido únicamente con otro vehículo de igual naturaleza.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-005',
    question: '¿Puede un motociclista rebasar por el mismo carril a un vehículo de cuatro o más ruedas?',
    options: [
      'Sí, si hay espacio suficiente',
      'No, el rebase debe ser por otro carril',
      'Solo si el vehículo está detenido',
      'Únicamente en vías de alta velocidad'
    ],
    correctAnswer: 1,
    explanation: 'El conductor de motocicleta no debe rebasar por el mismo carril a otro vehículo de cuatro o más ruedas.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-006',
    question: '¿Qué especificación debe cumplir el casco de motociclista según la normativa?',
    options: [
      'Cualquier casco es válido',
      'Debe cumplir con NOM-206 o certificación ECE/DOT',
      'Solo cascos de marca reconocida',
      'Cascos de bicicleta son aceptables'
    ],
    correctAnswer: 1,
    explanation: 'El casco debe cumplir con NOM-206-SCFI/SSA2-2018, certificación UN R.22.05 (ECE) o FMVSS 218 (DOT).',
    category: 'motocicleta',
    difficulty: 'avanzado'
  },
  {
    id: 'moto-007',
    question: '¿Cuál es la vigencia máxima de un casco de motociclista según el reglamento?',
    options: [
      '3 años',
      '10 años',
      '5 años',
      'Sin límite si está en buen estado'
    ],
    correctAnswer: 2,
    explanation: 'El casco debe tener vigencia no mayor a cinco años para garantizar su efectividad de protección.',
    category: 'motocicleta',
    difficulty: 'avanzado'
  },
  {
    id: 'moto-008',
    question: '¿Pueden circular motocicletas por carriles confinados de transporte público?',
    options: [
      'Sí, tienen prioridad',
      'No, existe restricción absoluta',
      'Solo en horarios de baja afluencia',
      'Únicamente motocicletas de más de 250cc'
    ],
    correctAnswer: 1,
    explanation: 'Existe restricción absoluta al tránsito de motocicletas por carriles confinados para transporte público y ciclovías.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-009',
    question: '¿Pueden circular motocicletas por aceras, camellones o áreas peatonales?',
    options: [
      'Sí, a baja velocidad',
      'No, está prohibido y puede implicar retención del vehículo',
      'Solo en casos de emergencia',
      'Únicamente para estacionarse'
    ],
    correctAnswer: 1,
    explanation: 'Se impide circular por aceras, camellones o áreas reservadas a peatones. La sanción puede incluir retención del vehículo.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-010',
    question: '¿Qué equipo adicional al casco se recomienda/exige para motociclistas?',
    options: [
      'Solo el casco es necesario',
      'Anteojos protectores, chamarra y aditamentos rígidos para extremidades',
      'Únicamente guantes',
      'Botas de seguridad industrial'
    ],
    correctAnswer: 1,
    explanation: 'Además del casco, se requieren anteojos protectores que no comprometan la visión periférica, chamarra y aditamentos rígidos para las extremidades.',
    category: 'motocicleta',
    difficulty: 'avanzado'
  },
  {
    id: 'moto-011',
    question: '¿Qué restricción existe para transportar menores en motocicleta?',
    options: [
      'No hay restricciones específicas',
      'Queda prohibido transportar niños que no puedan sujetarse adecuadamente',
      'Solo pueden ir menores de 10 años',
      'Deben ir en un asiento especial'
    ],
    correctAnswer: 1,
    explanation: 'Queda prohibido transportar niñas, niños o adolescentes que no puedan sujetarse adecuadamente.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-012',
    question: '¿Cuál es el límite de alcohol para conductores de motocicleta en algunos estados?',
    options: [
      'Igual que vehículos particulares (0.8 g/l)',
      '0.02 gramos por decilitro (prácticamente cero)',
      '0.5 gramos por litro',
      '0.4 gramos por litro'
    ],
    correctAnswer: 1,
    explanation: 'En algunos estados como el Estado de México, ninguna persona puede conducir motocicletas con más de 0.02 g/dl de alcohol en sangre.',
    category: 'motocicleta',
    difficulty: 'avanzado'
  },
  {
    id: 'moto-013',
    question: '¿Qué cilindrada mínima requiere una motocicleta para circular por carriles centrales de vías de acceso controlado?',
    options: [
      '125cc',
      '150cc',
      'Más de 250cc',
      'Cualquier cilindrada'
    ],
    correctAnswer: 2,
    explanation: 'Solo las motocicletas con más de 250cc pueden transitar por carriles centrales de vías de acceso controlado como Periférico y Viaducto.',
    category: 'motocicleta',
    difficulty: 'avanzado'
  },
  {
    id: 'moto-014',
    question: '¿Deben las motocicletas llevar las luces encendidas?',
    options: [
      'Solo de noche',
      'Solo en carretera',
      'Las luces deben estar encendidas permanentemente',
      'Es opcional durante el día'
    ],
    correctAnswer: 2,
    explanation: 'En carreteras federales, los motociclistas deben usar luces encendidas permanentemente para mayor visibilidad.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
  {
    id: 'moto-015',
    question: 'Los demás conductores respecto a los motociclistas:',
    options: [
      'Pueden compartir carril si hay espacio',
      'No deben privarlos de alguna parte de su carril para circular',
      'Tienen prioridad sobre ellos',
      'Pueden rebasarlos por cualquier lado'
    ],
    correctAnswer: 1,
    explanation: 'Los demás conductores no deben transitar en forma que priven al conductor de motocicletas de alguna parte de su carril para circular.',
    category: 'motocicleta',
    difficulty: 'medio'
  },
]

// Preguntas específicas para transporte público
export const publicoQuestions: Question[] = [
  {
    id: 'pub-001',
    question: '¿Cuál es el límite de alcohol permitido para conductores de transporte público de pasajeros?',
    options: [
      '0.8 gramos por litro',
      '0.4 gramos por litro',
      'Tolerancia cero (ninguna cantidad)',
      '0.5 gramos por litro'
    ],
    correctAnswer: 2,
    explanation: 'Los conductores de transporte público de pasajeros no deben presentar ninguna cantidad de alcohol en sangre o aire espirado.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-002',
    question: '¿Cuál es la edad mínima para obtener licencia de chofer de servicio público?',
    options: [
      '18 años',
      '25 años',
      '21 años',
      '23 años'
    ],
    correctAnswer: 2,
    explanation: 'Para obtener licencia de servicio público se debe ser mayor de 21 años según los reglamentos estatales.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-003',
    question: '¿Por qué carril deben circular los vehículos de transporte público de pasajeros?',
    options: [
      'Por el carril izquierdo',
      'Por el carril central',
      'Por el carril derecho o carriles destinados para ellos',
      'Por cualquier carril disponible'
    ],
    correctAnswer: 2,
    explanation: 'Los vehículos de transporte público de pasajeros deben circular siempre por el carril derecho o por los carriles destinados para ellos.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-004',
    question: '¿Qué documento adicional se requiere para conducir transporte público además de la licencia?',
    options: [
      'Solo la licencia es suficiente',
      'Constancia de examen psicométrico y capacitación aprobados',
      'Permiso de la SCT únicamente',
      'Certificado de preparatoria'
    ],
    correctAnswer: 1,
    explanation: 'Se requiere constancia de examen psicométrico y capacitación aprobados, además de carta de no antecedentes penales.',
    category: 'publico',
    difficulty: 'avanzado'
  },
  {
    id: 'pub-005',
    question: '¿Qué causa la cancelación inmediata de la licencia de transporte público?',
    options: [
      'Una infracción de velocidad',
      'Estacionarse en lugar prohibido',
      'Conducir bajo efectos de drogas o con cualquier cantidad de alcohol',
      'No portar el uniforme'
    ],
    correctAnswer: 2,
    explanation: 'Manejar bajo efecto de drogas o con cualquier cantidad de alcohol en sangre es causa de cancelación de licencia de transporte público.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-006',
    question: '¿Qué tipo de seguro es obligatorio para vehículos de transporte público?',
    options: [
      'Seguro contra robo',
      'Seguro de responsabilidad civil que ampare daños a usuarios y terceros',
      'Solo seguro de daños materiales',
      'Seguro de gastos médicos del conductor'
    ],
    correctAnswer: 1,
    explanation: 'Los vehículos de transporte público deben contar con póliza de seguro de responsabilidad civil vigente que ampare daños y perjuicios a usuarios o terceros.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-007',
    question: '¿Cada cuánto tiempo debe presentarse el curso de capacitación para operadores de transporte público?',
    options: [
      'Solo al obtener la licencia',
      'Cada 5 años',
      'Anualmente',
      'Cada 2 años'
    ],
    correctAnswer: 2,
    explanation: 'En algunos estados se debe presentar anualmente un curso de capacitación para renovar el gafete de operador certificado.',
    category: 'publico',
    difficulty: 'avanzado'
  },
  {
    id: 'pub-008',
    question: '¿Qué ocurre si un conductor de transporte público es sancionado dos veces con suspensión de licencia?',
    options: [
      'Multa adicional',
      'Curso obligatorio',
      'Cancelación de la licencia',
      'Amonestación escrita'
    ],
    correctAnswer: 2,
    explanation: 'Ser sancionado dos veces con suspensión de licencia es causa de cancelación definitiva de la misma.',
    category: 'publico',
    difficulty: 'avanzado'
  },
  {
    id: 'pub-009',
    question: '¿Qué examen médico es obligatorio para obtener licencia de transporte público?',
    options: [
      'Solo examen de la vista',
      'Examen de aptitud física y mental',
      'Únicamente análisis de sangre',
      'Electrocardiograma'
    ],
    correctAnswer: 1,
    explanation: 'Se requiere aprobar el examen de aptitud física y mental para obtener la licencia de transporte público.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-010',
    question: '¿Qué antigüedad máxima debe tener el comprobante de domicilio para trámites de licencia?',
    options: [
      '6 meses',
      '1 año',
      '3 meses',
      '2 meses'
    ],
    correctAnswer: 2,
    explanation: 'El comprobante de domicilio debe tener una antigüedad no mayor a 3 meses.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-011',
    question: '¿Qué documento debe presentar el aspirante a licencia de transporte público respecto a antecedentes?',
    options: [
      'Carta de recomendación',
      'Certificado de no antecedentes penales vigente',
      'Historial crediticio',
      'Acta de nacimiento únicamente'
    ],
    correctAnswer: 1,
    explanation: 'Se requiere certificado y/o constancia de no antecedentes penales vigente para obtener licencia de transporte público.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-012',
    question: '¿Qué posición ocupa el transporte público en la jerarquía de movilidad?',
    options: [
      'Primera posición',
      'Segunda posición',
      'Tercera posición',
      'Cuarta posición'
    ],
    correctAnswer: 2,
    explanation: 'El transporte público ocupa la tercera posición en la jerarquía, después de peatones y ciclistas.',
    category: 'publico',
    difficulty: 'medio'
  },
  {
    id: 'pub-013',
    question: '¿Qué sanción se aplica por proporcionar información falsa al tramitar licencia de transporte público?',
    options: [
      'Multa económica',
      'Cancelación de la licencia',
      'Curso de ética',
      'Suspensión temporal'
    ],
    correctAnswer: 1,
    explanation: 'Haber proporcionado información falsa es causa de cancelación de la licencia de transporte público.',
    category: 'publico',
    difficulty: 'avanzado'
  },
  {
    id: 'pub-014',
    question: '¿Qué tipo de licencia corresponde a conductores de taxi en el Estado de México?',
    options: [
      'Licencia tipo A',
      'Licencia tipo B',
      'Licencia tipo C',
      'Licencia tipo D'
    ],
    correctAnswer: 2,
    explanation: 'La Licencia tipo C es para conductores de transporte público de pasajeros, incluyendo taxis.',
    category: 'publico',
    difficulty: 'avanzado'
  },
  {
    id: 'pub-015',
    question: 'La tolerancia cero de alcohol también aplica a conductores de:',
    options: [
      'Solo transporte público',
      'Transporte escolar, de personal, emergencia y de carga',
      'Únicamente ambulancias',
      'Solo camiones urbanos'
    ],
    correctAnswer: 1,
    explanation: 'La tolerancia cero aplica a transporte público, escolar, de personal, vehículos de emergencia y de carga.',
    category: 'publico',
    difficulty: 'avanzado'
  },
]

// Preguntas específicas para vehículos de carga pesada
export const cargaQuestions: Question[] = [
  {
    id: 'carga-001',
    question: '¿Cuál es la velocidad máxima para tractocamiones doblemente articulados en carreteras federales?',
    options: [
      '100 km/h',
      '90 km/h',
      '80 km/h',
      '95 km/h'
    ],
    correctAnswer: 2,
    explanation: 'Los tractocamiones doblemente articulados deben estar gobernados para no exceder 80 km/h.',
    category: 'carga',
    difficulty: 'medio'
  },
  {
    id: 'carga-002',
    question: '¿Cuál es el peso bruto vehicular máximo para un tractocamión doblemente articulado (full)?',
    options: [
      '50 toneladas',
      '75.5 toneladas',
      '66.5 toneladas',
      '80 toneladas'
    ],
    correctAnswer: 2,
    explanation: 'El peso bruto vehicular para el tractocamión doblemente articulado es de 66.5 toneladas, y para el full diferenciado 75.5 toneladas.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-003',
    question: '¿Qué distancia mínima de separación deben mantener los tractocamiones doblemente articulados respecto a otros vehículos pesados?',
    options: [
      '50 metros',
      '75 metros',
      '100 metros',
      '150 metros'
    ],
    correctAnswer: 2,
    explanation: 'Los tractocamiones doblemente articulados deben circular con un mínimo de 100 metros de separación respecto de otros vehículos pesados.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-004',
    question: '¿Cuál es la longitud máxima permitida para un tractocamión-semirremolque?',
    options: [
      '20.00 metros',
      '23.00 metros',
      '25.00 metros',
      '31.00 metros'
    ],
    correctAnswer: 1,
    explanation: 'La configuración tractocamión-semirremolque tiene longitud máxima de 23.00 metros.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-005',
    question: '¿Cuál es la longitud máxima para tractocamión-semirremolque-semirremolque?',
    options: [
      '25.00 metros',
      '28.00 metros',
      '31.00 metros',
      '35.00 metros'
    ],
    correctAnswer: 2,
    explanation: 'La configuración tractocamión-semirremolque-semirremolque tiene longitud máxima de 31.00 metros.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-006',
    question: '¿Qué ocurre cuando un vehículo de carga excede el 10% del peso autorizado?',
    options: [
      'Solo se aplica multa',
      'Advertencia y continúa su camino',
      'Se impide su circulación',
      'Se reduce la carga en un 10%'
    ],
    correctAnswer: 2,
    explanation: 'Cuando un vehículo excede del 10% del peso autorizado en la norma, se impide su circulación.',
    category: 'carga',
    difficulty: 'medio'
  },
  {
    id: 'carga-007',
    question: '¿Qué sistema de seguridad es obligatorio para tractocamiones doblemente articulados?',
    options: [
      'Solo frenos de aire',
      'Sistema de ajuste automático de frenos',
      'Frenos de disco en todas las ruedas',
      'Sistema ABS únicamente'
    ],
    correctAnswer: 1,
    explanation: 'Las configuraciones doblemente articuladas deben contar con sistema de ajuste automático de frenos.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-008',
    question: '¿Cuál es el límite de alcohol para conductores de vehículos de carga?',
    options: [
      '0.8 gramos por litro',
      '0.4 gramos por litro',
      'Tolerancia cero',
      '0.5 gramos por litro'
    ],
    correctAnswer: 2,
    explanation: 'Los conductores de transporte de carga no deben presentar ninguna cantidad de alcohol en sangre o aire espirado.',
    category: 'carga',
    difficulty: 'medio'
  },
  {
    id: 'carga-009',
    question: '¿En qué tipo de carreteras pueden circular los tractocamiones doblemente articulados?',
    options: [
      'En cualquier carretera',
      'Solo en carreteras tipo "ET" y "A", y por excepción en "B" con autorización',
      'Únicamente en autopistas de cuota',
      'En carreteras estatales sin restricción'
    ],
    correctAnswer: 1,
    explanation: 'Los tractocamiones doblemente articulados solo pueden circular en caminos Tipo "ET" y "A", y por excepción en "B" con autorización especial.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-010',
    question: '¿Qué documento especial deben portar los vehículos de carga para circular?',
    options: [
      'Solo la tarjeta de circulación',
      'Constancia de capacidad y dimensiones para el traslado de carga',
      'Permiso de la policía federal',
      'Carta porte únicamente'
    ],
    correctAnswer: 1,
    explanation: 'Los vehículos de carga deben portar la constancia de capacidad y dimensiones para el traslado de carga.',
    category: 'carga',
    difficulty: 'medio'
  },
  {
    id: 'carga-011',
    question: '¿Qué requisito de iluminación tienen los tractocamiones doblemente articulados?',
    options: [
      'Luces solo de noche',
      'Luces encendidas permanentemente mediante sistema electrónico',
      'Luces intermitentes en todo momento',
      'Solo luces de posición'
    ],
    correctAnswer: 1,
    explanation: 'Los tractocamiones doblemente articulados deben contar con luces encendidas permanentemente mediante sistema electrónico instalado.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-012',
    question: '¿Qué documento de registro de horas debe llevar el conductor de vehículos de carga pesada?',
    options: [
      'Diario de viaje personal',
      'Bitácora de horas de servicio con registro de horas de conducción semanal',
      'Solo el tacógrafo',
      'Registro de combustible'
    ],
    correctAnswer: 1,
    explanation: 'Se requiere el uso de bitácora de horas de servicio donde se registren las horas de conducción semanal.',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-013',
    question: '¿Qué tipo de licencia se requiere para conducir tractocamiones y grúas?',
    options: [
      'Licencia tipo A',
      'Licencia tipo C',
      'Licencia tipo D',
      'Licencia tipo E'
    ],
    correctAnswer: 2,
    explanation: 'La Licencia tipo D es para conductores de vehículos de carga como camiones, tráileres y grúas.',
    category: 'carga',
    difficulty: 'medio'
  },
  {
    id: 'carga-014',
    question: '¿Por cuántos kilómetros máximo pueden circular vehículos extralargos en carreteras de menor clasificación que "ET"?',
    options: [
      '10 km',
      '20 km',
      '30 km',
      '50 km'
    ],
    correctAnswer: 2,
    explanation: 'Los vehículos extralargos no pueden circular por más de 30 km en carreteras de menor clasificación que tipo "ET".',
    category: 'carga',
    difficulty: 'avanzado'
  },
  {
    id: 'carga-015',
    question: '¿Cuál es la velocidad máxima para transporte de bienes y mercancías en autopistas federales?',
    options: [
      '95 km/h',
      '90 km/h',
      '80 km/h',
      '110 km/h'
    ],
    correctAnswer: 2,
    explanation: 'El límite para transporte de bienes y mercancías en carreteras y autopistas federales es de 80 km/h.',
    category: 'carga',
    difficulty: 'medio'
  },
]

// Preguntas adicionales para vehículo particular
export const particularQuestions: Question[] = [
  {
    id: 'part-001',
    question: '¿Cuál es la velocidad máxima permitida para automóviles en autopistas federales?',
    options: [
      '100 km/h',
      '120 km/h',
      '110 km/h',
      '90 km/h'
    ],
    correctAnswer: 2,
    explanation: 'El límite de velocidad para automóviles en carreteras y autopistas federales es de 110 km/h.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-002',
    question: '¿En qué posición de la jerarquía de movilidad se encuentran los vehículos particulares?',
    options: [
      'Primera posición',
      'Tercera posición',
      'Cuarta posición',
      'Quinta y última posición'
    ],
    correctAnswer: 3,
    explanation: 'Los vehículos motorizados particulares ocupan la quinta y última posición en la jerarquía de movilidad.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-003',
    question: '¿Cuál es el límite de velocidad en vías de acceso controlado urbanas?',
    options: [
      '100 km/h',
      '90 km/h',
      '80 km/h',
      '70 km/h'
    ],
    correctAnswer: 2,
    explanation: 'El límite de velocidad en vías de acceso controlado urbanas es de hasta 80 km/h.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-004',
    question: '¿Cuál es el límite de velocidad en vialidades secundarias urbanas?',
    options: [
      '50 km/h',
      '60 km/h',
      '40 km/h',
      '30 km/h'
    ],
    correctAnswer: 2,
    explanation: 'En vialidades secundarias urbanas el límite es de 40 km/h.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-005',
    question: '¿Qué información proporcionan las señales de fondo azul en vías urbanas?',
    options: [
      'Advertencias de peligro',
      'Prohibiciones de circulación',
      'Destinos y direcciones en vías urbanas',
      'Límites de velocidad'
    ],
    correctAnswer: 2,
    explanation: 'Las señales informativas de destino con fondo azul se utilizan para vías urbanas, indicando direcciones y destinos.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-006',
    question: '¿Qué debe hacer un conductor particular al aproximarse a una zona escolar?',
    options: [
      'Mantener la velocidad si no hay niños visibles',
      'Reducir velocidad a 20 km/h durante horarios escolares',
      'Solo reducir si hay semáforo',
      'Tocar el claxon para advertir'
    ],
    correctAnswer: 1,
    explanation: 'En zonas escolares se debe reducir la velocidad a 20 km/h una hora antes y después de entrada/salida de alumnos.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-007',
    question: '¿Cómo debe un conductor particular ceder el paso a vehículos de emergencia?',
    options: [
      'Detenerse inmediatamente donde esté',
      'Orillarse a la derecha y detenerse para permitir el paso',
      'Acelerar para no estorbar',
      'Cambiar de carril sin detenerse'
    ],
    correctAnswer: 1,
    explanation: 'Al escuchar sirenas de emergencia, el conductor debe orillarse a la derecha y detenerse para permitir el paso.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-008',
    question: '¿Qué debe verificar antes de rebasar a otro vehículo?',
    options: [
      'Solo el espejo retrovisor central',
      'Que no haya vehículos en el carril izquierdo, señalizar y verificar punto ciego',
      'Solo la velocidad propia',
      'Que el otro vehículo no acelere'
    ],
    correctAnswer: 1,
    explanation: 'Antes de rebasar se debe verificar que no haya vehículos en el carril izquierdo, señalizar la maniobra y verificar el punto ciego.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-009',
    question: '¿En qué circunstancia NO debe realizarse un rebase?',
    options: [
      'En rectas largas',
      'Con buena visibilidad',
      'En curvas, pendientes pronunciadas o donde no haya visibilidad',
      'En autopistas'
    ],
    correctAnswer: 2,
    explanation: 'No debe rebasarse en curvas, pendientes pronunciadas, intersecciones o donde no haya visibilidad suficiente.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-010',
    question: '¿Qué precaución debe tomar respecto a los motociclistas?',
    options: [
      'Pueden compartir su carril sin problema',
      'No privarlos de alguna parte de su carril para circular',
      'Tienen menos derechos en la vía',
      'Deben dejarlos pasar primero siempre'
    ],
    correctAnswer: 1,
    explanation: 'Los conductores no deben transitar de forma que priven al motociclista de alguna parte de su carril.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-011',
    question: '¿Qué hacer ante un semáforo en amarillo?',
    options: [
      'Acelerar para pasar antes de que cambie',
      'Detenerse si es posible hacerlo con seguridad',
      'Ignorarlo si no hay tráfico',
      'Siempre detenerse inmediatamente'
    ],
    correctAnswer: 1,
    explanation: 'El amarillo indica precaución; se debe detener si es posible hacerlo con seguridad antes de la línea de alto.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-012',
    question: '¿Qué distancia de seguimiento se recomienda mantener en condiciones normales?',
    options: [
      '1 segundo',
      '2 segundos mínimo (regla de los 2 segundos)',
      '5 metros fijos',
      'Lo más cerca posible del vehículo de adelante'
    ],
    correctAnswer: 1,
    explanation: 'Se recomienda mantener al menos 2 segundos de distancia con el vehículo de adelante en condiciones normales.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-013',
    question: '¿Qué hacer si los frenos fallan mientras conduce?',
    options: [
      'Apagar el motor inmediatamente',
      'Bombear el pedal, usar freno de mano gradualmente y buscar área segura',
      'Saltar del vehículo',
      'Chocar contra algo para detenerse'
    ],
    correctAnswer: 1,
    explanation: 'En caso de falla de frenos: bombear el pedal, reducir velocidades, usar freno de mano gradualmente y buscar un área segura.',
    category: 'particular',
    difficulty: 'avanzado'
  },
  {
    id: 'part-014',
    question: '¿Cómo afecta la lluvia la distancia de frenado?',
    options: [
      'No la afecta',
      'La reduce',
      'Puede duplicarla o más',
      'Solo afecta en autopistas'
    ],
    correctAnswer: 2,
    explanation: 'El pavimento mojado puede duplicar o más la distancia de frenado, requiriendo mayor precaución.',
    category: 'particular',
    difficulty: 'medio'
  },
  {
    id: 'part-015',
    question: '¿Cuándo debe encender las luces bajas un vehículo particular?',
    options: [
      'Solo de noche',
      'De noche, en túneles, con lluvia o condiciones de poca visibilidad',
      'Solo en carretera',
      'Únicamente al rebasar'
    ],
    correctAnswer: 1,
    explanation: 'Las luces bajas deben usarse de noche, en túneles, con lluvia, neblina o cualquier condición de visibilidad reducida.',
    category: 'particular',
    difficulty: 'medio'
  },
]

// Todas las preguntas hardcoded sin mezclar
export function getAllQuestionsRaw(): Question[] {
  return [
    ...generalQuestions,
    ...motocicletaQuestions,
    ...publicoQuestions,
    ...cargaQuestions,
    ...particularQuestions,
  ]
}

// Mezclar arrays (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Función para obtener preguntas según tipo de licencia
export function getQuestionsByLicenseType(licenseType: string, count: number = 20): Question[] {
  // Try to use admin overlay questions if available
  let allQuestions: Question[] | null = null
  if (typeof window !== 'undefined') {
    try {
      const overlay = localStorage.getItem('adminQuestions')
      if (overlay) {
        const parsed = JSON.parse(overlay) as { added: Question[]; edited: Record<string, Question>; deleted: string[] }
        if (parsed.added?.length || Object.keys(parsed.edited || {}).length || parsed.deleted?.length) {
          const raw = getAllQuestionsRaw()
          allQuestions = raw
            .filter(q => !parsed.deleted?.includes(q.id))
            .map(q => parsed.edited?.[q.id] ?? q)
            .concat(parsed.added || [])
        }
      }
    } catch { /* ignore */ }
  }

  const pool = allQuestions ?? getAllQuestionsRaw()

  // Siempre incluir preguntas generales
  const generalPool = pool.filter(q => q.category === 'general')

  // Agregar preguntas específicas según el tipo
  const category = ['motocicleta', 'particular', 'publico', 'carga'].includes(licenseType) ? licenseType : 'particular'
  const specificPool = pool.filter(q => q.category === category)

  // Tomar preguntas: 60% generales, 40% específicas
  const generalCount = Math.ceil(count * 0.6)
  const specificCount = count - generalCount

  const selectedGeneral = shuffleArray(generalPool).slice(0, generalCount)
  const selectedSpecific = shuffleArray(specificPool).slice(0, specificCount)

  return shuffleArray([...selectedGeneral, ...selectedSpecific]).slice(0, count)
}

// Función para calcular el resultado
export function calculateExamResult(answers: { questionId: string; selectedAnswer: number }[], questions: Question[]): {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  passed: boolean
  details: { question: Question; selectedAnswer: number; isCorrect: boolean }[]
} {
  let correctAnswers = 0
  const details = answers.map(answer => {
    const question = questions.find(q => q.id === answer.questionId)!
    const isCorrect = question.correctAnswer === answer.selectedAnswer
    if (isCorrect) correctAnswers++
    return { question, selectedAnswer: answer.selectedAnswer, isCorrect }
  })

  const score = Math.round((correctAnswers / questions.length) * 100)
  const passed = score >= 80 // 80% para aprobar

  return {
    totalQuestions: questions.length,
    correctAnswers,
    incorrectAnswers: questions.length - correctAnswers,
    score,
    passed,
    details
  }
}
