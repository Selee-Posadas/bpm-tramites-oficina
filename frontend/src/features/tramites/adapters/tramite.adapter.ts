import {
  ComentarioResponseDto,
  DocumentoResponseDto,
  MovimientoResponseDto,
  TramiteDetalleResponseDto,
  TramiteItemResponseDto,
} from '../interfaces/tramite.api.interface';
import {
  ComentarioItem,
  DocumentoItem,
  MovimientoItem,
  TramiteDetalle,
  TramiteResumen,
} from '../interfaces/tramite.interface';

export class TramiteAdapter {
  static toResumen(dto: TramiteItemResponseDto): TramiteResumen {
    return {
      id: dto.id,
      numero: dto.numero,
      tipoTramiteId: dto.tipoTramiteId,
      tipoTramiteNombre: dto.tipoTramiteNombre,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      origen: dto.origen,
      estado: dto.estado,
      prioridad: dto.prioridad,
      areaActualId: dto.areaActualId,
      usuarioAsignadoId: dto.usuarioAsignadoId,
      usuarioExternoId: dto.usuarioExternoId,
      creadoPorTipo: dto.creadoPorTipo,
      creadoPorId: dto.creadoPorId,
      fechaCreacion: new Date(dto.fechaCreacion),
      fechaActualizacion: new Date(dto.fechaActualizacion),
      fechaCierre: dto.fechaCierre ? new Date(dto.fechaCierre) : null,
      sla: dto.sla,
    };
  }

  static toResumenList(dtos: TramiteItemResponseDto[]): TramiteResumen[] {
    return dtos.map(this.toResumen);
  }

  static toMovimiento(dto: MovimientoResponseDto): MovimientoItem {
    return {
      id: dto.id,
      estadoAnterior: dto.estadoAnterior,
      estadoNuevo: dto.estadoNuevo,
      areaAnteriorId: dto.areaAnteriorId,
      areaNuevaId: dto.areaNuevaId,
      usuarioTipo: dto.usuarioTipo,
      usuarioId: dto.usuarioId,
      accion: dto.accion,
      comentario: dto.comentario,
      metadata: dto.metadata,
      fecha: new Date(dto.fecha),
    };
  }

  static toDocumento(dto: DocumentoResponseDto): DocumentoItem {
    return {
      id: dto.id,
      nombreArchivo: dto.nombreArchivo,
      mimeType: dto.mimeType,
      size: dto.size,
      storageKey: dto.storageKey,
      subidoPorTipo: dto.subidoPorTipo,
      subidoPorId: dto.subidoPorId,
      fechaCarga: new Date(dto.fechaCarga),
    };
  }

  static toComentario(dto: ComentarioResponseDto): ComentarioItem {
    return {
      id: dto.id,
      mensaje: dto.mensaje,
      visibilidad: dto.visibilidad,
      autorTipo: dto.autorTipo,
      autorId: dto.autorId,
      fecha: new Date(dto.fecha),
    };
  }

  static toDetalle(dto: TramiteDetalleResponseDto): TramiteDetalle {
    return {
      id: dto.id,
      numero: dto.numero,
      tipoTramiteId: dto.tipoTramiteId,
      tipoTramiteNombre: dto.tipoTramiteNombre,
      tipoTramiteCodigo: dto.tipoTramiteCodigo,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      origen: dto.origen,
      estado: dto.estado,
      prioridad: dto.prioridad,
      areaActualId: dto.areaActualId,
      usuarioAsignadoId: dto.usuarioAsignadoId,
      usuarioExternoId: dto.usuarioExternoId,
      creadoPorTipo: dto.creadoPorTipo,
      creadoPorId: dto.creadoPorId,
      fechaCreacion: new Date(dto.fechaCreacion),
      fechaActualizacion: new Date(dto.fechaActualizacion),
      fechaCierre: dto.fechaCierre ? new Date(dto.fechaCierre) : null,
      sla: dto.sla,
      movimientos: (dto.movimientos || []).map(this.toMovimiento),
      documentos: (dto.documentos || []).map(this.toDocumento),
      comentarios: (dto.comentarios || []).map(this.toComentario),
    };
  }
}
