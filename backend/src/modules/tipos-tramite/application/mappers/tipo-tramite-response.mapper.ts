import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';

export interface TipoTramiteResponseDto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  slaHoras: number;
  requiereExterno: boolean;
  permiteInicioExterno: boolean;
  areaInicialId: string;
  fechaCreacion?: Date;
}

export class TipoTramiteResponseMapper {
  static toResponseDto(tipo: TipoTramite): TipoTramiteResponseDto {
    return {
      id: tipo.id,
      codigo: tipo.codigo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      activo: tipo.activo,
      slaHoras: tipo.slaHoras,
      requiereExterno: tipo.requiereExterno,
      permiteInicioExterno: tipo.permiteInicioExterno,
      areaInicialId: tipo.areaInicialId,
      fechaCreacion: tipo.fechaCreacion,
    };
  }

  static toListResponseDto(tipos: TipoTramite[]): TipoTramiteResponseDto[] {
    return tipos.map(TipoTramiteResponseMapper.toResponseDto);
  }
}
