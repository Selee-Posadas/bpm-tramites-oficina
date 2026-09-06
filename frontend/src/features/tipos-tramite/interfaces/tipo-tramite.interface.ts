export interface TipoTramite {
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

export interface TipoTramiteFormValues {
  codigo: string;
  nombre: string;
  descripcion: string;
  slaHoras: number;
  areaInicialId: string;
  requiereExterno: boolean;
  permiteInicioExterno: boolean;
  activo: boolean;
}
