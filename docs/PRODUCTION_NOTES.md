# NOTAS DE OPERACIÓN EN PRODUCCIÓN (PRODUCTION NOTES)

> **Sistema**: BPM de Trámites de Oficina  
> **Entorno**: Producción / Staging  

---

## 1. Validación en Producción (Smoke Tests & Healthcheck)
- **Healthcheck Endpoint**: `GET /api/health`
  - Verifica conexión a PostgreSQL mediante `SELECT 1`.
  - Verifica estado de memoria y uptime del proceso Fastify.
  - Retorna HTTP 200 `{ "status": "ok", "database": "connected" }`.
- **Smoke Tests de Puesta en Marcha**:
  1. Ejecución de migraciones automáticas (`prisma migrate deploy`).
  2. Verificación de lectura de catálogos (`GET /api/areas`, `GET /api/tipos-tramite`).
  3. Verificación de carga de UI en `/interno/login` y `/externo/login`.

---

## 2. Métricas y Telemetría Relevante
- **Métricas de Negocio**:
  - Tasa de trámites creados por circuito (Interno-Interno, Interno-Externo, Externo-Interno).
  - Trámites con SLA vencido vs. SLA en término.
  - Tiempo promedio de resolución por tipo de trámite y por área.
  - Ratio de observaciones vs. aprobaciones directas.
- **Métricas de Infraestructura**:
  - Latencia p95 / p99 en endpoints de workflow Fastify.
  - Utilización de conexiones en el pool de PostgreSQL (pgBouncer / RDS).
  - Tasa de errores HTTP 422 (violaciones de regla) vs 500 (errores no controlados).
  - Concurrencia de peticiones en `POST /api/tramites/:id/tomar`.

---

## 3. Estrategia de Logs Estructurados
- Formato JSON estándar vía Pino (integrado de forma nativa con Fastify).
- Campos obligatorios en cada log:
  - `timestamp`: Formato ISO 8601 UTC.
  - `level`: info, warn, error, fatal.
  - `correlationId`: UUID propagado por header `x-correlation-id` entre frontend y backend.
  - `userId` / `userType`: Identidad autenticada.
  - `action`: Acción operativa o de workflow ejecutada.
  - `tramiteId`: ID del trámite involucrado.
- Anonimización: Prohibido loguear contraseñas, tokens JWT o datos sensibles de usuarios externos.

---

## 4. Alertas Mínimas Recomendadas
- **Alerta Crítica (P1)**: Fallo en Healthcheck de Base de Datos (> 3 fallos consecutivos).
- **Alerta de Rendimiento (P2)**: Pool de conexiones PostgreSQL al 85% de saturación.
- **Alerta de Negocio (P3)**: Aumento anómalo (> 30%) de trámites vencidos por SLA en un área.
- **Alerta de Seguridad (P1)**: Más de 10 intentos fallidos de autenticación externa en menos de 1 minuto desde la misma IP (Rate Limit / Brute Force).

---

## 5. Gestión de Riesgos Conocidos y Mitigación
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Colisión de operadores al tomar trámite | Alto (inconsistencia de asignación) | Bloqueo pesimista `SELECT ... FOR UPDATE` en transacción PostgreSQL. |
| Caída de conexión durante transición | Medio (transacción huérfana) | Rollback transaccional atómico automático (`prisma.$transaction`). |
| Exposición de comentarios internos a usuarios externos | Crítico (fuga de información confidencial) | Filtrado a nivel de caso de uso y guard en capa de aplicación, testeado con tests unitarios e integración específicos. |

---

## 6. Estrategia de Rollback
- **Backend / API**: Rollback de imagen Docker o tarea ECS Fargate a la versión N-1 sin downtime mediante blue/green o rolling update.
- **Base de Datos**:
  - Todas las migraciones deben ser hacia adelante y no destructivas (evitar drops de columnas inmediatos).
  - En caso de rollback de esquema, scripts reversos documentados en `prisma/migrations/[timestamp]_revert.sql`.
- **Frontend**: Inmediato mediante cambio de etiqueta de imagen o re-enrutamiento de CDN (CloudFront / Vercel / Nginx).

---

## 7. Hardening de Seguridad
- Fastify Helmet configurado para headers HTTP seguros (CSP, HSTS, X-Frame-Options).
- Rate limiting con `@fastify/rate-limit` en rutas públicas de autenticación (`/auth/external/login`, `/auth/external/register`).
- CORS restringido estrictamente al origen del portal frontend.
- Cero almacenamiento de credenciales o secretos en el repositorio; inyección obligatoria mediante variables de entorno validadas en startup.
