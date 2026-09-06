import { EstadoTramite } from '../enums/estado-tramite.enum';
import { AccionWorkflow } from '../enums/accion-workflow.enum';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';

export interface WorkflowContext {
  usuarioTipo: TipoUsuario;
  usuarioId: string;
  rolInterno?: RolInterno;
  areaUsuarioId?: string;
  areaDestinoId?: string;
  usuarioExternoId?: string;
  motivo?: string;
}

export interface ITramiteWorkflow {
  validarTransicion(estadoActual: EstadoTramite, accion: AccionWorkflow, contexto: WorkflowContext): void;
  determinarProximoEstado(estadoActual: EstadoTramite, accion: AccionWorkflow, contexto: WorkflowContext): EstadoTramite;
}
