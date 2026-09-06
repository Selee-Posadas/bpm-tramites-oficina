import { TipoTramite as PrismaTipoTramite } from '@prisma/client';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';

export class TipoTramiteMapper {
  static toDomain(raw: PrismaTipoTramite): TipoTramite {
    return new TipoTramite({
      id: raw.id,
      codigo: raw.codigo,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      activo: raw.activo,
      requiereExterno: raw.requiereExterno,
      permiteInicioExterno: raw.permiteInicioExterno,
      slaHoras: raw.slaHoras,
      areaInicialId: raw.areaInicialId,
      fechaCreacion: raw.fechaCreacion,
    });
  }

  static toPersistence(entity: TipoTramite): PrismaTipoTramite {
    return {
      id: entity.id,
      codigo: entity.codigo,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      activo: entity.activo,
      requiereExterno: entity.requiereExterno,
      permiteInicioExterno: entity.permiteInicioExterno,
      slaHoras: entity.slaHoras,
      areaInicialId: entity.areaInicialId,
      fechaCreacion: entity.fechaCreacion || new Date(),
    };
  }
}
