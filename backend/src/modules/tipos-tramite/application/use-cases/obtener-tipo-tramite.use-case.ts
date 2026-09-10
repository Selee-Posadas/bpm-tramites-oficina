import { Inject, Injectable } from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class ObtenerTipoTramiteUseCase {
  constructor(
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(id: string): Promise<TipoTramite> {
    const tipo = await this.tipoTramiteRepository.findById(id);
    if (!tipo) {
      throw new EntityNotFoundException('Tipo de trámite', id);
    }
    return tipo;
  }
}
