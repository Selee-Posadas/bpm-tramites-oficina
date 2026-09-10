# Registro de Pull Requests y Flujo de Ramas (Git Workflow)

Este documento formaliza y registra los Pull Requests (PRs) desarrollados a lo largo del ciclo de vida del proyecto **BPM Trámites de Oficina**, siguiendo la convención de ramas temáticas (*Feature Branch Workflow*), *Conventional Commits* y los lineamientos del documento contractual.

---

## PR #1: `feat/auth-internal-external` — Arquitectura de Autenticación Dual y Aislamiento de Identidades

- **Rama Origen**: `feat/auth-internal-external`
- **Rama Destino**: `main`
- **Estado**: `Merged`

### 1. Qué se hizo
- Implementación del subsistema de doble autenticación completamente desacoplada:
  - **Portal Interno**: Autenticación corporativa mockeable compatible con Azure Entra ID / OIDC, con soporte estricto para los 5 roles (`ADMIN`, `MESA_ENTRADA`, `OPERADOR`, `SUPERVISOR`, `AUDITOR`).
  - **Portal Externo**: Autenticación propia mediante Email + Password hasheado con Argon2/Bcrypt y emisión de JWT propio para ciudadanos y proveedores (`role: EXTERNAL`, `sub: id`).
- Guards independientes de seguridad y RBAC: `InternalAuthGuard`, `ExternalAuthGuard`, `RolesGuard` y `TramiteOwnershipGuard`.
- Almacenamiento seguro de tokens exclusivamente en cookies HttpOnly con flags `SameSite=Lax` y `Secure`, erradicando terminantemente el uso de `localStorage`.
- Prevención de fuga de información (*information leakage*): respuestas HTTP 401 y 403 totalmente opacas hacia el cliente, combinadas con logging interno de seguridad (`logger.warn`) registrando `userId`, `rol` y causal de rechazo.

### 2. Por qué
- Requisito contractual fundamental de seguridad: desacoplar tajantemente las identidades del público general de los operadores del organismo. Un compromiso de credenciales en el portal externo jamás debe vulnerar el portal interno ni viceversa. Las cookies HttpOnly mitigan ataques de robo de sesión vía XSS.

### 3. Cómo se probó
- **Backend (Jest)**:
  - `test/unit/auth-guards.spec.ts` (10 tests): validación de bloqueo con 403 ante roles insuficientes, rechazo de tokens externos en portal interno y verificación de pertenencia en `TramiteOwnershipGuard`.
  - `test/unit/auth-services.spec.ts` (5 tests): validación de hashing con salting, verificación de credenciales y generación de JWT con claims OIDC.
- **Frontend (Vitest)**:
  - `frontend/test/cookies.spec.ts` (3 tests): validación de lectura/escritura segura de cookies sin tocar `localStorage`.
- **Manual / Exploratorio**: Verificación en navegador del bloqueo y redirección automática hacia `/interno/login` o `/externo/login` al intentar acceder a rutas protegidas sin credenciales.

### 4. Trade-offs
- En lugar de forzar una dependencia directa con un tenant real de Microsoft Azure (que requeriría cuentas corporativas pagas y configuraciones de Azure AD no portables para los evaluadores locales), se diseñó un **Mock OIDC documentado** en `AuthInternalService`. Cumple con los mismos contratos de claims (`oid`, `roles`, `email`) y permite levantar el sistema de forma 100% autónoma y reproducible.

---

## PR #2: `feat/backend-workflow-domain` — Corazón de Dominio, Máquinas de Estado y Casos de Uso

- **Rama Origen**: `feat/backend-workflow-domain`
- **Rama Destino**: `main`
- **Estado**: `Merged`

### 1. Qué se hizo
- Modelado de Domain-Driven Design (DDD) y Clean Architecture puro:
  - Aggregate Root `Tramite`, entidades `TipoTramite`, `Area`, `UsuarioInterno`, `UsuarioExterno`, `MovimientoTramite`, `DocumentoTramite` y `ComentarioTramite`.
  - 3 máquinas de estados determinísticas implementando la interfaz `ITramiteWorkflow`:
    1. **Externo → Interno**: `BORRADOR` → `INGRESADO` → `EN_REVISION` → `OBSERVADO` → `INGRESADO` → `EN_REVISION` → `APROBADO` / `RECHAZADO` → `CERRADO`.
    2. **Interno → Interno**: `BORRADOR` → `INGRESADO` → `EN_REVISION` → `DERIVADO` → `EN_REVISION` → `APROBADO` / `RECHAZADO` → `CERRADO`.
    3. **Interno → Externo**: `BORRADOR` → `INGRESADO` → `ESPERANDO_EXTERNO` → `ESPERANDO_INTERNO` → `EN_REVISION` → `APROBADO` / `RECHAZADO` → `CERRADO`.
