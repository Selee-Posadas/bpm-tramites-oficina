# REGISTRO DE DECISIONES DE ARQUITECTURA (DECISION LOG)

> **Proyecto**: BPM de Trámites de Oficina  
> **Estado**: Etapa 1 — Cerebro  
> **Última Actualización**: 2026-09-05  

Este documento recoge y formaliza las decisiones clave de diseño de software, arquitectura de sistemas, modelado de dominio y mitigación de riesgos técnicos tomadas para el cumplimiento estricto del desafío técnico.

---

## ADR 01: Modelado de Dominio y Agregados (DDD)

### Contexto
El sistema gestiona trámites entre áreas internas, empleados y personas externas mediante tres flujos disjuntos. El workflow es el núcleo del negocio y no un simple atributo de un CRUD.

### Decisión
1. **Agregado Raíz: `Tramite`**
   - La entidad `Tramite` actúa como raíz de agregado (`Aggregate Root`), encapsulando su estado, historial de movimientos (`MovimientoTramite`), comentarios (`ComentarioTramite`) y referencias documentales (`DocumentoTramite`).
   - Ninguna mutación de estado o asignación ocurre fuera de los métodos de la entidad o de su máquina de estados asociada.
2. **Entidades de Soporte y Catálogos**:
   - `TipoTramite`: Define las reglas operativas de cada trámite (SLA en horas, si requiere o permite inicio por un externo, y área inicial asignada).
   - `Area`: Unidad organizacional interna (código, nombre, activa).
   - `UsuarioInterno`: Empleado asignado a un área con un rol jerárquico/operativo.
   - `UsuarioExterno`: Persona u organización que inicia trámites o responde a requerimientos.
3. **Inmutabilidad de Auditoría**:
   - `MovimientoTramite` es estrictamente append-only. Nunca se actualiza ni se elimina un movimiento registrado.

---

## ADR 02: Máquinas de Estado Explicitas y Separación de Workflows

### Contexto
El PDF especifica 3 circuitos de negocio con secuencias y reglas disímiles:
- **Externo → Interno**: Inicia externo, Mesa de Entrada / Operador interno revisa y puede observar, externo responde observación, interno aprueba/rechaza, y finalmente se cierra.
- **Interno → Interno**: Inicia interno, asignado a un área destino, puede derivarse secuencialmente entre áreas, interno aprueba/rechaza, y se cierra.
- **Interno → Externo**: Inicia interno pero requiere una intervención o documentación de un externo (`ESPERANDO_EXTERNO`), el externo responde (`ESPERANDO_INTERNO`), el interno retoma (`EN_REVISION`) y se concluye.

### Decisión
- En lugar de una matriz monolítica o un condicional disperso, el dominio cuenta con implementaciones independientes del patrón State/Workflow (`ExternoInternoWorkflow`, `InternoInternoWorkflow`, `InternoExternoWorkflow`), gobernadas por la interfaz común `ITramiteWorkflow`.
- Cada transición evalúa rigurosamente:
  1. Estado de origen permitido.
  2. Rol y tipo de actor que ejecuta la transición (Interno vs Externo).
  3. Precondiciones de datos (ej. motivo en observación, área destino en derivación, usuario externo asignado en intervención).
  4. Generación del `MovimientoTramite` con la acción exacta.
- Si una transición es inválida, se arroja una excepción de dominio (`InvalidStateTransitionException` o `BusinessRuleException`) que el filtro de infraestructura traduce inmediatamente a HTTP 422.

---

## ADR 03: Separación Concéntrica Clean Architecture / DDD Backend

### Contexto
El sistema debe desacoplar las reglas de negocio de cualquier detalle de infraestructura (Prisma ORM, NestJS, Fastify, HTTP, Postgres).

