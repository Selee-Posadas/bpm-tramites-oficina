import { EstadoUsuarioExterno } from '../enums/estado-usuario-externo.enum';

export interface UsuarioExternoProps {
  id: string;
  nombre: string;
  email: string;
  passwordHash?: string;
  documento: string;
  organizacion: string;
  estado: EstadoUsuarioExterno;
  fechaAlta?: Date;
  fechaActualizacion?: Date;
}

export type IUsuarioExterno = UsuarioExternoProps;
