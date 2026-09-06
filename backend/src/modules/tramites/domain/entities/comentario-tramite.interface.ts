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

export type IComentarioTramite = ComentarioTramiteProps;
