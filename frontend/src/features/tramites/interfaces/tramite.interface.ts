import { SlaInfoProps } from '../../../shared/components/Badges/SlaBadge';

export interface TramiteResumen {
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
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date | null;
  sla: SlaInfoProps;
}

export interface MovimientoItem {
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
  fecha: Date;
}

export interface DocumentoItem {
  id: string;
  nombreArchivo: string;
  mimeType: string;
  size: number;
  storageKey: string;
  subidoPorTipo: string;
  subidoPorId: string;
  fechaCarga: Date;
}

export interface ComentarioItem {
  id: string;
  mensaje: string;
  visibilidad: 'INTERNA' | 'EXTERNA' | 'TODOS';
  autorTipo: string;
  autorId: string;
  fecha: Date;
}

export interface TramiteDetalle {
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
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date | null;
  sla: SlaInfoProps;
  movimientos: MovimientoItem[];
  documentos: DocumentoItem[];
  comentarios: ComentarioItem[];
}

export interface TramiteFiltros {
  estado?: string;
  areaId?: string;
  prioridad?: string;
  tipoTramiteId?: string;
  soloVencidos?: boolean;
  busqueda?: string;
  skip?: number;
  take?: number;
}

export interface CreateTramiteFormValues {
  tipoTramiteId: string;
  titulo: string;
  descripcion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  usuarioExternoId?: string;
}
