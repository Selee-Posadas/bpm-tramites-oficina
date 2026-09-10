import { Inject, Injectable } from '@nestjs/common';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import { Area } from '../../domain/entities/area.entity';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class ObtenerAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(id: string): Promise<Area> {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new EntityNotFoundException('Área', id);
    }
    return area;
  }
}
