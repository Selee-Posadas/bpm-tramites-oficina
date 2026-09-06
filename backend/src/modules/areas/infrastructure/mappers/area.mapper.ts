import { Area as PrismaArea } from '@prisma/client';
import { Area } from '../../domain/entities/area.entity';

export class AreaMapper {
  static toDomain(raw: PrismaArea): Area {
    return new Area({
      id: raw.id,
      nombre: raw.nombre,
      codigo: raw.codigo,
      activa: raw.activa,
      fechaCreacion: raw.fechaCreacion,
    });
  }

  static toPersistence(entity: Area): PrismaArea {
    return {
      id: entity.id,
      nombre: entity.nombre,
      codigo: entity.codigo,
      activa: entity.activa,
      fechaCreacion: entity.fechaCreacion || new Date(),
    };
  }
}
