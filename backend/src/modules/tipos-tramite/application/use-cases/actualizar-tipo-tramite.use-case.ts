import { Inject, Injectable } from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  TipoTramiteResponseMapper,
  TipoTramiteResponseDto,
} from '../mappers/tipo-tramite-response.mapper';

export interface ActualizarTipoTramiteCommand {
  id: string;
  slaHoras?: number;
  activo?: boolean;
}

@Injectable()
export class ActualizarTipoTramiteUseCase {
  constructor(
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(command: ActualizarTipoTramiteCommand): Promise<TipoTramiteResponseDto> {
    const tipo = await this.tipoTramiteRepository.findById(command.id);
    if (!tipo) {
      throw new EntityNotFoundException('Tipo de trámite', command.id);
    }

    if (command.slaHoras !== undefined) {
      tipo.actualizarSla(command.slaHoras);
    }

    if (command.activo !== undefined) {
      if (command.activo) {
        tipo.activar();
      } else {
        tipo.desactivar();
      }
    }

    const updated = await this.tipoTramiteRepository.update(tipo);
    return TipoTramiteResponseMapper.toResponseDto(updated);
  }
}
