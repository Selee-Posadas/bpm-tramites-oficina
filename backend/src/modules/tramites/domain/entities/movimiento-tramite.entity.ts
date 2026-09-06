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

export class MovimientoTramite {
  private props: MovimientoTramiteProps;

  constructor(props: MovimientoTramiteProps) {
    this.props = {
      ...props,
      fecha: props.fecha ?? new Date(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get tramiteId(): string {
    return this.props.tramiteId;
  }

  get estadoAnterior(): EstadoTramite | null {
    return this.props.estadoAnterior;
  }

  get estadoNuevo(): EstadoTramite {
    return this.props.estadoNuevo;
  }

  get areaAnteriorId(): string | null | undefined {
    return this.props.areaAnteriorId;
  }

  get areaNuevaId(): string | null | undefined {
    return this.props.areaNuevaId;
  }

  get usuarioTipo(): TipoUsuario {
    return this.props.usuarioTipo;
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get accion(): AccionWorkflow {
    return this.props.accion;
  }

  get comentario(): string | null | undefined {
    return this.props.comentario;
  }

  get metadata(): Record<string, unknown> | null | undefined {
    return this.props.metadata;
  }

  get fecha(): Date {
    return this.props.fecha || new Date();
  }
}
