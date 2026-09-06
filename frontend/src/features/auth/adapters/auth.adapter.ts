import { AuthenticatedUserDto, AuthTokenResponseDto } from '../interfaces/auth.api.interface';
import { AuthUser, RolInterno, TipoUsuario } from '../interfaces/auth.interface';

export class AuthAdapter {
  static toUser(dto: AuthenticatedUserDto): AuthUser {
    return {
      id: dto.id,
      email: dto.email,
      nombre: dto.nombre,
      tipo: dto.tipo as TipoUsuario,
      rolInterno: dto.rolInterno ? (dto.rolInterno as RolInterno) : undefined,
      areaId: dto.areaId,
    };
  }

  static fromTokenResponse(dto: AuthTokenResponseDto): { token: string; user: AuthUser } {
    return {
      token: dto.accessToken,
      user: {
        id: dto.user.id,
        email: dto.user.email,
        nombre: dto.user.nombre,
        tipo: dto.user.tipo as TipoUsuario,
        rolInterno: dto.user.rolInterno ? (dto.user.rolInterno as RolInterno) : undefined,
        areaId: dto.user.areaId,
      },
    };
  }
}
