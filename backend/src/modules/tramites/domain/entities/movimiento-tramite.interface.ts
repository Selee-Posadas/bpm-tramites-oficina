import { EstadoTramite } from '../enums/estado-tramite.enum';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { AccionWorkflow } from '../enums/accion-workflow.enum';

export interface MovimientoTramiteProps {
  id: string;
  tramiteId: string;
  estadoAnterior: EstadoTramite | null;
  estadoNuevo: EstadoTramite;
  areaAnteriorId?: string | null;
  areaNuevaId?: string | null;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
  accion: AccionWorkflow;
  comentario?: string | null;
  metadata?: Record<string, unknown> | null;
  fecha?: Date;
}

export type IMovimientoTramite = MovimientoTramiteProps;
