import {
  ComentarioTramite as PrismaComentarioTramite,
  TipoUsuario as PrismaTipoUsuario,
  VisibilidadComentario as PrismaVisibilidadComentario,
} from '@prisma/client';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { VisibilidadComentario } from '../../domain/enums/visibilidad-comentario.enum';

export class ComentarioMapper {
  static toDomain(raw: PrismaComentarioTramite): ComentarioTramite {
    return new ComentarioTramite({
      id: raw.id,
      tramiteId: raw.tramiteId,
      mensaje: raw.mensaje,
      visibilidad: raw.visibilidad as unknown as VisibilidadComentario,
      autorTipo: raw.autorTipo as unknown as TipoUsuario,
      autorId: raw.autorId,
      fecha: raw.fecha,
    });
  }

  static toPersistence(entity: ComentarioTramite): PrismaComentarioTramite {
    return {
      id: entity.id,
      tramiteId: entity.tramiteId,
      mensaje: entity.mensaje,
      visibilidad: entity.visibilidad as unknown as PrismaVisibilidadComentario,
      autorTipo: entity.autorTipo as unknown as PrismaTipoUsuario,
      autorId: entity.autorId,
      fecha: entity.fecha,
    };
  }
}
