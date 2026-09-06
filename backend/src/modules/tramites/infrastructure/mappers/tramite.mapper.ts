import {
  Tramite as PrismaTramite,
  MovimientoTramite as PrismaMovimientoTramite,
  DocumentoTramite as PrismaDocumentoTramite,
  ComentarioTramite as PrismaComentarioTramite,
  OrigenTramite as PrismaOrigenTramite,
  EstadoTramite as PrismaEstadoTramite,
  PrioridadTramite as PrismaPrioridadTramite,
  TipoUsuario as PrismaTipoUsuario,
} from '@prisma/client';
import { Tramite } from '../../domain/entities/tramite.entity';
import { OrigenTramite } from '../../domain/enums/origen-tramite.enum';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import { PrioridadTramite } from '../../domain/enums/prioridad-tramite.enum';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { MovimientoMapper } from './movimiento.mapper';
import { DocumentoMapper } from './documento.mapper';
import { ComentarioMapper } from './comentario.mapper';

export type PrismaTramiteWithRelations = PrismaTramite & {
  movimientos?: PrismaMovimientoTramite[];
  documentos?: PrismaDocumentoTramite[];
  comentarios?: PrismaComentarioTramite[];
};

export class TramiteMapper {
  static toDomain(raw: PrismaTramiteWithRelations): Tramite {
    const movimientos = raw.movimientos?.map(MovimientoMapper.toDomain) || [];
    const documentos = raw.documentos?.map(DocumentoMapper.toDomain) || [];
    const comentarios = raw.comentarios?.map(ComentarioMapper.toDomain) || [];

    return new Tramite({
      id: raw.id,
      numero: raw.numero,
      tipoTramiteId: raw.tipoTramiteId,
      titulo: raw.titulo,
      descripcion: raw.descripcion,
      origen: raw.origen as unknown as OrigenTramite,
      estado: raw.estado as unknown as EstadoTramite,
      prioridad: raw.prioridad as unknown as PrioridadTramite,
      areaActualId: raw.areaActualId,
      usuarioAsignadoId: raw.usuarioAsignadoId,
      usuarioExternoId: raw.usuarioExternoId,
      creadoPorTipo: raw.creadoPorTipo as unknown as TipoUsuario,
      creadoPorId: raw.creadoPorId,
      fechaCreacion: raw.fechaCreacion,
      fechaActualizacion: raw.fechaActualizacion,
      fechaCierre: raw.fechaCierre,
      movimientos,
      documentos,
      comentarios,
    });
  }

  static toPersistence(entity: Tramite): PrismaTramite {
    return {
      id: entity.id,
      numero: entity.numero,
      tipoTramiteId: entity.tipoTramiteId,
      titulo: entity.titulo,
      descripcion: entity.descripcion,
      origen: entity.origen as unknown as PrismaOrigenTramite,
      estado: entity.estado as unknown as PrismaEstadoTramite,
      prioridad: entity.prioridad as unknown as PrismaPrioridadTramite,
      areaActualId: entity.areaActualId || null,
      usuarioAsignadoId: entity.usuarioAsignadoId || null,
      usuarioExternoId: entity.usuarioExternoId || null,
      creadoPorTipo: entity.creadoPorTipo as unknown as PrismaTipoUsuario,
      creadoPorId: entity.creadoPorId,
      fechaCreacion: entity.fechaCreacion,
      fechaActualizacion: entity.fechaActualizacion,
      fechaCierre: entity.fechaCierre || null,
    };
  }
}
