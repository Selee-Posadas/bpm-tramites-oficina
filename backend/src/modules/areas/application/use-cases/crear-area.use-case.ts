import { Inject, Injectable } from '@nestjs/common';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import { Area } from '../../domain/entities/area.entity';
import { DuplicateEntityException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  AreaResponseMapper,
  AreaResponseDto,
} from '../mappers/area-response.mapper';
import * as crypto from 'crypto';

export interface CrearAreaCommand {
  nombre: string;
  codigo: string;
  activa?: boolean;
}

@Injectable()
export class CrearAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(command: CrearAreaCommand): Promise<AreaResponseDto> {
    const existing = await this.areaRepository.findByCodigo(command.codigo);
    if (existing) {
      throw new DuplicateEntityException('Área', 'código', command.codigo);
    }

    const area = new Area({
      id: crypto.randomUUID(),
      nombre: command.nombre,
      codigo: command.codigo,
      activa: command.activa ?? true,
      fechaCreacion: new Date(),
    });

    const saved = await this.areaRepository.save(area);
    return AreaResponseMapper.toResponseDto(saved);
  }
}
