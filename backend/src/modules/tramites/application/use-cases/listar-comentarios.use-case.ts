import { Inject, Injectable } from '@nestjs/common';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import {
  IComentarioTramiteRepository,
  COMENTARIO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/comentario-tramite.repository.interface';

export interface ListarComentariosQuery {
  tramiteId: string;
  usuarioTipo: TipoUsuario;
}

@Injectable()
export class ListarComentariosUseCase {
  constructor(
    @Inject(COMENTARIO_TRAMITE_REPOSITORY_TOKEN)
    private readonly comentarioRepository: IComentarioTramiteRepository,
  ) {}

  async execute(query: ListarComentariosQuery): Promise<ComentarioTramite[]> {
    const soloVisiblesExterno = query.usuarioTipo === TipoUsuario.EXTERNO;
    return await this.comentarioRepository.findByTramiteId(
      query.tramiteId,
      soloVisiblesExterno,
    );
  }
}
