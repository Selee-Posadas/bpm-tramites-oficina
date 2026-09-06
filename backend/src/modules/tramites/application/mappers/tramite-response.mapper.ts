import { Tramite } from '../../domain/entities/tramite.entity';
import { MovimientoTramite } from '../../domain/entities/movimiento-tramite.entity';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { TipoTramite } from '../../../tipos-tramite/domain/entities/tipo-tramite.entity';
import { SlaInfo } from '../../domain/services/sla-calculator.service';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import { PrioridadTramite } from '../../domain/enums/prioridad-tramite.enum';
import { OrigenTramite } from '../../domain/enums/origen-tramite.enum';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { VisibilidadComentario } from '../../domain/enums/visibilidad-comentario.enum';
import { WorkflowTransitionResponseDto } from '../dto/workflow-transition-response.dto';

export interface MovimientoResponseDto {
  id: string;
  estadoAnterior?: EstadoTramite | null;
  estadoNuevo: EstadoTramite;
  areaAnteriorId?: string | null;
  areaNuevaId?: string | null;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
  accion: AccionWorkflow;
  comentario?: string | null;
  metadata?: Record<string, unknown> | null;
  fecha: Date;
}

export interface DocumentoResponseDto {
  id: string;
  tramiteId?: string;
  nombreArchivo: string;
  mimeType: string;
  size: number;
  storageKey: string;
  subidoPorTipo: TipoUsuario;
  subidoPorId: string;
  fechaCarga: Date;
}

export interface ComentarioResponseDto {
  id: string;
  tramiteId?: string;
  mensaje: string;
  visibilidad: VisibilidadComentario;
  autorTipo: TipoUsuario;
  autorId: string;
  fecha: Date;
}

export interface TramiteDetalleResponseDto {
  id: string;
  numero: string;
  tipoTramiteId: string;
  tipoTramiteNombre: string;
  tipoTramiteCodigo?: string | null;
  titulo: string;
  descripcion: string;
  origen: OrigenTramite;
  estado: EstadoTramite;
  prioridad: PrioridadTramite;
  areaActualId?: string | null;
  usuarioAsignadoId?: string | null;
  usuarioExternoId?: string | null;
  creadoPorTipo: TipoUsuario;
  creadoPorId: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date | null;
  sla: SlaInfo;
  movimientos: MovimientoResponseDto[];
  documentos: DocumentoResponseDto[];
  comentarios: ComentarioResponseDto[];
}

export interface TramiteItemResponseDto {
  id: string;
  numero: string;
  tipoTramiteId: string;
  tipoTramiteNombre: string;
  titulo: string;
  descripcion: string;
  origen: OrigenTramite;
  estado: EstadoTramite;
  prioridad: PrioridadTramite;
  areaActualId?: string | null;
  usuarioAsignadoId?: string | null;
  usuarioExternoId?: string | null;
  creadoPorTipo: TipoUsuario;
  creadoPorId: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date | null;
  sla: SlaInfo;
}

export interface ListarTramitesResponseDto {
  items: TramiteItemResponseDto[];
  total: number;
  skip: number;
  take: number;
}

export interface TramiteCreadoResponseDto {
  id: string;
  numero: string;
  tipoTramiteId: string;
  estado: EstadoTramite;
  origen: OrigenTramite;
  titulo: string;
  prioridad: PrioridadTramite;
  areaActualId?: string | null;
  usuarioExternoId?: string | null;
  fechaCreacion: Date;
}

export interface ModificarBorradorResponseDto {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTramite;
  fechaActualizacion: Date;
}

export class TramiteResponseMapper {
  static toDetalleDto(
    tramite: Tramite,
    tipoTramite: TipoTramite | null,
    slaInfo: SlaInfo,
    comentariosVisibles: readonly ComentarioTramite[],
  ): TramiteDetalleResponseDto {
    return {
      id: tramite.id,
      numero: tramite.numero,
      tipoTramiteId: tramite.tipoTramiteId,
      tipoTramiteNombre: tipoTramite?.nombre || 'Trámite',
      tipoTramiteCodigo: tipoTramite?.codigo,
      titulo: tramite.titulo,
      descripcion: tramite.descripcion,
      origen: tramite.origen,
      estado: tramite.estado,
      prioridad: tramite.prioridad,
      areaActualId: tramite.areaActualId,
      usuarioAsignadoId: tramite.usuarioAsignadoId,
      usuarioExternoId: tramite.usuarioExternoId,
      creadoPorTipo: tramite.creadoPorTipo,
      creadoPorId: tramite.creadoPorId,
      fechaCreacion: tramite.fechaCreacion,
      fechaActualizacion: tramite.fechaActualizacion,
      fechaCierre: tramite.fechaCierre,
      sla: slaInfo,
      movimientos: tramite.movimientos.map(TramiteResponseMapper.toMovimientoDto),
      documentos: tramite.documentos.map(TramiteResponseMapper.toDocumentoDto),
      comentarios: comentariosVisibles.map(TramiteResponseMapper.toComentarioDto),
    };
  }