- Protección de invariantes en dominio: prohibición de aprobar/rechazar trámites en `BORRADOR`, cierre permitido únicamente sobre estados conclusivos (`APROBADO`, `RECHAZADO`, `CANCELADO`) y validación de `permiteInicioExterno`.
- Servicio de dominio `SlaCalculatorService` para cálculo y semaforización dinámica de SLA (en término, próximo a vencer y vencido).
- Casos de uso atómicos en `application/use-cases/` para cada acción de workflow y consulta.

### 2. Por qué
- El workflow es el núcleo del negocio del BPM. Encapsular la lógica de transiciones e invariantes dentro del dominio puro (sin ninguna dependencia de NestJS, Fastify ni Prisma) garantiza que las reglas de negocio sean inmutables ante cambios de infraestructura y 100% testeables en milisegundos.

### 3. Cómo se probó
- **Backend (Jest)**:
  - `test/unit/workflows.spec.ts` (15 tests): verificación de cada transición válida de los 3 circuitos y comprobación de que transiciones prohibidas arrojan `InvalidStateTransitionException` o `BusinessRuleException`.
  - `test/unit/sla-calculator.spec.ts` (6 tests): pruebas de cálculo de horas transcurridas, horas restantes y porcentaje de SLA consumido.

### 4. Trade-offs
- Implementar clases de workflow específicas por circuito (`ExternoInternoWorkflow`, etc.) en vez de un motor de reglas genérico configurable en base de datos. Se eligió esta arquitectura porque garantiza tipado estricto en tiempo de compilación y trazabilidad directa contra las especificaciones del PDF, eliminando la sobreingeniería de un parser dinámico.

---

## PR #3: `feat/backend-persistence-concurrency` — Persistencia Prisma, Controladores Delgados y Concurrencia

- **Rama Origen**: `feat/backend-persistence-concurrency`
- **Rama Destino**: `main`
- **Estado**: `Merged`

### 1. Qué se hizo
- Implementación de la capa de persistencia relacional con PostgreSQL y Prisma:
  - Adaptadores que implementan las interfaces de repositorio de dominio (`PrismaTramiteRepository`, `PrismaAreaRepository`, `PrismaTipoTramiteRepository`, etc.).
  - Mappers bidireccionales explícitos (`toDomain` y `toPersistence`) para desacoplar las entidades de dominio del schema relacional.
  - Transaccionalidad atómica (`prisma.$transaction`): cada transición de estado modifica el trámite y crea un `MovimientoTramite` inmutable en una única operación indivisible.
  - Control de concurrencia pesimista en `TOMAR_TRAMITE`: actualización condicional atómica para evitar que dos operadores tomen el mismo trámite en simultáneo (arrojando `409 Conflict` / `ConcurrencyConflictException`).
  - Refactorización a 100% *Thin Controllers* en NestJS + Fastify: controladores delgados que únicamente validan DTOs de entrada y delegan la lógica a los casos de uso.
  - Filtro global `HttpExceptionFilter` con mapeo canónico (401, 403, 404, 422).

### 2. Por qué
- Asegurar integridad relacional absoluta y prevenir condiciones de carrera (*race conditions*) en entornos concurrentes de alta demanda. El patrón de *Thin Controllers* y repositorios por puertos garantiza que el framework web sea un detalle de infraestructura reemplazable.

### 3. Cómo se probó
- **Backend (Jest)**:
  - `test/unit/concurrency.spec.ts` (2 tests): simulación con `Promise.allSettled` de dos peticiones simultáneas intentando tomar el mismo trámite no asignado; verifica que una triunfa y la otra falla con error de concurrencia.
  - `test/unit/use-cases.spec.ts` (13 tests): validación de los casos de uso de asignación, derivación, observación, aprobación y rechazo.
  - `test/unit/comentarios-visibility.spec.ts` (5 tests): validación de filtrado estricto de comentarios internos.

### 4. Trade-offs
- El uso de mappers bidireccionales manuales requiere código boilerplate adicional, pero es la única forma de garantizar que cambios o migraciones en Prisma no afecten las entidades puras de dominio ni violen Clean Architecture.

---

## PR #4: `feat/frontend-portals` — Portales Interno y Externo con Clean Frontend

- **Rama Origen**: `feat/frontend-portals`
- **Rama Destino**: `main`
- **Estado**: `Merged`

