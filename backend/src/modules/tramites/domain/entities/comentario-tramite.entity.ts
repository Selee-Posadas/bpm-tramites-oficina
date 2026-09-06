import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { VisibilidadComentario } from '../enums/visibilidad-comentario.enum';

export interface ComentarioTramiteProps {
  id: string;
  tramiteId: string;
  mensaje: string;
  visibilidad: VisibilidadComentario;
  autorTipo: TipoUsuario;
  autorId: string;
  fecha?: Date;
}

export class ComentarioTramite {
  private props: ComentarioTramiteProps;

  constructor(props: ComentarioTramiteProps) {
    if (!props.mensaje || props.mensaje.trim().length === 0) {
      throw new Error('El mensaje del comentario no puede estar vacío');
    }
    this.props = {
      ...props,
      visibilidad: props.visibilidad ?? VisibilidadComentario.INTERNA,
      fecha: props.fecha ?? new Date(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get tramiteId(): string {
    return this.props.tramiteId;
  }

  get mensaje(): string {
    return this.props.mensaje;
  }

  get visibilidad(): VisibilidadComentario {
    return this.props.visibilidad;
  }

  get autorTipo(): TipoUsuario {
    return this.props.autorTipo;
  }

  get autorId(): string {
    return this.props.autorId;
  }

  get fecha(): Date {
    return this.props.fecha || new Date();
  }

  esVisibleParaExterno(): boolean {
    return (
      this.props.visibilidad === VisibilidadComentario.EXTERNA ||
      this.props.visibilidad === VisibilidadComentario.TODOS
    );
  }
}
