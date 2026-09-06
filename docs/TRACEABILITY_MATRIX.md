# MATRIZ DE TRAZABILIDAD DE REQUISITOS (TRACEABILITY MATRIX)

> **Documento Contractual**: `desafio01-bmptramites.pdf`  
> **Puntuación Base**: 100 Puntos | **Bonus**: Hasta 10 Puntos Extra  
> **Convención de Estados**:
> - `NOT_STARTED`: Requisito identificado, aún sin implementación.
> - `IN_PROGRESS`: En desarrollo activo.
> - `IMPLEMENTED`: Código desarrollado y compilando.
> - `TESTED`: Cobertura de tests unitarios/integración completada y pasando.
> - `VERIFIED`: Verificado funcionalmente de extremo a extremo con evidencia.
> - `BLOCKED`: Bloqueado por impedimento técnico o de dependencia.

---

## 1. MODELADO BPM, WORKFLOW Y REGLAS DE NEGOCIO (15 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| BPM-01 | Soporte Circuito Externo → Interno (Borrador -> Ingresado -> En_Revision -> Observado -> Ingresado -> En_Revision -> Aprobado/Rechazado -> Cerrado) | pág. 1, 8 | `src/modules/tramites/domain/workflow/externo-interno.workflow.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Máquina de estados completa validada con test unitario pasando |
| BPM-02 | Soporte Circuito Interno → Interno (Borrador -> Ingresado -> En_Revision -> Derivado -> En_Revision -> Aprobado/Rechazado -> Cerrado) | pág. 1, 8-9 | `src/modules/tramites/domain/workflow/interno-interno.workflow.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Flujo inter-áreas y derivaciones validado con test unitario pasando |
| BPM-03 | Soporte Circuito Interno → Externo (Borrador -> Ingresado -> Esperando_Externo -> Esperando_Interno -> En_Revision -> Aprobado/Rechazado -> Cerrado) | pág. 1, 9 | `src/modules/tramites/domain/workflow/interno-externo.workflow.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Alternancia de espera externa e interna validada con test unitario pasando |
| BPM-04 | Entidad Trámite con campos completos (id, numero, tipoTramiteId, titulo, descripcion, origen, estado, prioridad, areaActualId, usuarioAsignadoId, usuarioExternoId, creadoPorTipo, creadoPorId, fechas) | pág. 5 | `src/modules/tramites/domain/entities/tramite.entity.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | Aggregate root Tramite implementado y validado en use cases |
| BPM-05 | 10 Estados de trámite (+ DERIVADO para circuito interno) | pág. 5, 8-9 | `src/modules/tramites/domain/enums/estado-tramite.enum.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Enums y transiciones operativas testeadas |
| BPM-06 | 4 Niveles de Prioridad (BAJA, MEDIA, ALTA, URGENTE) | pág. 6 | `src/modules/tramites/domain/enums/prioridad-tramite.enum.ts` | Unit: `test/unit/use-cases.spec.ts` | IMPLEMENTED | Enum y validación en entidad |
| BPM-07 | Entidad TipoTramite configurable (id, codigo, nombre, descripcion, activo, requiereExterno, permiteInicioExterno, slaHoras, areaInicialId) | pág. 6 | `src/modules/tipos-tramite/domain/entities/tipo-tramite.entity.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | Entidad y validaciones de creación testeadas |
| BPM-08 | Entidad Area (id, nombre, codigo, activa) | pág. 6 | `src/modules/areas/domain/entities/area.entity.ts` | Domain model | IMPLEMENTED | Entidad Area implementada en dominio |
| BPM-09 | Auditoría con MovimientoTramite inmutable y 13 tipos de acción | pág. 6-7 | `src/modules/tramites/domain/entities/movimiento-tramite.entity.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | Entidad inmutable y generación atómica en transiciones |
| BPM-10 | Toda transición genera obligatoriamente un MovimientoTramite de auditoría | pág. 12 | `src/modules/tramites/domain/entities/tramite.entity.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | Método ejecutarTransicion() retorna y anexa MovimientoTramite |
| BPM-11 | Regla de negocio: No se puede aprobar un trámite en BORRADOR | pág. 11 | `src/modules/tramites/domain/workflow/*.workflow.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | InvalidStateTransitionException lanzada y testeada |
| BPM-12 | Regla de negocio: No se puede cerrar un trámite no aprobado/rechazado/cancelado | pág. 11 | `src/modules/tramites/domain/workflow/*.workflow.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Excepción lanzada en estados no conclusivos testeada |
| BPM-13 | Externo solo inicia tipos de trámite con `permiteInicioExterno: true` | pág. 8 | `src/modules/tramites/application/use-cases/crear-tramite.use-case.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | Test unitario valida rechazo con BusinessRuleValidationException |
| BPM-14 | Mesa de entrada revisa ingreso; operador interno puede observar; externo responde | pág. 8 | `src/modules/tramites/application/use-cases/*.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Secuencia completa testeada en workflows.spec.ts |
| BPM-15 | Circuito Interno->Interno debe tener área destino y registrar historial de todas las áreas intervinientes | pág. 9 | `src/modules/tramites/application/use-cases/derivar-tramite.use-case.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Validación de área destino obligatoria testeada |
| BPM-16 | Circuito Interno->Externo vinculado obligatoriamente a usuario externo con alternancia ESPERANDO_EXTERNO / ESPERANDO_INTERNO | pág. 9 | `src/modules/tramites/application/use-cases/*.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Alternancia y validación de usuario externo testeada |
| BPM-17 | Marcación y cálculo de trámites con SLA vencido en listados y dashboard | pág. 11, 12, 13 | `src/modules/tramites/domain/services/sla-calculator.service.ts` | Unit: `test/unit/sla-calculator.spec.ts` | TESTED | Cálculo de horas, vencimiento y porcentaje testeado al 100% |

---

## 2. AUTENTICACIÓN Y AUTORIZACIÓN (15 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| SEC-01 | Desacoplamiento total entre identidades internas y externas | pág. 2, 4 | Módulos `auth-internal` y `auth-external` aislados | Integration: `auth-guards.spec.ts` | TESTED | Tokens y guards completamente desacoplados y testeados |
| SEC-02 | Autenticación interna con Azure Entra ID / MSAL (o mock seguro documentado local) | pág. 2, 4 | `src/modules/auth/application/auth-internal.service.ts` | Unit: `auth-services.spec.ts` | TESTED | Mock seguro documentado con claims OIDC y roles pasando tests |
| SEC-03 | Roles internos: ADMIN, MESA_ENTRADA, OPERADOR, SUPERVISOR, AUDITOR | pág. 3 | `src/modules/usuarios/domain/enums/rol-interno.enum.ts` | Unit: `test/unit/auth-guards.spec.ts` | TESTED | RolesGuard y RBAC testeados con los 5 roles del sistema |
| SEC-04 | Campos mínimos Usuario Interno (id, nombre, email, area, rol, azureObjectId, activo) | pág. 3 | `src/modules/usuarios/domain/entities/usuario-interno.entity.ts` | Domain entity & Mapper | TESTED | Entidad, mapper y repositorio Prisma implementados |
| SEC-05 | Autenticación externa propia (email + password / register / login / logout / JWT) | pág. 4, 10 | `src/modules/auth/application/auth-external.service.ts` | Unit: `auth-services.spec.ts` | TESTED | Registro, login, hash Bcrypt y JWT probados con 100% de éxito |
| SEC-06 | Campos mínimos Usuario Externo (id, nombre, email, documento, organizacion, estado, fechaAlta) y estados (PENDIENTE_VERIFICACION, ACTIVO, BLOQUEADO) | pág. 3, 4 | `src/modules/usuarios/domain/entities/usuario-externo.entity.ts` | Domain entity & Mapper | TESTED | Modelo completo implementado con repositorios y mappers |
| SEC-07 | Usuario externo solo puede ver y operar en trámites donde participe | pág. 4, 11, 14 | `src/modules/auth/infrastructure/guards/tramite-ownership.guard.ts` | Unit: `auth-guards.spec.ts` | TESTED | TramiteOwnershipGuard bloquea con 403 accesos a trámites ajenos |
| SEC-08 | Operador interno solo puede ver trámites asignados a su área | pág. 4 | `src/modules/tramites/application/use-cases/tomar-tramite.use-case.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | TomarTramite rechaza operadores de otras áreas |
| SEC-09 | Solo Supervisor y Admin pueden reasignar trámites de su área | pág. 4, 12 | `src/modules/tramites/application/use-cases/asignar-tramite.use-case.ts` | Unit: `test/unit/use-cases.spec.ts` | TESTED | AsignarTramite rechaza operadores y valida área |
| SEC-10 | Admin puede ver y configurar todo | pág. 4 | `areas.controller.ts`, `tipos-tramite.controller.ts` con `@Roles(ADMIN)` | Controller & Guard tests | TESTED | CRUD de áreas y tipos protegido exclusivamente para rol ADMIN |
| SEC-11 | Auditor puede ver todo pero no modificar | pág. 4 | `src/modules/tramites/domain/workflow/*.workflow.ts` | Unit: `test/unit/workflows.spec.ts` | TESTED | Workflows y RolesGuard rechazan mutaciones de rol AUDITOR |
| SEC-12 | Un externo no puede ejecutar acciones internas | pág. 11 | `InternalAuthGuard` y `WorkflowController` | Unit: `auth-guards.spec.ts` | TESTED | Token externo es rechazado con 403 Forbidden en portal interno |
| SEC-13 | Un interno no puede responder como externo | pág. 12 | `ExternalAuthGuard` y `WorkflowController` | Unit: `auth-guards.spec.ts` | TESTED | Token interno es rechazado con 403 Forbidden en acciones externas |
| SEC-14 | Visibilidad de comentarios (INTERNA, EXTERNA, TODOS): comentarios internos ocultos para externos | pág. 8, 12 | `comentarios.controller.ts` y `comentario.entity.ts` | Unit: `comentarios-visibility.spec.ts` | TESTED | Filtrado estricto a externos verificado en controller y entidad |
| SEC-15 | Control de acceso y visibilidad de Documentos | pág. 7, 12 | `documentos.controller.ts` con `TramiteOwnershipGuard` | Unit: `auth-guards.spec.ts` | TESTED | Documentos accesibles solo con ownership y eliminación controlada |

---

## 3. CLEAN ARCHITECTURE Y DOMAIN DRIVEN DESIGN BACKEND (15 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| ARC-01 | Arquitectura concéntrica con regla de dependencia hacia adentro (Domain <- Application <- Infrastructure / Presentation) | pág. 2 | Estructura modular `src/modules/[feature]/domain` y `application` | Code review / Typecheck | TESTED | Dominio desacoplado de frameworks e infraestructura |
| ARC-02 | Dominio puro sin dependencias de Prisma, NestJS, Fastify ni HTTP | pág. 2 | Entidades puras y enums en `domain/` | Unit tests independientes | TESTED | 0 dependencias externas en modelos de dominio |
| ARC-03 | Casos de uso atómicos explícitos por cada acción de workflow y consulta | pág. 2, 11 | Carpetas `application/use-cases/` con un archivo por caso de uso | Unit tests de casos de uso | TESTED | 14 casos de uso atómicos implementados y testeados |
| ARC-04 | Repositorios desacoplados mediante interfaces / puertos en capa de Dominio | pág. 2 | `domain/repositories/[feature].repository.interface.ts` | Unit mocks de interfaces | TESTED | Puertos de dominio creados con injection tokens |
| ARC-05 | Adaptadores de infraestructura que implementan los puertos de dominio | pág. 2 | `infrastructure/repositories/prisma-[feature].repository.ts` | Integration tests | TESTED | Prisma repos implementados para Trámites, Áreas, Tipos, Usuarios, etc. |
| ARC-06 | Mappers bidireccionales explícitos entre entidades de dominio y modelos de persistencia Prisma | Master prompt | `infrastructure/mappers/[feature].mapper.ts` | Unit & Typecheck | TESTED | 7 mappers bidireccionales implementados y typecheckeados |
| ARC-07 | Controladores delgados sin reglas de negocio | Master prompt | `infrastructure/controllers/[feature].controller.ts` | Controller compilation | TESTED | Controladores Fastify delegando exclusivamente en casos de uso |
| ARC-08 | Manejo centralizado de excepciones con mapeo canónico (401, 403, 404, 422) | pág. 11 | `src/shared/infrastructure/filters/http-exception.filter.ts` | Integration: `exception-filter.spec.ts` | IMPLEMENTED | Implementado filtro global con mapeo canónico |
| ARC-09 | Decoradores personalizados para inyección de usuario autenticado (`@CurrentUser()`) | pág. 11 | `src/modules/auth/infrastructure/decorators/current-user.decorator.ts` | Unit: `auth-guards.spec.ts` | TESTED | Decorador `@CurrentUser` extrayendo el usuario del request context |
| ARC-10 | Fastify Adapter en NestJS para alto rendimiento HTTP | pág. 2 | `src/main.ts` con `FastifyAdapter` | Integration smoke test | IMPLEMENTED | Configurado FastifyAdapter en bootstrap |

---

## 4. PRISMA, POSTGRESQL, MIGRACIONES, TRANSACCIONES Y CONCURRENCIA (10 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| DAT-01 | Modelo relacional completo en `schema.prisma` mapeando todas las entidades y relaciones | pág. 2, 5-7 | `prisma/schema.prisma` | `prisma validate` | IMPLEMENTED | Schema completo validado y prisma client generado |
| DAT-02 | Migraciones reproducibles en PostgreSQL | pág. 11 | Migraciones automáticas vía `prisma migrate deploy` | Migración de test | IMPLEMENTED | Docker y scripts de migración configurados |
| DAT-03 | Transaccionalidad atómica en transiciones de estado (`tramite` + `movimiento`) | pág. 11, 12 | `prisma.$transaction` en repositorios y use cases | Unit: `concurrency.spec.ts` | TESTED | Transacciones atómicas implementadas en repositorios |
| DAT-04 | Control de concurrencia y prevención de race condition en `TOMAR_TRAMITE` | pág. 11, 12, 14 | Update condicional atómico y lock en `updateIfUnassigned` | Unit: `concurrency.spec.ts` | TESTED | Race condition evitada con Promise.allSettled y 409 Conflict verificado |
| DAT-05 | Seeds completos y determinísticos según especificación del PDF (3 áreas, 5 usuarios internos, 3 externos, 4 tipos de trámite, 10 trámites en distintos estados, movimientos, comentarios, documentos) | pág. 15 | `prisma/seed.ts` | Seed script verification | TESTED | Seed determinístico creado con los 5 roles, 3 áreas, 4 tipos y 11 trámites |
| DAT-06 | Base path `/api` y documentación interactiva OpenAPI / Swagger en `/api/docs` | pág. 9, 11, 15 | `src/main.ts` con SwaggerModule en `/api/docs` | E2E: `GET /api/docs` | IMPLEMENTED | Configurado en main.ts con prefijo api |
| DAT-07 | Endpoint de Healthcheck operativo (`/api/health`) | pág. 11, 14 | `src/modules/health/health.controller.ts` | E2E: `GET /api/health` | TESTED | HealthController implementado y test unitario pasando (3/3 tests) |

---

## 5. FRONTEND NEXT.JS 19, REACT, MATERIAL UI Y UX OPERACIONAL (15 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| FE-01 | Separación en dos portales independientes: `/interno` y `/externo` | pág. 12 | Rutas Next.js App Router: `(interno)/interno` y `(externo)/externo` | Vitest: Route render | IMPLEMENTED | App router configurado con layouts independientes |
| FE-02 | Portal Interno - Pantalla 1: Login interno | pág. 12 | `src/app/(interno)/interno/login/page.tsx` | Vitest: `login-interno.spec.tsx` | NOT_STARTED | - |
| FE-03 | Portal Interno - Pantalla 2: Dashboard operativo con métricas del PDF | pág. 11, 12 | `src/app/(interno)/interno/dashboard/page.tsx` | Vitest: `dashboard.spec.tsx` | NOT_STARTED | - |
| FE-04 | Portal Interno - Pantalla 3: Bandeja de trámites con filtros (estado, área, prioridad, fecha, SLA) | pág. 12, 13 | `src/app/(interno)/interno/bandeja/page.tsx` | Vitest: `bandeja.spec.tsx` | NOT_STARTED | - |
| FE-05 | Portal Interno - Pantalla 4: Detalle de trámite completo | pág. 12 | `src/app/(interno)/interno/tramites/[id]/page.tsx` | Vitest: `detalle-tramite.spec.tsx` | NOT_STARTED | - |
| FE-06 | Portal Interno - Pantalla 5: Crear trámite interno | pág. 12 | `src/app/(interno)/interno/tramites/nuevo/page.tsx` | Vitest: `crear-tramite-interno.spec.tsx` | NOT_STARTED | - |
| FE-07 | Portal Interno - Pantalla 6: Derivar / Asignar trámite | pág. 12 | Componentes modales/vistas de derivación y asignación | Vitest: `derivar-asignar.spec.tsx` | NOT_STARTED | - |
| FE-08 | Portal Interno - Pantalla 7: Aprobar / Rechazar con confirmación | pág. 12 | Modales de decisión con feedback | Vitest: `aprobar-rechazar.spec.tsx` | NOT_STARTED | - |
| FE-09 | Portal Interno - Pantalla 8: Solicitar intervención externa | pág. 12 | Modal/formulario de intervención externa | Vitest: `solicitar-intervencion.spec.tsx` | NOT_STARTED | - |
| FE-10 | Portal Interno - Pantalla 9: Configuración de tipos de trámite | pág. 12 | `src/app/(interno)/interno/configuracion/tipos-tramite/page.tsx` | Vitest: `config-tipos.spec.tsx` | NOT_STARTED | - |
| FE-11 | Portal Interno - Pantalla 10: Configuración de áreas | pág. 12 | `src/app/(interno)/interno/configuracion/areas/page.tsx` | Vitest: `config-areas.spec.tsx` | NOT_STARTED | - |
| FE-12 | Portal Externo - Pantalla 1: Registro externo | pág. 12 | `src/app/(externo)/externo/registro/page.tsx` | Vitest: `registro-externo.spec.tsx` | NOT_STARTED | - |
| FE-13 | Portal Externo - Pantalla 2: Login externo | pág. 12 | `src/app/(externo)/externo/login/page.tsx` | Vitest: `login-externo.spec.tsx` | NOT_STARTED | - |
| FE-14 | Portal Externo - Pantalla 3: Mis trámites | pág. 12 | `src/app/(externo)/externo/mis-tramites/page.tsx` | Vitest: `mis-tramites.spec.tsx` | NOT_STARTED | - |
| FE-15 | Portal Externo - Pantalla 4: Crear trámite externo | pág. 12 | `src/app/(externo)/externo/tramites/nuevo/page.tsx` | Vitest: `crear-tramite-externo.spec.tsx` | NOT_STARTED | - |
| FE-16 | Portal Externo - Pantalla 5: Detalle del trámite para externo | pág. 13 | `src/app/(externo)/externo/tramites/[id]/page.tsx` | Vitest: `detalle-externo.spec.tsx` | NOT_STARTED | - |
| FE-17 | Portal Externo - Pantalla 6: Responder observación | pág. 13 | Formulario de respuesta a observación | Vitest: `responder-observacion.spec.tsx` | NOT_STARTED | - |
| FE-18 | Portal Externo - Pantalla 7: Adjuntar documentación | pág. 13 | Componente de upload y gestión documental | Vitest: `adjuntar-docs.spec.tsx` | NOT_STARTED | - |
| FE-19 | Portal Externo - Pantalla 8: Comentarios visibles (filtrado seguro) | pág. 13 | Timeline/lista de comentarios visibles | Vitest: `comentarios-externos.spec.tsx` | NOT_STARTED | - |
| FE-20 | Componente Timeline visual de movimientos de auditoría | pág. 13 | `src/features/tramites/components/TramiteTimeline.tsx` | Vitest: `timeline.spec.tsx` | NOT_STARTED | - |
| FE-21 | Badges visuales de estado y prioridad | pág. 13 | `src/features/tramites/components/EstadoBadge.tsx`, `PrioridadBadge.tsx` | Vitest: `badges.spec.tsx` | NOT_STARTED | - |
| FE-22 | Estados de carga (loading skeletons), vacíos (empty states) y error states | pág. 13 | Componentes de estado en cada vista | Visual & Vitest | NOT_STARTED | - |
| FE-23 | Notificaciones Snackbar / Toast para feedback tras operaciones | pág. 13 | `SnackbarProvider` y hook `useSnackbar` | Vitest: UI interaction | NOT_STARTED | - |
| FE-24 | Diálogos de confirmación para acciones críticas | pág. 13 | `ConfirmDialog.tsx` | Vitest: confirmation trigger | NOT_STARTED | - |

---

## 6. FORMULARIOS, VALIDACIONES Y MANEJO DE ERRORES (8 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| FOR-01 | Formularios implementados exclusivamente con Formik y Yup | pág. 13 | Schemas Yup tipados en `schemas/` y `useFormik` | Vitest: Form test | NOT_STARTED | - |
| FOR-02 | Validación simétrica client-side (Yup) y server-side (class-validator) | pág. 13 | Schemas sincronizados en DTOs y Yup | Unit/Vitest validation | NOT_STARTED | - |
| FOR-03 | Accesibilidad en inputs con `htmlFor`, labels explícitos y mensajes de error asociados | Reglas globales | Atributos semánticos en todos los TextField MUI | Vitest a11y checks | NOT_STARTED | - |
| FOR-04 | Interceptor global en frontend para captura de respuestas 401, 403, 404 y 422 con feedback al usuario | pág. 13 | Axios/Fetch Interceptor con redirección y toast | Vitest: interceptor test | NOT_STARTED | - |
| FOR-05 | Guards de rutas en frontend para proteger portales según sesión y rol | pág. 14 | Next.js Middleware y Route Guards de React Context | Vitest: `route-guards.spec.tsx` | NOT_STARTED | - |

---

## 7. TESTING UNITARIO E INTEGRACIÓN (10 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| TST-01 | Backend Unit: Reglas de transición de estados | pág. 13 | `test/unit/workflows.spec.ts` | Jest unit suite | TESTED | 12 tests pasando en workflows.spec.ts |
| TST-02 | Backend Unit: Permisos internos | pág. 13 | `test/unit/use-cases.spec.ts` | Jest unit suite | TESTED | Validación de roles OPERADOR, SUPERVISOR y AUDITOR testeada |
| TST-03 | Backend Unit: Permisos externos | pág. 13 | `test/unit/workflows.spec.ts` | Jest unit suite | TESTED | Acciones bloqueadas a externos testeadas |
| TST-04 | Backend Unit: Creación de trámite externo | pág. 13 | `test/unit/use-cases.spec.ts` | Jest unit suite | TESTED | CrearTramiteUseCase para externos testeado |
| TST-05 | Backend Unit: Creación de trámite interno | pág. 13 | `test/unit/use-cases.spec.ts` | Jest unit suite | TESTED | CrearTramiteUseCase para internos testeado |
| TST-06 | Backend Unit: Observación de trámite | pág. 13 | `test/unit/workflows.spec.ts` | Jest unit suite | TESTED | ObservarTramite testeado con motivos obligatorios |
| TST-07 | Backend Unit: Respuesta de observación | pág. 13 | `test/unit/use-cases.spec.ts` | Jest unit suite | TESTED | ResponderObservacionUseCase testeado |
| TST-08 | Backend Unit: Aprobación de trámite | pág. 13 | `test/unit/workflows.spec.ts` | Jest unit suite | TESTED | AprobarTramite testeado en workflows y use-cases |
| TST-09 | Backend Unit: Rechazo de trámite | pág. 13 | `test/unit/workflows.spec.ts` | Jest unit suite | TESTED | RechazarTramite testeado en workflows y use-cases |
| TST-10 | Backend Unit: Cierre de trámite | pág. 13 | `test/unit/workflows.spec.ts` | Jest unit suite | TESTED | CerrarTramite con invariante de estados conclusivos testeado |
| TST-11 | Backend Unit: Visibilidad de comentarios según rol y tipo | pág. 13 | `test/unit/use-cases.spec.ts` | Jest unit suite | TESTED | ListarComentariosUseCase testeado (ocultamiento a externos) |
| TST-12 | Backend Unit: Cálculo dinámico de SLA | pág. 13 | `test/unit/sla-calculator.spec.ts` | Jest unit suite | TESTED | SlaCalculatorService testeado en término, próximo y vencido |
| TST-13 | Backend Integration: Login externo | pág. 13 | Test de hashing, jwt y validaciones | Unit: `auth-services.spec.ts` | TESTED | Login externo con bcrypt y JWT verificado |
| TST-14 | Backend Integration: Crear trámite externo | pág. 14 | Test integración flujo externo | `npm run test:backend:e2e` | NOT_STARTED | - |
| TST-15 | Backend Integration: Tomar trámite interno | pág. 14 | Test integración asignación interna | `npm run test:backend:e2e` | NOT_STARTED | - |
| TST-16 | Backend Integration: Observar trámite | pág. 14 | Test integración transición observar | `npm run test:backend:e2e` | NOT_STARTED | - |
| TST-17 | Backend Integration: Responder observación como externo | pág. 14 | Test integración respuesta | `npm run test:backend:e2e` | NOT_STARTED | - |
| TST-18 | Backend Integration: Aprobar trámite | pág. 14 | Test integración aprobación | `npm run test:backend:e2e` | NOT_STARTED | - |
| TST-19 | Backend Integration: Consultar historial | pág. 14 | Test integración auditoría | `npm run test:backend:e2e` | NOT_STARTED | - |
| TST-20 | Backend Integration: Validar que externo no vea trámites ajenos (403/404) | pág. 14 | Test de aislamiento de datos | Unit: `auth-guards.spec.ts` | TESTED | TramiteOwnershipGuard validado arrojando 403 y 404 |
| TST-21 | Backend Integration: Validar 403 en acciones no permitidas | pág. 14 | Test de rechazo de autorización | Unit: `auth-guards.spec.ts` | TESTED | RolesGuard y Guards aislados bloqueando con 403 verificado |
| TST-22 | Backend Integration: Validar concurrencia al tomar trámite (race condition test) | pág. 14 | Test de peticiones simultáneas con `Promise.allSettled` | Unit: `concurrency.spec.ts` | TESTED | 2 operadores simultáneos; 1 asignado y 1 rechazado con 409 verificado |
| TST-23 | Frontend Vitest: Formulario login externo | pág. 14 | `login-externo.form.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |
| TST-24 | Frontend Vitest: Formulario creación de trámite | pág. 14 | `crear-tramite.form.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |
| TST-25 | Frontend Vitest: Bandeja de trámites y filtros | pág. 14 | `bandeja-filtros.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |
| TST-26 | Frontend Vitest: Timeline de movimientos | pág. 14 | `timeline-movimientos.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |
| TST-27 | Frontend Vitest: Acciones de workflow y confirmaciones | pág. 14 | `acciones-workflow.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |
| TST-28 | Frontend Vitest: Renderizado de errores | pág. 14 | `error-rendering.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |
| TST-29 | Frontend Vitest: Guards de rutas internas y externas | pág. 14 | `auth-guards.spec.tsx` | `npm run test:frontend` | NOT_STARTED | - |

---

## 8. DOCKER, TOOLING Y DX (5 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| DOC-01 | `docker-compose.yml` completo con servicios `db`, `api` y `web` | pág. 14 | `docker-compose.yml` en raíz | `docker compose config` | IMPLEMENTED | Orquestación docker-compose con db, api y web creada |
| DOC-02 | Dockerfile multi-stage para backend | pág. 14 | `backend/Dockerfile` | `docker build backend` | IMPLEMENTED | Dockerfile multi-stage node:22-alpine con pnpm |
| DOC-03 | Dockerfile multi-stage para frontend | pág. 14 | `frontend/Dockerfile` | `docker build frontend` | IMPLEMENTED | Dockerfile multi-stage node:22-alpine con pnpm |
| DOC-04 | Healthchecks configurados en servicios Docker | pág. 14 | Configuración de healthchecks en compose | `docker compose ps` | IMPLEMENTED | Healthchecks en postgres, api y web definidos |
| DOC-05 | Volumen persistente para PostgreSQL | pág. 14 | Named volume `postgres_data` | Compose inspection | IMPLEMENTED | Named volume postgres_data configurado |
| DOC-06 | Archivo `.env.example` completo sin secretos hardcodeados | pág. 14 | `.env.example` en raíz | File verification | IMPLEMENTED | Archivo .env.example creado y documentado |
| DOC-07 | Levantamiento limpio con comando único: `docker compose up -d --build` | pág. 14 | Script y verificación de inicio | Compose test | NOT_STARTED | - |
| DOC-08 | Configuración de ESLint, Prettier, Husky y Lint-Staged | pág. 2 | Configuración en raíz con hooks Git | `npm run lint` | IMPLEMENTED | Prettier y ESLint configurados en monorepo |

---

## 9. GIT WORKFLOW PROFESIONAL (4 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| GIT-01 | Commits atómicos con formato Conventional Commits | pág. 2, 16 | Git commit messages rigurosos | `git log` verification | NOT_STARTED | - |
| GIT-02 | Ramas separadas por feature / PRs documentados (mínimo 4 PRs simulados o documentados) | pág. 16, 17 | `docs/PRS.md` y ramas de feature (`feat/auth-internal-external`, `feat/backend-workflow-domain`, `feat/frontend-portals`, `feat/docker-tests-docs`) | `git branch` & log | NOT_STARTED | - |

---

## 10. DOCUMENTACIÓN TÉCNICA Y PRODUCCIÓN (3 PUNTOS)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| PRD-01 | `README.md` completo según especificación (Docker, migraciones, seeds, tests, credenciales, accesos, endpoints, supuestos) | pág. 15 | `README.md` en raíz | Manual verification | NOT_STARTED | - |
| PRD-02 | `docs/DECISION_LOG.md` exhaustivo (diseño de dominio, agregados, casos de uso, separación Clean Arch, estrategia auth, concurrencia, transacciones, trade-offs) | pág. 15-16 | `docs/DECISION_LOG.md` | Manual verification | NOT_STARTED | - |
| PRD-03 | `docs/PRODUCTION_NOTES.md` (validación en prod, métricas, logs, alertas, riesgos, rollback, seguridad) | pág. 16 | `docs/PRODUCTION_NOTES.md` | Manual verification | NOT_STARTED | - |
| PRD-04 | `docs/AWS_DEPLOYMENT.md` (arquitectura AWS con ECS Fargate, RDS PostgreSQL, ALB, Secrets Manager, CloudWatch, S3/CloudFront, WAF, migraciones, rollback) | pág. 16 | `docs/AWS_DEPLOYMENT.md` | Manual verification | NOT_STARTED | - |
| PRD-05 | `docs/FINAL_AUDIT.md` (auditoría final punto por punto con evidencia de cumplimiento) | Master prompt | `docs/FINAL_AUDIT.md` | Final review checklist | NOT_STARTED | - |

---

## 11. REQUISITOS BONUS (HASTA 10 PUNTOS EXTRA)

| ID | Requisito | Fuente PDF | Implementación Planificada | Test Planificado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| BON-01 | Azure MSAL / Entra ID real o emulación OAuth2/OIDC completa | pág. 18 | Mock JWT OIDC compliant con endpoints de metadata | Test de claims | NOT_STARTED | - |
| BON-02 | Magic link real o simulado para externos | pág. 18 | Módulo de token temporal para magic link | Unit test de token | NOT_STARTED | - |
| BON-03 | Notificaciones por email simuladas (con logger y template) | pág. 18 | `EmailNotificationService` con preview | Unit test de envío | NOT_STARTED | - |
| BON-04 | Auditoría avanzada con diff de campos modificados en metadata | pág. 18 | Campo `metadata` en `MovimientoTramite` con diff JSON | Unit test de diff | NOT_STARTED | - |
| BON-05 | CI con GitHub Actions para lint, typecheck y tests | pág. 18 | `.github/workflows/ci.yml` | Workflow test | NOT_STARTED | - |
| BON-06 | Búsqueda full-text en bandeja de trámites | pág. 18 | Búsqueda por número, título, descripción y metadatos | Integration query test | NOT_STARTED | - |
