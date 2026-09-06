import { Inject, Injectable } from '@nestjs/common';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import {
  IComentarioTramiteRepository,
  COMENTARIO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/comentario-tramite.repository.interface';
import {
  TramiteResponseMapper,
  ComentarioResponseDto,
} from '../mappers/tramite-response.mapper';

export { ComentarioResponseDto };

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

  async execute(query: ListarComentariosQuery): Promise<ComentarioResponseDto[]> {
    const soloVisiblesParaExterno = query.usuarioTipo === TipoUsuario.EXTERNO;
    const comentarios = await this.comentarioRepository.findByTramiteId(
      query.tramiteId,
      soloVisiblesParaExterno,
    );

    return comentarios.map(TramiteResponseMapper.toComentarioDto);
  }
}
