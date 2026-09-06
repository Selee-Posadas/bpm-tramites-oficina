export interface TipoTramiteResponseDto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  slaHoras: number;
  areaInicialId: string;
  requiereExterno: boolean;
  permiteInicioExterno: boolean;
  activo: boolean;
}

export interface CreateTipoTramiteRequestDto {
  codigo: string;
  nombre: string;
  descripcion: string;
  slaHoras: number;
  areaInicialId: string;
  requiereExterno?: boolean;
  permiteInicioExterno?: boolean;
  activo?: boolean;
}

export interface UpdateTipoTramiteRequestDto {
  slaHoras?: number;
  activo?: boolean;
}
