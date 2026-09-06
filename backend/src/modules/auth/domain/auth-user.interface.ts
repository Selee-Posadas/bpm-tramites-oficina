import { TipoUsuario } from '../../tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../usuarios/domain/enums/rol-interno.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  tipo: TipoUsuario;
  rolInterno?: RolInterno;
  areaId?: string;
  organizacion?: string;
  documento?: string;
}
