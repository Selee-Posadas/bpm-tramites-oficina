import { Area } from '../../domain/entities/area.entity';

export interface AreaResponseDto {
  id: string;
  nombre: string;
  codigo: string;
  activa: boolean;
  fechaCreacion?: Date;
}

export class AreaResponseMapper {
  static toResponseDto(area: Area): AreaResponseDto {
    return {
      id: area.id,
      nombre: area.nombre,
      codigo: area.codigo,
      activa: area.activa,
      fechaCreacion: area.fechaCreacion,
    };
  }

  static toListResponseDto(areas: Area[]): AreaResponseDto[] {
    return areas.map(AreaResponseMapper.toResponseDto);
  }
}
