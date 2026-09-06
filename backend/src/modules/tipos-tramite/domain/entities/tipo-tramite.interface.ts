export interface TipoTramiteProps {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereExterno: boolean;
  permiteInicioExterno: boolean;
  slaHoras: number;
  areaInicialId: string;
  fechaCreacion?: Date;
}

export type ITipoTramite = TipoTramiteProps;
