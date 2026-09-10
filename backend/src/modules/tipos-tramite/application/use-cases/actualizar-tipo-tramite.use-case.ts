import { Inject, Injectable } from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';

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

  async execute(command: ActualizarTipoTramiteCommand): Promise<TipoTramite> {
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

    return await this.tipoTramiteRepository.update(tipo);
  }
}
