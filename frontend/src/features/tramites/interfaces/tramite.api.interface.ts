import { SlaInfoProps } from '../../../shared/components/Badges/SlaBadge';

export interface TramiteItemResponseDto {
  id: string;
  numero: string;
  tipoTramiteId: string;
  tipoTramiteNombre: string;
  titulo: string;
  descripcion: string;
  origen: string;
  estado: string;
  prioridad: string;
  areaActualId?: string | null;
  usuarioAsignadoId?: string | null;
  usuarioExternoId?: string | null;
  creadoPorTipo: string;
  creadoPorId: string;
  fechaCreacion: string | Date;
  fechaActualizacion: string | Date;
  fechaCierre?: string | Date | null;
  sla: SlaInfoProps;
}

export interface ListarTramitesResponseDto {
  items: TramiteItemResponseDto[];
  total: number;
  skip: number;
  take: number;
}

export interface MovimientoResponseDto {
  id: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  areaAnteriorId?: string | null;
  areaNuevaId?: string | null;
  usuarioTipo: string;
  usuarioId: string;
  accion: string;
  comentario?: string | null;
  metadata?: Record<string, unknown> | null;
  fecha: string | Date;
}

export interface DocumentoResponseDto {
  id: string;
  nombreArchivo: string;
  mimeType: string;
  size: number;
  storageKey: string;
  subidoPorTipo: string;
  subidoPorId: string;
  fechaCarga: string | Date;
}

export interface ComentarioResponseDto {
  id: string;
  mensaje: string;
  visibilidad: 'INTERNA' | 'EXTERNA' | 'TODOS';
  autorTipo: string;
  autorId: string;
  fecha: string | Date;
}

export interface TramiteDetalleResponseDto {
  id: string;
  numero: string;
  tipoTramiteId: string;
  tipoTramiteNombre: string;
  tipoTramiteCodigo?: string | null;
  titulo: string;
  descripcion: string;
  origen: string;
  estado: string;
  prioridad: string;
  areaActualId?: string | null;
  usuarioAsignadoId?: string | null;
  usuarioExternoId?: string | null;
  creadoPorTipo: string;
  creadoPorId: string;
  fechaCreacion: string | Date;
  fechaActualizacion: string | Date;
  fechaCierre?: string | Date | null;
  sla: SlaInfoProps;
  movimientos: MovimientoResponseDto[];
  documentos: DocumentoResponseDto[];
  comentarios: ComentarioResponseDto[];
}

export interface CreateTramiteRequestDto {
  tipoTramiteId: string;
  titulo: string;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  usuarioExternoId?: string;
}

export interface WorkflowTransitionResponseDto {
  id: string;
  numero: string;
  estado: string;
  areaActualId?: string | null;
  usuarioAsignadoId?: string | null;
  fechaActualizacion: string | Date;
  mensaje: string;
}
