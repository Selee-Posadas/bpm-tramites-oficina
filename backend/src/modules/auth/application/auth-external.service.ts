import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterExternalDto } from '../dto/register-external.dto';
import { LoginExternalDto } from '../dto/login-external.dto';
import { TipoUsuario } from '../../tramites/domain/enums/tipo-usuario.enum';
import { EstadoUsuarioExterno } from '../../usuarios/domain/enums/estado-usuario-externo.enum';
import { AuthenticatedUser } from '../domain/auth-user.interface';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../usuarios/domain/repositories/usuario.repository.interface';
import { UsuarioExterno } from '../../usuarios/domain/entities/usuario-externo.entity';

export interface AuthTokenResponse {
  accessToken: string;
  user: AuthenticatedUser;
}

@Injectable()
export class AuthExternalService {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterExternalDto): Promise<AuthTokenResponse> {
    const existing = await this.usuarioRepository.findExternoByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('Ya existe un usuario registrado con ese correo electrónico');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const usuario = new UsuarioExterno({
      id: crypto.randomUUID(),
      nombre: dto.nombre,
      email: dto.email.toLowerCase(),
      passwordHash,
      documento: dto.documento,
      organizacion: dto.organizacion,
      estado: EstadoUsuarioExterno.ACTIVO,
      fechaAlta: new Date(),
      fechaActualizacion: new Date(),
    });

    const saved = await this.usuarioRepository.saveExterno(usuario);

    const authUser: AuthenticatedUser = {
      id: saved.id,
      email: saved.email,
      nombre: saved.nombre,
      tipo: TipoUsuario.EXTERNO,
      organizacion: saved.organizacion,
      documento: saved.documento,
    };

    const token = this.jwtService.sign({
      sub: saved.id,
      email: saved.email,
      tipo: TipoUsuario.EXTERNO,
      nombre: saved.nombre,
    });

    return {
      accessToken: token,
      user: authUser,
    };
  }

  async login(dto: LoginExternalDto): Promise<AuthTokenResponse> {
    const user = await this.usuarioRepository.findExternoByEmail(dto.email.toLowerCase());

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.estado === EstadoUsuarioExterno.BLOQUEADO) {
      throw new UnauthorizedException('Su cuenta se encuentra bloqueada');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: TipoUsuario.EXTERNO,
      organizacion: user.organizacion,
      documento: user.documento,
    };

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tipo: TipoUsuario.EXTERNO,
      nombre: user.nombre,
    });

    return {
      accessToken: token,
      user: authUser,
    };
  }

  async getMe(userId: string): Promise<AuthenticatedUser> {
    const user = await this.usuarioRepository.findExternoById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: TipoUsuario.EXTERNO,
      organizacion: user.organizacion,
      documento: user.documento,
    };
  }
}
