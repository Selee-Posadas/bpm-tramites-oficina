# BPM de Trámites de Oficina — Plataforma Integral de Gestión

> Solución empresarial para la gestión y orquestación de trámites internos y externos, desarrollada bajo Clean Architecture, Domain-Driven Design (DDD), TypeScript estricto, NestJS con Fastify, Prisma ORM, PostgreSQL y Next.js 19 con Material UI.

---

## 1. Circuitos Soportados

El sistema implementa tres circuitos disjuntos según especificación contractual:
1. **Externo → Interno**: Trámite iniciado por un ciudadano u organización externa, revisado por Mesa de Entrada, procesado por operadores internos, susceptible a observaciones y respuestas, con dictamen de aprobación/rechazo y cierre.
2. **Interno → Interno**: Trámite iniciado por un área interna con destino a otra área, susceptible a derivaciones sucesivas entre áreas organizacionales con trazabilidad completa de intervinientes.
3. **Interno → Externo**: Trámite iniciado por un empleado interno que requiere la intervención obligatoria de un externo (`ESPERANDO_EXTERNO`), quien responde o aporta documentación (`ESPERANDO_INTERNO`), reanudando el circuito interno.

---

## 2. Stack Tecnológico

| Capa | Tecnologías Principales |
|---|---|
| **Frontend** | React 19, Next.js (App Router), TypeScript, Material UI (MUI), Formik, Yup, React Context, Vitest |
| **Backend** | Node.js, NestJS, Fastify Adapter, Prisma ORM, PostgreSQL, Passport/JWT, Jest |
| **Arquitectura** | Clean Architecture, DDD, Casos de Uso atómicos, Invariantes en Dominio, Puertos y Adaptadores |
| **Infraestructura** | Docker Compose, Dockerfiles multi-stage, PostgreSQL 16 |
| **Control de Calidad** | ESLint, Prettier, Husky, Lint-Staged, Conventional Commits |

---

## 3. Puesta en Marcha con Docker

El proyecto se encuentra preparado para levantarse con un único comando:

```bash
# 1. Clonar el repositorio y configurar variables de entorno
cp .env.example .env

# 2. Levantar los contenedores (Base de datos PostgreSQL, Backend API Fastify y Frontend Next.js)
docker compose up -d --build
```

