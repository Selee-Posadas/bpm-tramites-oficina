import { UsuarioInterno } from '../../domain/entities/usuario-interno.entity';
import { RolInterno } from '../../domain/enums/rol-interno.enum';

export interface UsuarioInternoResponseDto {
  id: string;
  email: string;
  nombre: string;
  rol: RolInterno;
  areaId?: string;
  activo: boolean;
}

export class UsuarioResponseMapper {
  static toInternoResponseDto(user: UsuarioInterno): UsuarioInternoResponseDto {
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      areaId: user.areaId,
      activo: user.activo,
    };
  }

  static toListInternosResponseDto(users: UsuarioInterno[]): UsuarioInternoResponseDto[] {
    return users.map(UsuarioResponseMapper.toInternoResponseDto);
  }
}
