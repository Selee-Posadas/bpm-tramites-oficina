import { Inject, Injectable } from '@nestjs/common';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import {
  AreaResponseMapper,
  AreaResponseDto,
} from '../mappers/area-response.mapper';

export { AreaResponseDto };

@Injectable()
export class ListarAreasUseCase {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(soloActivas = true): Promise<AreaResponseDto[]> {
    const areas = await this.areaRepository.findAll(soloActivas);
    return AreaResponseMapper.toListResponseDto(areas);
  }
}
