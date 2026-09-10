import { Inject, Injectable } from '@nestjs/common';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import { Area } from '../../domain/entities/area.entity';
import {
  EntityNotFoundException,
  DuplicateEntityException,
} from '../../../../shared/domain/exceptions/domain.exception';

export interface ActualizarAreaCommand {
  id: string;
  nombre?: string;
  codigo?: string;
  activa?: boolean;
}

@Injectable()
export class ActualizarAreaUseCase {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(command: ActualizarAreaCommand): Promise<Area> {
    const area = await this.areaRepository.findById(command.id);
    if (!area) {
      throw new EntityNotFoundException('Área', command.id);
    }

    if (command.codigo && command.codigo !== area.codigo) {
      const existing = await this.areaRepository.findByCodigo(command.codigo);
      if (existing && existing.id !== area.id) {
        throw new DuplicateEntityException('Área', 'código', command.codigo);
      }
    }

    if (command.nombre || command.codigo) {
      area.actualizar(
        command.nombre ?? area.nombre,
        command.codigo ?? area.codigo,
      );
    }

    if (command.activa !== undefined) {
      if (command.activa) {
        area.activar();
      } else {
        area.desactivar();
      }
    }

    return await this.areaRepository.update(area);
  }
}
