import {
  MovimientoTramite as PrismaMovimientoTramite,
  EstadoTramite as PrismaEstadoTramite,
  TipoUsuario as PrismaTipoUsuario,
  AccionWorkflow as PrismaAccionWorkflow,
  Prisma,
} from '@prisma/client';
import { MovimientoTramite } from '../../domain/entities/movimiento-tramite.entity';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';

export class MovimientoMapper {
  static toDomain(raw: PrismaMovimientoTramite): MovimientoTramite {
    return new MovimientoTramite({
      id: raw.id,
      tramiteId: raw.tramiteId,
      estadoAnterior: raw.estadoAnterior as unknown as EstadoTramite | null,
      estadoNuevo: raw.estadoNuevo as unknown as EstadoTramite,
      areaAnteriorId: raw.areaAnteriorId,
      areaNuevaId: raw.areaNuevaId,
      usuarioTipo: raw.usuarioTipo as unknown as TipoUsuario,
      usuarioId: raw.usuarioId,
      accion: raw.accion as unknown as AccionWorkflow,
      comentario: raw.comentario,
      metadata: raw.metadata as Record<string, unknown> | null,
      fecha: raw.fecha,
    });
  }

  static toPersistence(
    entity: MovimientoTramite,
  ): Prisma.MovimientoTramiteUncheckedCreateInput {
    return {
      id: entity.id,
      tramiteId: entity.tramiteId,
      estadoAnterior: (entity.estadoAnterior as unknown as PrismaEstadoTramite) || null,
      estadoNuevo: entity.estadoNuevo as unknown as PrismaEstadoTramite,
      areaAnteriorId: entity.areaAnteriorId || null,
      areaNuevaId: entity.areaNuevaId || null,
      usuarioTipo: entity.usuarioTipo as unknown as PrismaTipoUsuario,
      usuarioId: entity.usuarioId,
      accion: entity.accion as unknown as PrismaAccionWorkflow,
      comentario: entity.comentario || null,
      metadata: entity.metadata
        ? (entity.metadata as Prisma.InputJsonObject)
        : Prisma.JsonNull,
      fecha: entity.fecha,
    };
  }
}
