import { Inject, Injectable } from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';

@Injectable()
export class ListarTiposTramiteUseCase {
  constructor(
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(soloActivos = true): Promise<TipoTramite[]> {
    return await this.tipoTramiteRepository.findAll(soloActivos);
  }
}