  static toMovimientoDto(m: MovimientoTramite): MovimientoResponseDto {
    return {
      id: m.id,
      estadoAnterior: m.estadoAnterior,
      estadoNuevo: m.estadoNuevo,
      areaAnteriorId: m.areaAnteriorId,
      areaNuevaId: m.areaNuevaId,
      usuarioTipo: m.usuarioTipo,
      usuarioId: m.usuarioId,
      accion: m.accion,
      comentario: m.comentario,
      metadata: m.metadata,
      fecha: m.fecha,
    };
  }

  static toDocumentoDto(d: DocumentoTramite): DocumentoResponseDto {
    return {
      id: d.id,
      tramiteId: d.tramiteId,
      nombreArchivo: d.nombreArchivo,
      mimeType: d.mimeType,
      size: d.size,
      storageKey: d.storageKey,
      subidoPorTipo: d.subidoPorTipo,
      subidoPorId: d.subidoPorId,
      fechaCarga: d.fechaCarga,
    };
  }

  static toComentarioDto(c: ComentarioTramite): ComentarioResponseDto {
    return {
      id: c.id,
      tramiteId: c.tramiteId,
      mensaje: c.mensaje,
      visibilidad: c.visibilidad,
      autorTipo: c.autorTipo,
      autorId: c.autorId,
      fecha: c.fecha,
    };
  }

  static toItemDto(
    t: Tramite,
    tipo: TipoTramite | undefined,
    slaInfo: SlaInfo,
  ): TramiteItemResponseDto {
    return {
      id: t.id,
      numero: t.numero,
      tipoTramiteId: t.tipoTramiteId,
      tipoTramiteNombre: tipo?.nombre || 'Trámite',
      titulo: t.titulo,
      descripcion: t.descripcion,
      origen: t.origen,
      estado: t.estado,
      prioridad: t.prioridad,
      areaActualId: t.areaActualId,
      usuarioAsignadoId: t.usuarioAsignadoId,
      usuarioExternoId: t.usuarioExternoId,
      creadoPorTipo: t.creadoPorTipo,
      creadoPorId: t.creadoPorId,
      fechaCreacion: t.fechaCreacion,
      fechaActualizacion: t.fechaActualizacion,
      fechaCierre: t.fechaCierre,
      sla: slaInfo,
    };
  }

  static toListDto(
    items: TramiteItemResponseDto[],
    total: number,
    skip: number,
    take: number,
  ): ListarTramitesResponseDto {
    return {
      items,
      total,
      skip,
      take,
    };
  }

  static toCreadoDto(tramite: Tramite): TramiteCreadoResponseDto {
    return {
      id: tramite.id,
      numero: tramite.numero,
      tipoTramiteId: tramite.tipoTramiteId,
      estado: tramite.estado,
      origen: tramite.origen,
      titulo: tramite.titulo,
      prioridad: tramite.prioridad,
      areaActualId: tramite.areaActualId,
      usuarioExternoId: tramite.usuarioExternoId,
      fechaCreacion: tramite.fechaCreacion,
    };
  }

  static toModificadoDto(tramite: Tramite): ModificarBorradorResponseDto {
    return {
      id: tramite.id,
      numero: tramite.numero,
      titulo: tramite.titulo,
      descripcion: tramite.descripcion,
      prioridad: tramite.prioridad,
      fechaActualizacion: tramite.fechaActualizacion,
    };
  }

  static toTransitionDto(tramite: Tramite): WorkflowTransitionResponseDto {
    return {
      id: tramite.id,
      numero: tramite.numero,
      estado: tramite.estado,
      usuarioAsignadoId: tramite.usuarioAsignadoId,
      areaActualId: tramite.areaActualId,
    };
  }
}