### URLs de Acceso a Servicios
- **Portal Web (Frontend)**: [http://localhost:3000](http://localhost:3000)
  - **Portal Interno**: [http://localhost:3000/interno/login](http://localhost:3000/interno/login)
  - **Portal Externo**: [http://localhost:3000/externo/login](http://localhost:3000/externo/login)
- **API Backend (Fastify)**: [http://localhost:3001/api](http://localhost:3001/api)
- **Documentación Swagger / OpenAPI**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Healthcheck**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 4. Comandos de Base de Datos (Migraciones y Seeds)

Para ejecutar migraciones o poblar los datos de prueba:

```bash
# Ejecutar migraciones de Prisma
pnpm prisma:migrate

# Ejecutar seed determinístico
pnpm prisma:seed
```

---

## 5. Credenciales de Prueba (Seeds)

Los datos de seed incluyen los perfiles requeridos para evaluar todos los flujos y restricciones:

### Usuarios Internos (Portal Interno)
| Rol | Email | Contraseña / Mock Auth | Área Asignada | Permisos Clave |
|---|---|---|---|---|
| **ADMIN** | `admin@bpm.local` | `Admin123!` | Dirección General | Acceso y configuración total |
| **MESA_ENTRADA** | `mesa@bpm.local` | `Mesa123!` | Mesa de Entrada | Revisión inicial de trámites externos |
| **OPERADOR** | `operador.legales@bpm.local` | `Operador123!` | Asuntos Jurídicos | Toma y procesamiento de trámites de su área |
| **SUPERVISOR** | `supervisor.legales@bpm.local` | `Supervisor123!` | Asuntos Jurídicos | Reasignación de trámites de su área |
| **AUDITOR** | `auditor@bpm.local` | `Auditor123!` | Auditoría General | Solo lectura de todos los trámites e historiales |

### Usuarios Externos (Portal Externo)
| Tipo | Email | Contraseña | Organización | Estado |
|---|---|---|---|---|
| Proveedor | `proveedor@empresa-a.com` | `Externo123!` | Suministros Industriales S.A. | ACTIVO |
| Ciudadano | `juan.perez@email.com` | `Externo123!` | Particular | ACTIVO |
| Solicitante | `contacto@consultora.com` | `Externo123!` | Consultores Asociados | ACTIVO |

---

## 6. Ejecución de Tests

```bash
# Tests Unitarios de Backend (Jest - Dominio, Reglas de Workflow, SLA, Permisos)
pnpm test:backend

# Tests de Integración de Backend (Jest - Auth, Flujos completos, Concurrencia al tomar trámite)
pnpm test:backend:e2e

# Tests de Frontend (Vitest - Formularios Formik/Yup, Bandeja, Timeline, Guards)
pnpm test:frontend

# Ejecución de todos los tests del monorepo
pnpm test
```

---

## 7. Endpoints Principales de la API (`/api`)

### Autenticación y Perfil
- `POST /api/auth/external/register` — Registro de usuario externo
- `POST /api/auth/external/login` — Login y emisión de JWT externo
- `POST /api/auth/external/logout` — Invalidación de sesión
- `GET /api/auth/me` — Perfil del usuario autenticado
- `GET /api/auth/internal/me` — Perfil de usuario interno (Azure Entra ID / Mock)

### Trámites y Workflow
- `GET /api/tramites` — Listado con filtros (estado, área, prioridad, fechas, SLA)
- `GET /api/tramites/:id` — Detalle exhaustivo con movimientos y comentarios
- `POST /api/tramites` — Creación de nuevo trámite
- `PUT /api/tramites/:id` — Modificación en estado borrador
- `DELETE /api/tramites/:id` — Eliminación de trámite en borrador
- `POST /api/tramites/:id/ingresar` — Pasa trámite de BORRADOR a INGRESADO
- `POST /api/tramites/:id/tomar` — Toma atómica de trámite con lock pesimista
- `POST /api/tramites/:id/asignar` — Reasignación (solo Supervisor/Admin)
- `POST /api/tramites/:id/derivar` — Derivación a otra área (Interno-Interno)
- `POST /api/tramites/:id/observar` — Observar trámite
- `POST /api/tramites/:id/responder-observacion` — Externo responde observación
- `POST /api/tramites/:id/solicitar-intervencion-externa` — Solicitud a externo
- `POST /api/tramites/:id/responder-intervencion-externa` — Respuesta de externo
- `POST /api/tramites/:id/aprobar` — Dictamen favorable
- `POST /api/tramites/:id/rechazar` — Rechazo formal con fundamentación
- `POST /api/tramites/:id/cerrar` — Cierre final tras aprobación/rechazo/cancelación
- `POST /api/tramites/:id/cancelar` — Cancelación del trámite

### Documentos, Comentarios, Configuración y Dashboard
- `POST /api/tramites/:id/documentos` / `GET /api/tramites/:id/documentos` — Gestión documental
- `POST /api/tramites/:id/comentarios` / `GET /api/tramites/:id/comentarios` — Comentarios con visibilidad
- `GET /api/tipos-tramite` / `POST /api/tipos-tramite` — Catálogo de tipos de trámite
- `GET /api/areas` / `POST /api/areas` — Catálogo de áreas organizacionales
- `GET /api/dashboard` — Métricas operativas (SLA, estados, orígenes, áreas, últimos movimientos)

---

## 8. Supuestos Funcionales y de Arquitectura

1. **Aislamiento de Identidades**: Se asume que un usuario interno nunca puede autenticarse ni actuar por los canales de un usuario externo, y viceversa. Los tokens JWT y cookies de sesión operan con claves y claims independientes.
2. **Numeración de Trámites**: Cada trámite posee un código de negocio único e inmutable generado automáticamente con formato `TRM-YYYYMMDD-[CORRELATIVO]` (ej: `TRM-20260905-0001`).
3. **Cálculo de SLA**: Se computa en horas calendario corridas o laborales a partir de la fecha de creación del trámite. La alerta visual se dispara cuando `ahora > fechaCreacion + slaHoras`.
4. **Almacenamiento de Documentos**: En entorno Docker local se utiliza almacenamiento en volumen local montado con metadata registrada en base de datos. En producción, se mapea directamente al adaptador de Amazon S3 con URLs prefirmadas.
5. **Auditoría Append-Only**: Bajo ninguna circunstancia se permite modificar o eliminar un registro de la tabla `movimientos_tramite`.

---

## 9. Documentación Adicional
- [Matriz de Trazabilidad (100 Puntos)](docs/TRACEABILITY_MATRIX.md)
- [Registro de Decisiones Arquitectónicas (ADR)](docs/DECISION_LOG.md)
- [Guía de Operación en Producción](docs/PRODUCTION_NOTES.md)
- [Propuesta de Arquitectura en AWS](docs/AWS_DEPLOYMENT.md)
- [Reglas Maestras para Agentes (AGENTS.md)](AGENTS.md)
