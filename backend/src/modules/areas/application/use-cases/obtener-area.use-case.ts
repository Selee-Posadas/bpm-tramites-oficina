import { Inject, Injectable } from '@nestjs/common';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  AreaResponseMapper,
  AreaResponseDto,
} from '../mappers/area-response.mapper';

@Injectable()
export class ObtenerAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(id: string): Promise<AreaResponseDto> {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new EntityNotFoundException('Área', id);
    }
    return AreaResponseMapper.toResponseDto(area);
  }
}
