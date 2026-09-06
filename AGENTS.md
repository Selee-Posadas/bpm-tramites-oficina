# AGENTS.md — Reglas Maestras de Desarrollo y Arquitectura

> Este documento es la guía normativa obligatoria para cualquier agente o desarrollador que trabaje en este repositorio. Cualquier cambio debe adherirse estrictamente a estas especificaciones.

---

## 1. PRINCIPIOS GENERALES Y ESTILO DE CÓDIGO
- **Clean Architecture & Domain-Driven Design (DDD)**: Separación estricta de responsabilidades en capas concéntricas con regla de dependencias hacia adentro.
- **Tipado Estricto en TypeScript**: PROHIBIDO terminantemente el uso de `any`. Toda entidad, value object, contrato, DTO y respuesta de API debe contar con tipos rigurosos y exhaustivos.
- **KISS, DRY, SOLID**: Clases y funciones con responsabilidad única, cohesión alta y bajo acoplamiento.
- **Invariantes Protegidos en Dominio**: Las reglas de negocio se ejecutan y validan en el dominio, nunca en controllers ni en componentes de UI.

---

## 2. BACKEND: NESTJS + FASTIFY + PRISMA + POSTGRESQL

### Estructura de Capas por Módulo
Cada feature o bounded context en backend debe estructurarse obligatoriamente en:
```text
src/modules/[feature]/
├── domain/                  # Entidades puras, Value Objects, Enums, Interfaces de Repositorio (Puertos), Domain Services
├── application/             # Casos de Uso (un caso de uso por acción operativa)
├── infrastructure/          # Controllers (Fastify), Adaptadores Prisma (implementando puertos), Mappers bidireccionales, Guards
└── dto/                     # DTOs validados con class-validator y class-transformer (whitelist: true)
```

### Reglas Críticas de Backend
1. **Desacoplamiento de Prisma**:
   - El dominio NUNCA debe importar `@prisma/client` ni decorators de persistencia.
   - Las interfaces de repositorios (`ports`) residen en `domain/`.
   - Las implementaciones concretas residen en `infrastructure/repositories/`.
   - Se debe implementar un mapper explícito bidireccional (`[Feature]Mapper`) entre el modelo de dominio y el modelo de datos de Prisma.
2. **Controladores Delgados**:
   - Los controladores Fastify solo reciben el request, validan el DTO estructural, extraen el usuario autenticado del request context, ejecutan el caso de uso y transforman el resultado en respuesta HTTP. No contienen lógica de negocio ni transiciones.
3. **Manejo Canónico de Excepciones**:
   - `401 Unauthorized`: Token inválido, expirado o no provisto.
   - `403 Forbidden`: Usuario sin rol necesario o usuario externo intentando acceder a trámites que no le pertenecen.
   - `404 Not Found`: Recurso inexistente (trámite, área, tipo de trámite, documento, usuario).
   - `422 Unprocessable Entity`: Violación de reglas de negocio, transiciones inválidas o precondiciones de workflow no cumplidas.
   - Filtro global de excepciones que captura DomainExceptions y las mapea al código HTTP correspondiente.
4. **Transaccionalidad y Auditoría Atómica**:
   - Toda transición de estado o modificación de trámite debe ejecutarse dentro de una transacción (`prisma.$transaction`).
   - Cada transición registra obligatoriamente un `MovimientoTramite` inmutable con estado anterior, estado nuevo, áreas, usuario y acción.
5. **Concurrencia en `TOMAR_TRAMITE`**:
   - Debe evitar race conditions cuando múltiples operadores intentan tomar el mismo trámite en simultáneo.
   - Implementar control de concurrencia mediante transacción con bloqueo pesimista (`SELECT ... FOR UPDATE` en PostgreSQL) o conditional update atómico con verificación de versión/estado no asignado.

---

## 3. AUTENTICACIÓN Y AUTORIZACIÓN

### Desacoplamiento de Identidades
- **Portal Interno**:
  - Usuarios internos autenticados vía Azure Entra ID / MSAL.
  - En entorno de desarrollo local: Mock autenticado seguro documentado que emula los tokens JWT y claims de Entra ID (`roles`, `oid`, `email`).
  - Roles internos: `ADMIN`, `MESA_ENTRADA`, `OPERADOR`, `SUPERVISOR`, `AUDITOR`.
- **Portal Externo**:
  - Usuarios externos con autenticación propia (Email + Password con hash Argon2/Bcrypt o Magic Link).
  - Emisión de JWT propio para externos (`role: EXTERNAL`, `sub: usuarioExternoId`).
