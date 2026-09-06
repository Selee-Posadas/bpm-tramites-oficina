import { Inject, Injectable } from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import {
  EntityNotFoundException,
  UnauthorizedActionException,
  BusinessRuleValidationException,
} from '../../../../shared/domain/exceptions/domain.exception';

export interface EliminarTramiteBorradorCommand {
  tramiteId: string;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
}

export interface EliminarTramiteBorradorResponseDto {
  message: string;
}

@Injectable()
export class EliminarTramiteBorradorUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  async execute(command: EliminarTramiteBorradorCommand): Promise<EliminarTramiteBorradorResponseDto> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    if (tramite.estado !== EstadoTramite.BORRADOR) {
      throw new BusinessRuleValidationException(
        'Solo se pueden eliminar trámites en estado BORRADOR',
      );
    }

    if (
      command.usuarioTipo === TipoUsuario.EXTERNO &&
      tramite.usuarioExternoId !== command.usuarioId
    ) {
      throw new UnauthorizedActionException(
        'No tiene permisos para eliminar este trámite',
      );
    }

    await this.tramiteRepository.delete(command.tramiteId);
    return { message: 'Trámite borrador eliminado con éxito' };
  }
}
