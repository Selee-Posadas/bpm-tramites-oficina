-- CreateEnum
CREATE TYPE "RolInterno" AS ENUM ('ADMIN', 'MESA_ENTRADA', 'OPERADOR', 'SUPERVISOR', 'AUDITOR');

-- CreateEnum
CREATE TYPE "EstadoUsuarioExterno" AS ENUM ('PENDIENTE_VERIFICACION', 'ACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "OrigenTramite" AS ENUM ('INTERNO_INTERNO', 'INTERNO_EXTERNO', 'EXTERNO_INTERNO');

-- CreateEnum
CREATE TYPE "EstadoTramite" AS ENUM ('BORRADOR', 'INGRESADO', 'EN_REVISION', 'OBSERVADO', 'DERIVADO', 'ESPERANDO_EXTERNO', 'ESPERANDO_INTERNO', 'APROBADO', 'RECHAZADO', 'CANCELADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "PrioridadTramite" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('INTERNO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "AccionWorkflow" AS ENUM ('CREAR', 'INGRESAR', 'TOMAR', 'ASIGNAR', 'DERIVAR', 'OBSERVAR', 'RESPONDER_OBSERVACION', 'SOLICITAR_INTERVENCION_EXTERNA', 'RESPONDER_INTERVENCION_EXTERNA', 'APROBAR', 'RECHAZAR', 'CANCELAR', 'CERRAR');

-- CreateEnum
CREATE TYPE "VisibilidadComentario" AS ENUM ('INTERNA', 'EXTERNA', 'TODOS');

-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_internos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255),
    "area_id" UUID NOT NULL,
    "rol" "RolInterno" NOT NULL,
    "azure_object_id" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_internos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_externos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "documento" VARCHAR(50) NOT NULL,
    "organizacion" VARCHAR(150) NOT NULL,
    "estado" "EstadoUsuarioExterno" NOT NULL DEFAULT 'ACTIVO',
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_tramite" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "requiere_externo" BOOLEAN NOT NULL DEFAULT false,
    "permite_inicio_externo" BOOLEAN NOT NULL DEFAULT false,
    "sla_horas" INTEGER NOT NULL,
    "area_inicial_id" UUID NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_tramite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramites" (
    "id" UUID NOT NULL,
    "numero" VARCHAR(50) NOT NULL,
    "tipo_tramite_id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "origen" "OrigenTramite" NOT NULL,
    "estado" "EstadoTramite" NOT NULL DEFAULT 'BORRADOR',
    "prioridad" "PrioridadTramite" NOT NULL DEFAULT 'MEDIA',
    "area_actual_id" UUID,
    "usuario_asignado_id" UUID,
    "usuario_externo_id" UUID,
    "creado_por_tipo" "TipoUsuario" NOT NULL,
    "creado_por_id" UUID NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "fecha_cierre" TIMESTAMP(3),

    CONSTRAINT "tramites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_tramite" (
    "id" UUID NOT NULL,
    "tramite_id" UUID NOT NULL,
    "estado_anterior" "EstadoTramite",
    "estado_nuevo" "EstadoTramite" NOT NULL,
    "area_anterior_id" UUID,
    "area_nueva_id" UUID,
    "usuario_tipo" "TipoUsuario" NOT NULL,
    "usuario_id" UUID NOT NULL,
    "accion" "AccionWorkflow" NOT NULL,
    "comentario" TEXT,
    "metadata" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_tramite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_tramite" (
    "id" UUID NOT NULL,
    "tramite_id" UUID NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "subido_por_tipo" "TipoUsuario" NOT NULL,
    "subido_por_id" UUID NOT NULL,
    "fecha_carga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_tramite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_tramite" (
    "id" UUID NOT NULL,
    "tramite_id" UUID NOT NULL,
    "mensaje" TEXT NOT NULL,
    "visibilidad" "VisibilidadComentario" NOT NULL DEFAULT 'INTERNA',
    "autor_tipo" "TipoUsuario" NOT NULL,
    "autor_id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_tramite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_codigo_key" ON "areas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_internos_email_key" ON "usuarios_internos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_internos_azure_object_id_key" ON "usuarios_internos"("azure_object_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_externos_email_key" ON "usuarios_externos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_tramite_codigo_key" ON "tipos_tramite"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tramites_numero_key" ON "tramites"("numero");

-- CreateIndex
CREATE INDEX "tramites_estado_idx" ON "tramites"("estado");

-- CreateIndex
CREATE INDEX "tramites_origen_idx" ON "tramites"("origen");

-- CreateIndex
CREATE INDEX "tramites_area_actual_id_idx" ON "tramites"("area_actual_id");

-- CreateIndex
CREATE INDEX "tramites_usuario_asignado_id_idx" ON "tramites"("usuario_asignado_id");

-- CreateIndex
CREATE INDEX "tramites_usuario_externo_id_idx" ON "tramites"("usuario_externo_id");

-- CreateIndex
CREATE INDEX "tramites_fecha_creacion_idx" ON "tramites"("fecha_creacion");

-- CreateIndex
CREATE INDEX "movimientos_tramite_tramite_id_idx" ON "movimientos_tramite"("tramite_id");

-- CreateIndex
CREATE INDEX "movimientos_tramite_fecha_idx" ON "movimientos_tramite"("fecha");

-- CreateIndex
CREATE INDEX "documentos_tramite_tramite_id_idx" ON "documentos_tramite"("tramite_id");

-- CreateIndex
CREATE INDEX "comentarios_tramite_tramite_id_idx" ON "comentarios_tramite"("tramite_id");

-- CreateIndex
CREATE INDEX "comentarios_tramite_visibilidad_idx" ON "comentarios_tramite"("visibilidad");

-- AddForeignKey
ALTER TABLE "usuarios_internos" ADD CONSTRAINT "usuarios_internos_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_tramite" ADD CONSTRAINT "tipos_tramite_area_inicial_id_fkey" FOREIGN KEY ("area_inicial_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_tipo_tramite_id_fkey" FOREIGN KEY ("tipo_tramite_id") REFERENCES "tipos_tramite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_area_actual_id_fkey" FOREIGN KEY ("area_actual_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_usuario_asignado_id_fkey" FOREIGN KEY ("usuario_asignado_id") REFERENCES "usuarios_internos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_usuario_externo_id_fkey" FOREIGN KEY ("usuario_externo_id") REFERENCES "usuarios_externos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_tramite" ADD CONSTRAINT "movimientos_tramite_tramite_id_fkey" FOREIGN KEY ("tramite_id") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_tramite" ADD CONSTRAINT "documentos_tramite_tramite_id_fkey" FOREIGN KEY ("tramite_id") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_tramite" ADD CONSTRAINT "comentarios_tramite_tramite_id_fkey" FOREIGN KEY ("tramite_id") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
