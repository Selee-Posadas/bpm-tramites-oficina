import { TipoTramiteResponseDto } from '../interfaces/tipo-tramite.api.interface';
import { TipoTramite } from '../interfaces/tipo-tramite.interface';

export class TipoTramiteAdapter {
  static toDomain(dto: TipoTramiteResponseDto): TipoTramite {
    return {
      id: dto.id,
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      slaHoras: dto.slaHoras,
      areaInicialId: dto.areaInicialId,
      requiereExterno: dto.requiereExterno,
      permiteInicioExterno: dto.permiteInicioExterno,
      activo: dto.activo,
    };
  }

  static toDomainList(dtos: TipoTramiteResponseDto[]): TipoTramite[] {
    return dtos.map(this.toDomain);
  }
}
