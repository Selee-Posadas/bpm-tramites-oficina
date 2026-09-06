import { RolInterno } from '../enums/rol-interno.enum';

export interface UsuarioInternoProps {
  id: string;
  nombre: string;
  email: string;
  areaId: string;
  rol: RolInterno;
  azureObjectId?: string | null;
  activo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export type IUsuarioInterno = UsuarioInternoProps;
