# Portal Simulador de Licencias de Conducir - Tlaxcala

## Resumen

Portal web oficial para agendar citas en el simulador de manejo para obtener licencias de conducir en el Estado de Tlaxcala. Permite a los ciudadanos realizar exámenes teóricos, agendar citas, recibir códigos QR de confirmación y consultar resultados de sus pruebas.

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **UI Components:** Radix UI (Label, Select, Slot)
- **Iconos:** Lucide React
- **QR Codes:** qrcode
- **Utilidades:** date-fns, clsx, tailwind-merge, class-variance-authority

## Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx           # Landing page principal
│   ├── layout.tsx         # Layout raíz con metadata
│   ├── globals.css        # Estilos globales
│   ├── examen/            # Examen teórico de conocimientos
│   ├── agendar/           # Flujo de agendamiento de citas
│   ├── confirmacion/      # Página de confirmación con QR
│   └── resultados/        # Consulta de resultados
├── components/
│   └── ui/                # Componentes reutilizables
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Label.tsx
│       └── Select.tsx
├── lib/
│   ├── utils.ts           # Utilidades (cn, formatDate, generateAppointmentCode)
│   └── examQuestions.ts   # Pool de preguntas para exámenes
public/
├── Flower-logo.svg        # Logo flor Tlaxcala
├── Flower-pattern.png     # Patrón decorativo
├── Tlaxcala-logo.svg      # Logo gobierno
└── Segob-logo.svg         # Logo SEGOB
```

## Funcionalidades

### 1. Examen Teórico (`/examen`)
Sistema de evaluación de conocimientos sobre leyes de tránsito:
- **20 preguntas** de opción múltiple por examen
- **30 minutos** de tiempo límite
- **80%** de aciertos para aprobar
- Preguntas específicas por tipo de licencia:
  - 60% preguntas generales (aplican a todos)
  - 40% preguntas específicas del tipo de licencia
- Categorías de preguntas:
  - Jerarquía de movilidad
  - Límites de velocidad (zonas escolares, urbanas, carreteras)
  - Señales de tránsito (preventivas, restrictivas, informativas)
  - Alcoholímetro y sanciones
  - Documentos y seguros obligatorios
  - Reglas específicas por tipo de vehículo
- Niveles de dificultad: medio y avanzado
- Revisión de respuestas con explicaciones al finalizar

### 2. Agendamiento de Citas (`/agendar`)
Flujo de 3 pasos:
1. Selección de tipo de licencia (Motocicleta, Particular, Transporte Público, Carga Pesada)
2. Selección de fecha y hora (calendario interactivo, horarios de 9:00-17:00, L-V)
3. Captura de datos personales (nombre, email)

### 3. Confirmación (`/confirmacion`)
- Genera código QR único para la cita
- Muestra resumen de la cita agendada
- Almacena citas en localStorage (demo)

### 4. Consulta de Resultados (`/resultados`)
- Búsqueda por código de cita
- Visualización del estado de la prueba

## Base Legal de las Preguntas

Las preguntas del examen están basadas en:
- **Ley de Movilidad y Seguridad Vial del Estado de Tlaxcala** (2024)
- **Reglamento de la Ley de Movilidad y Seguridad Vial del Estado de Tlaxcala** (2025)
- **Reglamento de Tránsito en Carreteras y Puentes de Jurisdicción Federal**
- **Ley General de Movilidad y Seguridad Vial** (Federal)
- **NOM-012** sobre pesos y dimensiones de vehículos de carga

### Temas Cubiertos por Tipo de Licencia

| Tipo | Temas Específicos |
|------|-------------------|
| Motocicleta | Casco certificado, circulación entre carriles, equipo de protección, límites de alcohol |
| Particular | Velocidades urbanas, señalización, técnicas de manejo seguro |
| Transporte Público | Tolerancia cero alcohol, requisitos de licencia, capacitación, responsabilidad civil |
| Carga Pesada | Pesos y dimensiones, bitácoras, velocidades máximas, tipos de carreteras |

## Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## Paleta de Colores

Definida en `tailwind.config.ts`:
- **Primary:** Púrpura (#582672) - Color institucional de Tlaxcala
- **Accent:** Tonos púrpura complementarios
- Variantes: 50-900 para primary

## Convenciones de Código

- Componentes UI en `src/components/ui/` con pattern de class-variance-authority
- Usar `cn()` de `@/lib/utils` para merge de clases Tailwind
- Páginas usan `'use client'` solo cuando necesitan interactividad
- Formularios con validación básica HTML5 + estados controlados
- Suspense boundaries para componentes que usan `useSearchParams`

## Notas de Desarrollo

### Almacenamiento
Actualmente usa `localStorage` para persistir citas (demo). En producción requiere:
- Backend API para gestión de citas y resultados de exámenes
- Base de datos para almacenamiento persistente
- Sistema de autenticación

### Pool de Preguntas
Ubicado en `src/lib/examQuestions.ts`:
- ~75 preguntas totales divididas en categorías
- Función `getQuestionsByLicenseType()` para obtener preguntas aleatorias
- Función `calculateExamResult()` para calcular resultados
- Fácil de extender agregando más preguntas al array correspondiente

### Códigos QR
Generados con la librería `qrcode`. El código de cita sigue formato: `TLX-XXXXXX` (6 caracteres alfanuméricos).

### Calendario
- Excluye fines de semana
- No permite fechas pasadas
- Navegación mensual

### Responsive
- Mobile-first design
- Grid adaptativo para tipos de licencia y horarios
- Header simplificado en móvil

## Flujo del Usuario

```
1. Examen Teórico → 2. Agendar Cita → 3. Recibir QR → 4. Prueba en Simulador → 5. Consultar Resultados
```

## Contexto del Proyecto

Este portal es parte del proyecto más amplio del Simulador de Movimiento 2DOF, donde el hardware del simulador físico (motores NEMA 34, drivers CL86Y, control ESP32) se combina con este portal web para gestionar las citas de ciudadanos que realizarán sus pruebas de manejo.

## TODO

- [ ] Integración con backend real (API REST)
- [ ] Sistema de notificaciones por email
- [ ] Panel administrativo para gestión de citas
- [ ] Integración con sistema de resultados del simulador
- [ ] Autenticación de usuarios
- [ ] Validación de CURP/INE
- [ ] Persistencia de resultados de exámenes
- [ ] Certificado digital de aprobación del examen teórico
- [ ] Estadísticas de preguntas más falladas
- [ ] Modo práctica (sin tiempo límite)
