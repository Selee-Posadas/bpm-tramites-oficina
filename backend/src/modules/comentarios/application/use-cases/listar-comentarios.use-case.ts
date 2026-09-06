import { Inject, Injectable } from '@nestjs/common';
import { ComentarioTramite } from '../../../tramites/domain/entities/comentario-tramite.entity';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../../tramites/domain/repositories/tramite.repository.interface';
import { EntityNotFoundException, UnauthorizedActionException } from '../../../../shared/domain/exceptions/domain.exception';

export interface ListarComentariosQuery {
  tramiteId: string;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
}

@Injectable()
export class ListarComentariosUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  async execute(query: ListarComentariosQuery): Promise<ComentarioTramite[]> {
    const tramite = await this.tramiteRepository.findById(query.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', query.tramiteId);
    }

    if (query.usuarioTipo === TipoUsuario.EXTERNO) {
      const participa =
        tramite.usuarioExternoId === query.usuarioId ||
        (tramite.creadoPorTipo === TipoUsuario.EXTERNO && tramite.creadoPorId === query.usuarioId);

      if (!participa) {
        throw new UnauthorizedActionException('No tiene permisos para acceder a los comentarios de este trámite');
      }

      // Regla fundamental de seguridad: Comentarios internos nunca deben ser visibles para externos
      return tramite.comentarios.filter((comentario) => comentario.esVisibleParaExterno()) as ComentarioTramite[];
    }

    return [...tramite.comentarios] as ComentarioTramite[];
  }
}