### Decisión
- **Capa de Dominio (`src/modules/[feature]/domain`)**:
  - Contiene las entidades puras de TypeScript, Value Objects, Enums, Interfaces de Repositorios (Puertos) y Reglas de Negocio.
  - Prohibido terminantemente importar decorators de Prisma, librerías HTTP o NestJS.
- **Capa de Aplicación (`src/modules/[feature]/application`)**:
  - Casos de uso atómicos (un caso de uso por archivo/clase, ej.: `TomarTramiteUseCase`, `AprobarTramiteUseCase`, `ObservarTramiteUseCase`).
  - Orquestan la carga de la entidad desde el puerto, la invocación de métodos de dominio y la persistencia transaccional.
- **Capa de Infraestructura (`src/modules/[feature]/infrastructure`)**:
  - Adaptadores que implementan los puertos de repositorio (`PrismaTramiteRepository`).
  - Controladores Fastify delgados.
  - Mappers explícitos bidireccionales (`TramiteMapper.toDomain` y `TramiteMapper.toPersistence`) para que el esquema de base de datos pueda evolucionar sin romper el dominio.
- **Capa DTO (`src/modules/[feature]/dto`)**:
  - Validación de entrada estructural mediante `class-validator` con `whitelist: true` y `forbidNonWhitelisted: true`.

---

## ADR 04: Estrategia de Autenticación y Autorización Desacoplada

### Contexto
El PDF exige que el sistema distinga con precisión quirúrgica entre usuarios internos y externos, impidiendo cualquier cruce o escalado de privilegios.

### Decisión
1. **Doble Sistema de Autenticación**:
   - **Usuarios Internos**:
     - Preparado para Azure Entra ID / MSAL (OpenID Connect / OAuth 2.0).
     - Se implementa una estrategia Passport/Fastify que valida tokens JWT con claims estándar de Azure (`oid`, `preferred_username`, `roles`).
     - Para entorno de desarrollo local y evaluación, se provee un mock seguro y determinístico que genera tokens equivalentes con los 5 roles solicitados (`ADMIN`, `MESA_ENTRADA`, `OPERADOR`, `SUPERVISOR`, `AUDITOR`).
   - **Usuarios Externos**:
     - Sistema nativo con registro (`/api/auth/external/register`), login (`/api/auth/external/login`) y emisión de JWT firmado con clave y emisor independiente.
     - Contraseñas protegidas mediante Argon2 / Bcrypt.
2. **Guards y Autorización a Nivel de Recurso**:
   - `InternalAuthGuard` y `ExternalAuthGuard` protegen endpoints de forma excluyente.
   - `RolesGuard` valida roles internos para acciones restringidas (ej.: reasignación solo permitida a `SUPERVISOR` y `ADMIN`; solo lectura para `AUDITOR`).
   - `TramiteOwnershipGuard`: Para usuarios externos, valida que el trámite pertenezca estrictamente al usuario autenticado (`usuarioExternoId == user.id` o `creadoPorId == user.id`). En caso contrario, responde 403 / 404 para evitar enumeración de recursos.

---

## ADR 05: Concurrencia y Bloqueo en `TOMAR_TRAMITE`

### Contexto
El PDF prohíbe explícitamente un enfoque ingenuo `SELECT` -> `UPDATE` sin protección transaccional que permita que dos operadores tomen el mismo trámite en simultáneo (race condition).