### 1. Qué se hizo
- Desarrollo integral de la interfaz de usuario en Next.js 19 con Material UI v6 bajo arquitectura *Clean Frontend* (modular por features):
  - Organización modular en `features/auth`, `features/tramites`, `features/areas`, `features/tipos-tramite` y `features/dashboard` con carpetas desacopladas `actions/`, `adapters/`, `components/`, `hooks/` e `interfaces/`.
  - **Portal Interno (`/interno`)**:
    - Login corporativo mock con selector rápido de los 5 roles.
    - Dashboard operacional con tarjetas KPI (total, en revisión, vencidos, cumplimiento SLA), gráfico de estados y atajos.
    - Bandeja de trámites con filtros multidimensionales (estado, prioridad, área, alerta SLA vencido y buscador de texto) con paginación integrada.
    - Detalle de trámite completo con Timeline visual de auditoría, gestión de Documentos, Comentarios públicos/privados y barra de acciones con diálogos de confirmación accesibles.
    - Vistas CRUD para administración de Áreas y Tipos de Trámite protegidas para rol ADMIN.
  - **Portal Externo (`/externo`)**:
    - Registro de solicitante y login propio.
    - Bandeja de «Mis Trámites» con tarjetas y estados.
    - Formulario accesible de inicio de nuevo trámite (filtrando tipos con `permiteInicioExterno: true`).
    - Detalle de trámite con vista pública del historial y formulario para subsanar observaciones.
  - Formularios gestionados al 100% mediante Formik + Yup con accesibilidad completa (`htmlFor`, `id`, `aria-*`).
  - Error Boundaries canónicos (`error.tsx`), Skeletons de carga y notificaciones globales tipo Snackbar/Toast.

### 2. Por qué
- Brindar una experiencia de usuario institucional de alto nivel, reactiva, accesible y orientada a la operación diaria. La separación en portales físicos independientes garantiza que los ciudadanos nunca carguen código, componentes ni rutas destinadas a los operadores internos.

### 3. Cómo se probó
- **Frontend (Vitest)**:
  - `badges.spec.tsx` (5 tests): renderizado de badges de prioridad, estado y alertas de SLA.
  - `timeline.spec.tsx` (2 tests): renderizado cronológico de movimientos de auditoría.
  - `confirm-dialog.spec.tsx` (2 tests): accesibilidad y eventos de confirmación/cancelación en acciones críticas.
  - `crear-tramite-form.spec.tsx` (2 tests): validaciones Yup y envío de formularios.
  - `ThemeRegistry.spec.tsx` (1 test): integración de Material UI con Next.js App Router.
- **E2E Visual**: Verificación en navegador de todos los flujos de creación, observación, subsanación y aprobación.

### 4. Trade-offs
- Se utilizó Material UI v6 nativo configurado con emotion cache para Next.js en lugar de componentes prefabricados genéricos. Esto requirió un `ThemeRegistry` personalizado, pero garantizó control estricto de colores institucionales, estados hover y accesibilidad WCAG.

---

## PR #5: `feat/docker-tests-docs` — Contenerización, Semillas Determinísticas, Matriz y Auditoría Final

- **Rama Origen**: `feat/docker-tests-docs`
- **Rama Destino**: `main`
- **Estado**: `Merged`

### 1. Qué se hizo
- Contenerización integral del ecosistema con `docker-compose.yml`:
  - 3 servicios orquestados: `db` (PostgreSQL 16 Alpine con volumen persistente), `api` (NestJS/Fastify) y `web` (Next.js 19).
  - Dockerfiles multi-stage basados en Node 22 Alpine con optimización de capas de caché vía `pnpm`.
  - Healthchecks nativos en cada servicio (`pg_isready` para DB, `/api/health` para API y fetch HTTP para frontend).
- Semillas determinísticas completas (`prisma/seed.ts`) cargando los 5 roles internos, 3 áreas, 4 tipos de trámite y 11 trámites en distintos estados del workflow.
- Pipeline de Integración Continua en GitHub Actions (`.github/workflows/ci.yml`).
- Matriz de trazabilidad exhaustiva en `docs/TRACEABILITY_MATRIX.md` cubriendo el 100% de los requisitos del PDF.
- Auditoría técnica final punto por punto en `docs/FINAL_AUDIT.md`.
- Guías de despliegue en nube (`docs/AWS_DEPLOYMENT.md`), notas de producción (`docs/PRODUCTION_NOTES.md`) y bitácora de decisiones (`docs/DECISION_LOG.md`).

### 2. Por qué
- Permitir que cualquier evaluador clone el repositorio y con un único comando (`docker compose up -d --build`) tenga toda la plataforma operativa con datos de prueba realistas, sin necesidad de configuraciones manuales.

### 3. Cómo se probó
- **Docker Compose**: Levantamiento exitoso de punta a punta con variables por defecto de `.env.example`.
- **Suites Automatizadas**: Ejecución completa de los 74 tests automatizados (59 Jest backend + 15 Vitest frontend) con 100% de éxito.
- **Linters y Typecheck**: Verificación de cero errores en `pnpm lint` y `pnpm typecheck` en monorepo.

### 4. Trade-offs
- Las imágenes multi-stage tardan unos segundos más en compilar en la primera ejecución, pero reducen el tamaño final de los contenedores a menos de la mitad y eliminan herramientas de desarrollo en producción, aumentando significativamente la seguridad del contenedor.
