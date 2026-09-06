import { Inject, Injectable } from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import {
  TipoTramiteResponseMapper,
  TipoTramiteResponseDto,
} from '../mappers/tipo-tramite-response.mapper';

export { TipoTramiteResponseDto };

@Injectable()
export class ListarTiposTramiteUseCase {
  constructor(
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(soloActivos = true): Promise<TipoTramiteResponseDto[]> {
    const tipos = await this.tipoTramiteRepository.findAll(soloActivos);
    return TipoTramiteResponseMapper.toListResponseDto(tipos);
  }
}
