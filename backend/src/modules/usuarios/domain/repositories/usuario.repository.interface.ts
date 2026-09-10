import { UsuarioInterno } from '../entities/usuario-interno.entity';
import { UsuarioExterno } from '../entities/usuario-externo.entity';
import { RolInterno } from '../enums/rol-interno.enum';

export interface IUsuarioRepository {
  findInternoById(id: string): Promise<UsuarioInterno | null>;
  findInternoByEmail(email: string): Promise<UsuarioInterno | null>;
  findInternoByRol(rol: RolInterno): Promise<UsuarioInterno | null>;
  findAllInternos(areaId?: string): Promise<UsuarioInterno[]>;
  saveInterno(usuario: UsuarioInterno): Promise<UsuarioInterno>;

  findExternoById(id: string): Promise<UsuarioExterno | null>;
  findExternoByEmail(email: string): Promise<UsuarioExterno | null>;
  saveExterno(usuario: UsuarioExterno): Promise<UsuarioExterno>;
}

export const USUARIO_REPOSITORY_TOKEN = Symbol('IUsuarioRepository');
