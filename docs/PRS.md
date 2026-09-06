# Registro de Pull Requests y Flujo de Ramas (Git Workflow)

Este documento registra los Pull Requests (PRs) desarrollados a lo largo de la construcción de la plataforma **BPM Trámites de Oficina**, siguiendo la convención de ramas temáticas (*Feature Branch Workflow*) y *Conventional Commits*.

---

## PR #1: `feat/auth-internal-external` — Arquitectura de Autenticación Dual y Aislamiento de Identidades

- **Rama Origen**: `feat/auth-internal-external`
- **Rama Destino**: `main`
- **Estado**: `Merged`
- **Descripción**:
  Implementación del subsistema de doble autenticación desacoplada según especificaciones contractuales:
  - **Portal Interno**: Autenticación corporativa mockeable compatible con Azure Entra ID / OIDC, soporte de los 5 roles (`ADMIN`, `MESA_ENTRADA`, `OPERADOR`, `SUPERVISOR`, `AUDITOR`).
  - **Portal Externo**: Autenticación propia mediante Email + Password hasheado con Argon2/Bcrypt y emisión de JWT para ciudadanos y proveedores.
  - **Guards de Seguridad y RBAC**: `InternalAuthGuard`, `ExternalAuthGuard`, `RolesGuard` y `TramiteOwnershipGuard` con prevención estricta de fuga de información (respuestas opacas 401/403 y logging de seguridad interno).
  - **Cookies Seguras**: Almacenamiento exclusivo en cookies con flags `SameSite=Lax` y `Secure`, eliminando terminantemente el uso de `localStorage`.
- **Archivos Clave**:
  - `backend/src/modules/auth/*`
  - `frontend/src/middleware.ts`
  - `frontend/src/shared/utils/cookies.util.ts`
  - `frontend/src/shared/context/AuthContext.tsx`
- **Tests Asociados**: `test/unit/auth-guards.spec.ts`, `test/unit/auth-services.spec.ts`, `frontend/test/cookies.spec.ts`.

---

## PR #2: `feat/backend-workflow-domain` — Corazón de Dominio, Máquinas de Estado y Casos de Uso

- **Rama Origen**: `feat/backend-workflow-domain`
- **Rama Destino**: `main`
- **Estado**: `Merged`
- **Descripción**:
  Construcción del Domain-Driven Design (DDD) y Clean Architecture sin acoplamiento a frameworks:
  - Entidades de dominio puras: `Tramite`, `TipoTramite`, `Area`, `UsuarioInterno`, `UsuarioExterno`, `MovimientoTramite`, `DocumentoTramite`, `ComentarioTramite`.
  - Máquinas de estado determinísticas para los 3 circuitos operativos:
    1. Circuito Externo → Interno (Borrador -> Ingresado -> En Revisión -> Observado -> Aprobado/Rechazado -> Cerrado).
    2. Circuito Interno → Interno (Borrador -> Ingresado -> En Revisión -> Derivado -> Aprobado/Rechazado -> Cerrado).
    3. Circuito Interno → Externo (Borrador -> Ingresado -> Esperando Externo -> Esperando Interno -> Aprobado/Rechazado -> Cerrado).
  - Servicio de dominio para cálculo y marcación dinámica de SLA (`SlaCalculatorService`).
  - Casos de uso atómicos para cada transición operativa.
- **Archivos Clave**:
  - `backend/src/modules/tramites/domain/workflow/*`
  - `backend/src/modules/tramites/domain/entities/*`
  - `backend/src/modules/tramites/domain/services/sla-calculator.service.ts`
  - `backend/src/modules/tramites/application/use-cases/*`
- **Tests Asociados**: `test/unit/workflows.spec.ts`, `test/unit/sla-calculator.spec.ts`.

---

## PR #3: `feat/backend-persistence-concurrency` — Persistencia Prisma, Controladores Delgados y Concurrencia

