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

# Regenerar el changelog manualmente (ya corre como prebuild + predev)
npm run changelog:build
```

## Versionado y Releases (git tag → CI/CD)

**Source of truth = git tags `vX.Y.Z`.** El campo `version` de `package.json` queda como `0.0.0-managed-by-git-tag` y se ignora; la versión visible en el portal viene del tag más reciente.

### Cortar un release

```bash
# Patch: bug fixes (v1.0.0 → v1.0.1)
git tag -a v1.0.1 -m "fix(admin): ..."

# Minor: features compatibles (v1.0.0 → v1.1.0)
git tag -a v1.1.0 -m "feat: ..."

# Major: breaking changes (v1.0.0 → v2.0.0)
git tag -a v2.0.0 -m "BREAKING: ..."

git push origin v1.0.1   # CI/CD detecta el tag y deploya
```

### Cómo se construye el changelog

- `scripts/build-changelog.mjs` corre como `prebuild` y `predev`. Lee `git tag` + `git log` y genera `src/data/changelog.generated.ts` (commiteado al repo).
- Commits posteriores al tag más reciente aparecen como **"Próxima versión"** (sin tag) en `/admin/changelog`.
- Para curar el título y los highlights de una versión, agregar la entrada en `src/data/changelog-highlights.ts` (manual, opcional, key = `"1.0.1"`).
- La página vive en `/admin/changelog`; el sidebar muestra la versión actual abajo y enlaza a la página.
- Sólo se incluyen commits sin merge (`--no-merges`) para evitar ruido de PRs.

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

### Estrategia de renderizado (SSR-first)

Rutas públicas y formularios del flujo ciudadano son **server components** con islas cliente aisladas. Nuevas páginas deben seguir este patrón.

- **`/` (landing)**: server component prerenderizado estático. Islas cliente en `src/components/landing/`:
  - `ScrollReveal` — wrapper con `data-revealed` (cascada CSS a `.animate-on-scroll` descendientes server-rendered).
  - `FaqAccordion` — accordion interactivo.
  - `LandingSessionGate` — redirect `/ → /portal` si hay sesión Cognito + banner de trámite activo.
- **`/portal/tipo-licencia`**: server component estático. Tarjetas son `<Link href="/portal/solicitud?tipo={id}">` — **no** `onClick + sessionStorage`.
- **`/portal/solicitud`**: server component dinámico. Valida `searchParams.tipo` y `redirect()` sin flash si inválido. Pasa `licenseType` al form cliente (`SolicitudForm.tsx`).
- **`/portal/layout.tsx`**: server component con `metadata` (robots:noindex). Auth gate extraído a `src/components/portal/PortalAuthGate.tsx` como isla cliente.
- **Resto de `/portal/*`** (dashboard, examen, agendar, perfil, historial, confirmacion, verificacion, foto): siguen `'use client'` porque Amplify guarda tokens en localStorage y requieren sesión. SSR completo requeriría migrar auth a cookies HTTP-only (no priorizado).
- **`loading.tsx`, `error.tsx`, `not-found.tsx`** en `src/app/portal/` dan skeleton/error/404 UI para el segmento ciudadano.

**Reglas al agregar rutas nuevas:**

1. **Estado entre páginas → URL query params**, no `sessionStorage` ni `localStorage`. Query params son deep-linkable, server-readable y sobreviven refresh.
2. **Constantes estáticas (FAQs, labels, costos, pasos)**: extraerlas a `src/lib/landing-content.ts` o similares para que server components las consuman sin `'use client'`.
3. **Metadata**: cada ruta server-rendered debe exportar `metadata` o `generateMetadata` para SEO. Rutas autenticadas llevan `robots: { index: false }`.
4. **Animaciones CSS con `animate-on-scroll`**: envolver en `<ScrollReveal>` (el selector `[data-revealed="true"] .animate-on-scroll` en `globals.css` cascadea a hijos server-rendered, así el HTML server sigue siendo el ground truth).

### Data fetching en `/admin/*` (TanStack Query v5)

- **Nunca** usar `useEffect(() => fetch())` en páginas admin. Siempre `useQuery` vía los hooks en:
  - `src/lib/admin-queries.ts` (endpoints `/admin/*`)
  - `src/lib/iot-queries.ts` (endpoints `/admin/iot/*`)
  - `src/lib/simulator-queries.ts` (endpoints `/admin/simulators`, `/admin/pcs`, `/admin/pcs/{pcId}/logs`, `/admin/unity-builds`)
- Query keys centralizadas en cada archivo (`adminKeys`, `iotKeys`, `simulatorKeys`) — nunca hard-codear keys en una página.
- Tras una mutation, invalidar con `queryClient.invalidateQueries({ queryKey: ... })`. Evitar `reload()` manual.
- Listados paginados: `placeholderData: keepPreviousData` para no mostrar blank state al filtrar.
- Polling: `refetchInterval`, no `setInterval`.
- Para un query nuevo: agregarlo al archivo correspondiente + agregarlo a la función `usePrefetch*()` si la ruta está en el Sidebar.
- El provider `<AdminQueryProvider>` vive en `admin/layout.tsx` después del gate de auth — páginas fuera de `/admin/*` no tienen acceso a la caché admin.

### Code splitting

- Route-level es automático por App Router. No hace falta `next/dynamic` para componentes que sólo se usan en una ruta.
- Usar `next/dynamic` cuando: (1) el componente es pesado y sólo se renderiza tras interacción (tabs, modales), o (2) queremos que el resto de la página aparezca primero (caso `/admin/metrics` con recharts extraído a `MetricsCharts.tsx`).

## Notas de Desarrollo

### Almacenamiento
- Tokens de sesión: Amplify v6 los guarda en localStorage (citizen pool y admin pool, `configureAmplifyForPool()`).
- Estado de trámite: DynamoDB vía API (`citizen-api.ts`). No usar `localStorage` para datos de trámite.
- Estado transitorio UI entre páginas (p.ej. tipo de licencia seleccionado): **URL query params**, no `sessionStorage` (ver Estrategia de renderizado).
- `sessionStorage.currentTramiteId` es el único uso de session storage activo (puente post-solicitud → examen); migrable a query param si se necesita SSR en `/portal/examen`.

### Pool de Preguntas
Ubicado en `src/lib/examQuestions.ts`:
- ~75 preguntas totales divididas en categorías
- Función `getQuestionsByLicenseType()` para obtener preguntas aleatorias
- Función `calculateExamResult()` para calcular resultados
- Fácil de extender agregando más preguntas al array correspondiente

### Códigos QR
Generados con la librería `qrcode`. El código de cita sigue formato: `TLX-NNNNNN` (6 dígitos numéricos). El simulador Unity acepta los 6 dígitos directamente y reconstruye el `TLX-` en el backend (`simulator-lookup.ts` consulta por primary key).

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

- [x] Integración con backend real (API REST) — Cognito + API Gateway + DynamoDB
- [x] Panel administrativo para gestión de citas — `/admin/*`
- [x] Autenticación de usuarios — Cognito dual pool
- [x] Persistencia de resultados de exámenes — DynamoDB
- [ ] Sistema de notificaciones por email
- [ ] Integración con sistema de resultados del simulador
- [ ] Validación de CURP/INE
- [ ] Certificado digital de aprobación del examen teórico
- [ ] Estadísticas de preguntas más falladas
- [ ] Modo práctica (sin tiempo límite)
- [ ] SSR con datos autenticados (requiere migrar Amplify a cookies HTTP-only)
