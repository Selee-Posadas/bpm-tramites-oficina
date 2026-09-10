import {
  ApiSlaResponseDto,
  ComentarioResponseDto,
  CreateTramiteRequestDto,
  DocumentoResponseDto,
  MovimientoResponseDto,
  TramiteDetalleResponseDto,
  TramiteItemResponseDto,
} from '../interfaces/tramite.api.interface';
import {
  ComentarioItem,
  CreateTramiteFormValues,
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
      sla: TramiteAdapter.toSla(dto.sla),
    };
  }

  static toSla(dto: ApiSlaResponseDto) {
    const vencido = dto.vencido ?? dto.estaVencido ?? false;
    const horasRestantes =
      dto.horasRestantes !== undefined
        ? dto.horasRestantes
        : dto.minutosRestantes !== undefined
          ? Math.round(dto.minutosRestantes / 60)
          : 0;

    return {
      vencido,
      horasRestantes,
      porcentajeConsumido: dto.porcentajeConsumido ?? 0,
      fechaLimite: dto.fechaLimite,
    };
  }

  static toResumenList(dtos: TramiteItemResponseDto[]): TramiteResumen[] {
    return dtos.map((dto) => TramiteAdapter.toResumen(dto));
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
      sla: TramiteAdapter.toSla(dto.sla),
      movimientos: (dto.movimientos || []).map((m) => TramiteAdapter.toMovimiento(m)),
      documentos: (dto.documentos || []).map((d) => TramiteAdapter.toDocumento(d)),
      comentarios: (dto.comentarios || []).map((c) => TramiteAdapter.toComentario(c)),
    };
  }

  static toCreatePayload(
    values: CreateTramiteFormValues,
    isInternal = false,
  ): CreateTramiteRequestDto {
    const payload: CreateTramiteRequestDto = {
      tipoTramiteId: values.tipoTramiteId,
      titulo: values.titulo.trim(),
      descripcion: values.descripcion.trim(),
      prioridad: values.prioridad,
    };

    if (isInternal && values.usuarioExternoId && values.usuarioExternoId.trim() !== '') {
      payload.usuarioExternoId = values.usuarioExternoId.trim();
    }

    if (values.website && values.website.trim() !== '') {
      payload.website = values.website.trim();
    }

    return payload;
  }
}
