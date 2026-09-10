import { Area } from '@/features/areas/interfaces/area.interface';

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

export interface TipoTramiteEditValues {
  slaHoras: number;
  activo: boolean;
}

export interface TipoTramiteTableProps {
  tiposTramite: TipoTramite[];
  onEdit: (tipo: TipoTramite) => void;
}

export interface TipoTramiteCreateModalProps {
  open: boolean;
  areas: Area[];
  onClose: () => void;
  onSubmit: (values: TipoTramiteFormValues) => Promise<boolean>;
}

export interface TipoTramiteEditModalProps {
  open: boolean;
  tipo: TipoTramite | null;
  onClose: () => void;
  onSubmit: (id: string, values: { slaHoras?: number; activo?: boolean }) => Promise<boolean>;
}
