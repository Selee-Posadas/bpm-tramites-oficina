import { SlaInfoProps } from '../../../shared/components/Badges/SlaBadge';
import { AuthUser } from '../../auth/interfaces/auth.interface';
import { Area } from '../../areas/interfaces/area.interface';
import { TipoTramite } from '../../tipos-tramite/interfaces/tipo-tramite.interface';
import { CreateTramiteRequestDto } from './tramite.api.interface';

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
  website?: string;
}

export type WorkflowDialogType =
  | 'INGRESAR'
  | 'TOMAR'
  | 'ASIGNAR'
  | 'DERIVAR'
  | 'OBSERVAR'
  | 'RESPONDER_OBSERVACION'
  | 'SOLICITAR_INTERVENCION'
  | 'RESPONDER_INTERVENCION'
  | 'APROBAR'
  | 'RECHAZAR'
  | 'CERRAR'
  | 'CANCELAR'
  | null;

export interface WorkflowActionBarProps {
  tramite: TramiteDetalle;
  user: AuthUser | null;
  areas?: Area[];
  isActionLoading?: boolean;
  onIngresar: () => Promise<boolean>;
  onTomar: () => Promise<boolean>;
  onAsignar: (operadorId: string, motivo?: string) => Promise<boolean>;
  onDerivar: (areaDestinoId: string, motivo?: string) => Promise<boolean>;
  onObservar: (motivo: string) => Promise<boolean>;
  onResponderObservacion: (respuesta: string) => Promise<boolean>;
  onSolicitarIntervencionExterna: (motivo: string) => Promise<boolean>;
  onResponderIntervencionExterna: (respuesta: string) => Promise<boolean>;
  onAprobar: (motivo?: string) => Promise<boolean>;
  onRechazar: (motivo: string) => Promise<boolean>;
  onCerrar: (motivo?: string) => Promise<boolean>;
  onCancelar: (motivo: string) => Promise<boolean>;
}

export interface DocumentosSectionProps {
  documentos: DocumentoItem[];
  user: AuthUser | null;
  isLoading?: boolean;
  onAdjuntar: (doc: { nombreArchivo: string; mimeType: string; size: number; storageKey: string }) => Promise<boolean>;
  onEliminar: (docId: string) => Promise<boolean>;
}

export interface DocumentoTableProps {
  documentos: DocumentoItem[];
  user: AuthUser | null;
  isLoading?: boolean;
  onEliminar: (docId: string) => Promise<boolean>;
}

export interface DocumentoUploadModalProps {
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (doc: { nombreArchivo: string; mimeType: string; size: number; storageKey: string }) => Promise<boolean>;
}

export interface DerivarModalProps {
  open: boolean;
  areas: Area[];
  areaActualId?: string | null;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (areaDestinoId: string, motivo: string) => Promise<boolean>;
}

export interface WorkflowDialogConfigItem {
  title: string;
  description: string;
  confirmText: string;
  confirmColor: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
  requireReason?: boolean;
  reasonLabel?: string;
  execute: (reason?: string) => Promise<boolean>;
}

export interface ComentariosSectionProps {
  comentarios: ComentarioItem[];
  user: AuthUser | null;
  isLoading?: boolean;
  onAgregarComentario: (mensaje: string, visibilidad: 'INTERNA' | 'EXTERNA' | 'TODOS') => Promise<boolean>;
}

export interface TramiteTableProps {
  tramites: TramiteResumen[];
  total: number;
  skip: number;
  take: number;
  onPageChange: (newPage: number) => void;
  basePath?: string;
}

export interface TramiteFilterBarProps {
  filtros: TramiteFiltros;
  areas: Area[];
  tiposTramite: TipoTramite[];
  onFiltrosChange: (nuevosFiltros: Partial<TramiteFiltros>) => void;
  onReset: () => void;
  rolUsuario?: string;
  areaUsuarioId?: string;
}

export interface TramiteCreateFormProps {
  tiposTramite: TipoTramite[];
  isInternal?: boolean;
  isLoading?: boolean;
  backHref: string;
  onSubmit: (values: CreateTramiteRequestDto) => Promise<void>;
}
