import { Inject, Injectable } from '@nestjs/common';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import { Area } from '../../domain/entities/area.entity';

@Injectable()
export class ListarAreasUseCase {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(soloActivas = true): Promise<Area[]> {
    return await this.areaRepository.findAll(soloActivas);
  }
}
