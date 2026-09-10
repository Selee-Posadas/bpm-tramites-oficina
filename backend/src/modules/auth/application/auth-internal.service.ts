import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginInternalMockDto } from '../dto/login-internal-mock.dto';
import { TipoUsuario } from '../../tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../usuarios/domain/enums/rol-interno.enum';
import { AuthenticatedUser } from '../domain/auth-user.interface';
import { AuthTokenResponse } from './auth-external.service';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../usuarios/domain/repositories/usuario.repository.interface';
import {
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../areas/domain/repositories/area.repository.interface';
import { UsuarioInterno } from '../../usuarios/domain/entities/usuario-interno.entity';
import { Area } from '../../areas/domain/entities/area.entity';

@Injectable()
export class AuthInternalService {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepository: IUsuarioRepository,
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
    private readonly jwtService: JwtService,
  ) {}

  async loginMock(dto: LoginInternalMockDto): Promise<AuthTokenResponse> {
    let user: UsuarioInterno | null = null;

    if (dto.email) {
      user = await this.usuarioRepository.findInternoByEmail(dto.email.toLowerCase());
    }

    if (!user && dto.rol) {
      user = await this.usuarioRepository.findInternoByRol(dto.rol);
    }

    if (!user) {
      let areas = await this.areaRepository.findAll(true);
      let area: Area | null = areas.length > 0 ? areas[0] : null;

      if (!area) {
        const nuevaArea = new Area({
          id: crypto.randomUUID(),
          nombre: 'Mesa General',
          codigo: 'MESA-GEN',
          activa: true,
          fechaCreacion: new Date(),
        });
        area = await this.areaRepository.save(nuevaArea);
      }

      const rol = dto.rol ?? RolInterno.OPERADOR;
      const nuevoUsuario = new UsuarioInterno({
        id: crypto.randomUUID(),
        nombre: `Usuario ${rol}`,
        email: `${rol.toLowerCase()}@bpm.local`,
        rol,
        areaId: area.id,
        activo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      });

      user = await this.usuarioRepository.saveInterno(nuevoUsuario);
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: TipoUsuario.INTERNO,
      rolInterno: user.rol,
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
    const user = await this.usuarioRepository.findInternoById(userId);

    if (!user) {
      throw new NotFoundException('Usuario interno no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: TipoUsuario.INTERNO,
      rolInterno: user.rol,
      areaId: user.areaId,
    };
  }
}