- **Rama Origen**: `feat/backend-persistence-concurrency`
- **Rama Destino**: `main`
- **Estado**: `Merged`
- **Descripción**:
  Implementación de la infraestructura de persistencia relacional y API HTTP de alto rendimiento:
  - Repositorios de Prisma desacoplados mediante interfaces de repositorio (puertos) en dominio.
  - Mappers bidireccionales explícitos entre el modelo relacional y las entidades de dominio.
  - Transaccionalidad atómica (`prisma.$transaction`) con generación inmutable de `MovimientoTramite`.
  - Control de concurrencia pesimista en `TOMAR_TRAMITE` para prevenir condiciones de carrera entre operadores simultáneos.
  - Refactorización a 100% *Thin Controllers* en NestJS + Fastify: cero inyecciones de repositorios en controllers, cero funciones `.map()` o construcción de objetos literales en retornos, delegando íntegramente en DTOs de salida de los Use Cases.
- **Archivos Clave**:
  - `backend/src/modules/tramites/infrastructure/repositories/*`
  - `backend/src/modules/tramites/infrastructure/mappers/*`
  - `backend/src/modules/tramites/infrastructure/controllers/*`
- **Tests Asociados**: `test/unit/concurrency.spec.ts`, `test/unit/use-cases.spec.ts`, `src/modules/health/health.controller.spec.ts`.

---

## PR #4: `feat/frontend-portals-clean-arch` — Portales Interno y Externo con Clean Frontend

- **Rama Origen**: `feat/frontend-portals-clean-arch`
- **Rama Destino**: `main`
- **Estado**: `Merged`
- **Descripción**:
  Desarrollo de la experiencia de usuario y arquitectura modular por features (*Clean Frontend*) en Next.js 19 con Material UI:
  - Separación estricta por features (`features/auth`, `features/tramites`, `features/areas`, `features/tipos-tramite`, `features/dashboard`) divididas en `interfaces/`, `adapters/`, `actions/`, `hooks/` y `components/`.
  - **Portal Interno**: Login corporativo mock con 5 roles, Dashboard con métricas analíticas y cumplimiento SLA, Bandeja de trámites con filtros avanzados y paginación, Detalle operativo con Timeline de auditoría, Documentos, Comentarios privados/públicos, barra de acciones con confirmaciones accesibles, y CRUDs de Tipos y Áreas.
  - **Portal Externo**: Registro ciudadano/proveedor, Login, Bandeja de mis trámites, Inicio de trámite público, Detalle y respuestas a observaciones/intervenciones.
  - Error Boundaries canónicos (`error.tsx`) en ambos portales y normalización de errores en `httpClient.ts` conectado a `NotificationContext`.
  - Formularios implementados exclusivamente con Formik + Yup y accesibilidad (`htmlFor`, `id`, `aria-describedby`).
- **Archivos Clave**:
  - `frontend/src/app/(interno)/*`
  - `frontend/src/app/(externo)/*`
  - `frontend/src/features/*`
  - `frontend/src/shared/*`
- **Tests Asociados**: `test/badges.spec.tsx`, `test/timeline.spec.tsx`, `test/confirm-dialog.spec.tsx`, `test/crear-tramite-form.spec.tsx`.

---

## PR #5: `feat/docker-tests-docs` — Contenerización, Semillas Determinísticas, Matriz y Auditoría Final

- **Rama Origen**: `feat/docker-tests-docs`
- **Rama Destino**: `main`
- **Estado**: `Merged`
- **Descripción**:
  Cierre integral de calidad y producción:
  - `docker-compose.yml` multi-servicio (`db`, `api`, `web`) con healthchecks activos y volumen persistente.
  - Dockerfiles multi-stage basados en Node 22 Alpine y gestor exclusivo pnpm.
  - Semillas determinísticas completas (`prisma/seed.ts`) con los casos de prueba del PDF.
  - Pipeline de Integración Continua con GitHub Actions (`.github/workflows/ci.yml`).
  - Matriz de trazabilidad al 100% y reporte de auditoría técnica exhaustivo (`docs/FINAL_AUDIT.md`).
