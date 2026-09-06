import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { LoginInternalMockDto } from '../dto/login-internal-mock.dto';
import { TipoUsuario } from '../../tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../usuarios/domain/enums/rol-interno.enum';
import { AuthenticatedUser } from '../domain/auth-user.interface';
import { AuthTokenResponse } from './auth-external.service';

@Injectable()
export class AuthInternalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginMock(dto: LoginInternalMockDto): Promise<AuthTokenResponse> {
    let user = null;

    if (dto.email) {
      user = await this.prisma.usuarioInterno.findUnique({
        where: { email: dto.email.toLowerCase() },
        include: { area: true },
      });
    }

    if (!user) {
      user = await this.prisma.usuarioInterno.findFirst({
        where: { rol: dto.rol as unknown as RolInterno, activo: true },
        include: { area: true },
      });
    }

    if (!user) {
      let area = await this.prisma.area.findFirst();
      if (!area) {
        area = await this.prisma.area.create({
          data: {
            nombre: 'Mesa General',
            codigo: 'MESA-GEN',
            activa: true,
          },
        });
      }

      user = await this.prisma.usuarioInterno.create({
        data: {
          nombre: `Usuario ${dto.rol}`,
          email: `${dto.rol.toLowerCase()}@bpm.local`,
          rol: dto.rol as unknown as RolInterno,
          areaId: area.id,
          activo: true,
        },
        include: { area: true },
      });
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: TipoUsuario.INTERNO,
      rolInterno: user.rol as unknown as RolInterno,
      areaId: user.areaId,
    };

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tipo: TipoUsuario.INTERNO,
      rol: user.rol,
      areaId: user.areaId,
      nombre: user.nombre,
    });

    return {
      accessToken: token,
      user: authUser,
    };
  }

  async getInternalMe(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.usuarioInterno.findUnique({
      where: { id: userId },
      include: { area: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario interno no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: TipoUsuario.INTERNO,
      rolInterno: user.rol as unknown as RolInterno,
      areaId: user.areaId,
    };
  }
}
