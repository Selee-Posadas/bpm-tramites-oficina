import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';

export interface WorkflowTransitionResponseDto {
  id: string;
  numero: string;
  estado: EstadoTramite;
  usuarioAsignadoId?: string | null;
  areaActualId?: string | null;
}
