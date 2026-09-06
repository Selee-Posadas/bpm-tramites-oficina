import { Inject, Injectable } from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { PrioridadTramite } from '../../domain/enums/prioridad-tramite.enum';
import {
  EntityNotFoundException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';
import {
  TramiteResponseMapper,
  ModificarBorradorResponseDto,
} from '../mappers/tramite-response.mapper';

export { ModificarBorradorResponseDto };

export interface ModificarBorradorCommand {
  tramiteId: string;
  titulo?: string;
  descripcion?: string;
  prioridad?: PrioridadTramite;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
}

@Injectable()
export class ModificarBorradorUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  async execute(command: ModificarBorradorCommand): Promise<ModificarBorradorResponseDto> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    if (
      command.usuarioTipo === TipoUsuario.EXTERNO &&
      tramite.usuarioExternoId !== command.usuarioId
    ) {
      throw new UnauthorizedActionException(
        'No tiene permisos para modificar este trámite',
      );
    }

    tramite.modificarBorrador(
      command.titulo ?? tramite.titulo,
      command.descripcion ?? tramite.descripcion,
      command.prioridad ?? tramite.prioridad,
    );

    const updated = await this.tramiteRepository.update(tramite);
    return TramiteResponseMapper.toModificadoDto(updated);
  }
}