### Decisión
- **Estrategia Elegida: Transacción Aislada con Bloqueo Pesimista en PostgreSQL**:
  ```typescript
  return await this.prisma.$transaction(async (tx) => {
    // 1. Bloqueo pesimista de fila en PostgreSQL:
    const [row] = await tx.$queryRaw<TramiteRaw[]>`
      SELECT * FROM "tramites" 
      WHERE "id" = ${tramiteId}::uuid 
      FOR UPDATE
    `;
    
    if (!row) throw new EntityNotFoundException('Trámite no encontrado');
    if (row.usuarioAsignadoId !== null) {
      throw new ConflictBusinessException('El trámite ya fue tomado por otro operador');
    }
    if (row.estado !== EstadoTramite.INGRESADO && row.estado !== EstadoTramite.EN_REVISION) {
      throw new InvalidStateTransitionException('El trámite no está en un estado tomable');
    }
    
    // 2. Asignación atómica y cambio de estado:
    const updated = await tx.tramite.update({
      where: { id: tramiteId },
      data: {
        usuarioAsignadoId: operadorId,
        estado: EstadoTramite.EN_REVISION,
        fechaActualizacion: new Date(),
      },
    });
    
    // 3. Registro de auditoría en la misma transacción:
    await tx.movimientoTramite.create({
      data: {
        tramiteId,
        estadoAnterior: row.estado,
        estadoNuevo: EstadoTramite.EN_REVISION,
        usuarioTipo: 'INTERNO',
        usuarioId: operadorId,
        accion: 'TOMAR',
        comentario: 'Trámite tomado por operador',
      },
    });
    
    return updated;
  });
  ```
- **Justificación**:
  - Garantiza exclusión mutua estricta a nivel de motor PostgreSQL.
  - El segundo request que llegue en paralelo esperará la liberación del lock y, al leer el estado actualizado, recibirá un error controlado de negocio sin corromper el historial.
  - Se verificará con un integration test concurrente (`Promise.all`).

---

## ADR 06: Transaccionalidad Atómica en Transiciones

### Contexto
Una transición nunca debe quedar parcialmente aplicada (ej. actualizar el trámite pero fallar al registrar el movimiento de auditoría).

### Decisión
- Toda operación de cambio de estado o reasignación se envuelve en `prisma.$transaction`.
- Si la inserción del `MovimientoTramite` falla o se produce cualquier error en la persistencia o validación de invariantes, se ejecuta un rollback automático completo.

---

## ADR 07: Cálculo y Marcación Dinámica de SLA

### Contexto
Los trámites deben calcular su vencimiento de acuerdo a las horas de SLA definidas en su `TipoTramite` (`slaHoras`) y marcarse visualmente tanto en los listados como en el dashboard.

### Decisión
- El cálculo se realiza mediante un `SlaCalculatorService` en dominio:
  - `fechaVencimiento = fechaCreacion + (slaHoras * 3600 * 1000)`.
  - Si el trámite aún no está finalizado (`APROBADO`, `RECHAZADO`, `CANCELADO`, `CERRADO`) y `now() > fechaVencimiento`, se computa `estaVencido: true` y los minutos/horas de retraso.
- Se implementan índices en base de datos sobre `fechaCreacion` y `estado` para que las consultas analíticas del Dashboard (`GET /api/dashboard`) calculen métricas de SLA de manera instantánea.

---

## ADR 08: Arquitectura Frontend Next.js 19 con Clean Frontend

### Contexto
El frontend debe ofrecer dos experiencias completamente diferenciadas (`/interno` y `/externo`) sin compartir layouts ni componentes de lógica acoplados a permisos.

### Decisión
1. **Next.js App Router con Grupos de Rutas**:
   - `src/app/(interno)/interno/...` para empleados y administradores.
   - `src/app/(externo)/externo/...` para ciudadanos y proveedores externos.
   - Cada grupo cuenta con su propio layout raíz, barra de navegación, temas y guards de sesión independientes.
2. **Feature-Sliced Clean Architecture**:
   - Las llamadas HTTP nunca se hacen inline en los componentes: se encapsulan en `actions/`.
   - Los datos de API son transformados mediante `adapters/` puros antes de llegar a la vista.
   - La lógica de estado reside en `hooks/` o `context/`.
   - Las interfaces TypeScript se declaran en `interfaces/` separadas (`.api.interface.ts` y `.interface.ts`).
3. **Formularios con Formik y Yup**:
   - Cada formulario cuenta con su schema de validación Yup, garantizando accesibilidad y feedback visual inmediato.
