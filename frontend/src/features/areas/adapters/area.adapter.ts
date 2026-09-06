import { AreaResponseDto } from '../interfaces/area.api.interface';
import { Area } from '../interfaces/area.interface';

export class AreaAdapter {
  static toDomain(dto: AreaResponseDto): Area {
    return {
      id: dto.id,
      nombre: dto.nombre,
      codigo: dto.codigo,
      activa: dto.activa,
    };
  }

  static toDomainList(dtos: AreaResponseDto[]): Area[] {
    return dtos.map(this.toDomain);
  }
}