- **Aislamiento Total**:
  - Guards independientes: `InternalAuthGuard` y `ExternalAuthGuard`.
  - Prohibido compartir endpoints protegidos sin guard específico. Es imposible usar un token externo para ejecutar operaciones internas y viceversa.
  - El usuario externo solo puede acceder a trámites donde participe (`usuarioExternoId == user.id` o `creadoPorId == user.id`).

---

## 4. FRONTEND: NEXT.JS 19 + MATERIAL UI + FORMIK + YUP

### Estructura Modular por Features (Clean Frontend)
El frontend se organiza en dos portales independientes:
```text
src/
├── app/
│   ├── (externo)/externo/   # Vistas y layouts del Portal Externo
│   └── (interno)/interno/   # Vistas y layouts del Portal Interno
├── features/[feature]/
│   ├── actions/             # Llamadas HTTP con cliente base (Axios / Fetch tipado)
│   ├── adapters/            # Mappers puros que convierten DTOs de API a Modelos de UI
│   ├── components/          # Componentes de presentación desacoplados de llamadas directas a red
│   ├── hooks/               # Custom hooks con estado y consumo de actions
│   └── interfaces/          # [feature].api.interface.ts y [feature].interface.ts
└── shared/                  # Componentes comunes, layouts, theme MUI, utils
```

### Reglas Críticas de Frontend
1. **No Declarar Interfaces en Componentes**: Las interfaces deben residir en `interfaces/`.
2. **Formularios Estrictos**: Manejo exclusivo mediante Formik + Yup, con feedback visual accesible (`htmlFor`, `id`, `aria-label`).
3. **Directiva `'use client'`**: Obligatoria en componentes interactivos, formularios y layouts con estado.
4. **Experiencia Operacional & UX**:
   - Loading skeletons y spinners.
   - Empty states explicativos.
   - Error boundaries y alertas.
   - Snackbar / Toast para notificaciones de éxito y error.
   - Diálogos de confirmación para acciones críticas (Aprobar, Rechazar, Cancelar, Derivar).
   - Timeline visual interactivo de movimientos y comentarios.
   - Badges para Estados, Prioridades y alertas de SLA vencido.

---

## 5. WORKFLOW Y MÁQUINA DE ESTADOS

El sistema opera bajo 3 circuitos con una máquina de estados determinística:
1. **Externo → Interno**:
   `BORRADOR` → `INGRESADO` → `EN_REVISION` → `OBSERVADO` → `INGRESADO` → `EN_REVISION` → `APROBADO` / `RECHAZADO` → `CERRADO`
2. **Interno → Interno**:
   `BORRADOR` → `INGRESADO` → `EN_REVISION` → `DERIVADO` → `EN_REVISION` → `APROBADO` / `RECHAZADO` → `CERRADO`
3. **Interno → Externo**:
   `BORRADOR` → `INGRESADO` → `ESPERANDO_EXTERNO` → `ESPERANDO_INTERNO` → `EN_REVISION` → `APROBADO` / `RECHAZADO` → `CERRADO`

### Invariantes del Workflow
- Ningún trámite en `BORRADOR` puede ser aprobado ni rechazado.
- Solo se puede `CERRAR` un trámite que se encuentre en `APROBADO`, `RECHAZADO` o `CANCELADO`.
- Solo `SUPERVISOR` y `ADMIN` pueden reasignar trámites de un área.
- `AUDITOR` solo tiene permisos de lectura (`GET`), no puede ejecutar mutaciones ni transiciones.
- Comentarios con visibilidad `INTERNA` nunca deben ser devueltos en consultas de usuarios externos.

---

## 6. TESTING & CONTROL DE CALIDAD
- **Backend (Jest)**:
  - Unit tests de transiciones de estados, cálculo de SLA, reglas de negocio y guards de permisos.
  - Integration tests contra PostgreSQL real (Docker/test DB) para auth, creación, toma concurrente de trámites, visibilidad de comentarios y control de acceso 403.
- **Frontend (Vitest)**:
  - Tests unitarios y de integración de componentes: formularios Formik/Yup, renderizado de errores, visualización de timeline, guards de navegación.
- **Definición de Terminado (DoD)**:
  - El código compila sin errores.
  - Pasa validación de `tsc` (typecheck estricto).
  - Pasa `eslint` y `prettier`.
  - Pasa suite de tests automatizados.
  - Está registrado y actualizado en `docs/TRACEABILITY_MATRIX.md`.

---

## 7. CONVENCIONES DE GIT
- Commits atómicos siguiendo Conventional Commits:
  - `feat(...)`: Nueva funcionalidad.
  - `fix(...)`: Corrección de bugs.
  - `test(...)`: Incorporación o mejora de tests.
  - `refactor(...)`: Cambios estructurales sin modificar comportamiento.
  - `docs(...)`: Documentación técnica.
  - `chore(...)`: Configuración, dependencias, tooling.
