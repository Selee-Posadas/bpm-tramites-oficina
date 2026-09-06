import { EstadoTramite } from '../enums/estado-tramite.enum';
import { OrigenTramite } from '../enums/origen-tramite.enum';
import { PrioridadTramite } from '../enums/prioridad-tramite.enum';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { MovimientoTramite } from './movimiento-tramite.entity';
import { DocumentoTramite } from './documento-tramite.entity';
import { ComentarioTramite } from './comentario-tramite.entity';

export interface TramiteProps {
  id: string;
  numero: string;
  tipoTramiteId: string;
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
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  fechaCierre?: Date | null;
  movimientos?: MovimientoTramite[];
  documentos?: DocumentoTramite[];
  comentarios?: ComentarioTramite[];
}

export type ITramite = TramiteProps;
