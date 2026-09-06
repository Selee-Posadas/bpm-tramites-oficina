import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { AuthenticatedUser } from '../../domain/auth-user.interface';

interface JwtInternalPayload {
  sub: string;
  email: string;
  nombre: string;
  tipo: string;
  rol: string;
  areaId: string;
}

@Injectable()
export class InternalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user: AuthenticatedUser }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización no provisto o con formato inválido');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify<JwtInternalPayload>(token);

      if (payload.tipo !== TipoUsuario.INTERNO) {
        throw new ForbiddenException('No tiene permisos para acceder al portal o recursos internos con un token externo');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        nombre: payload.nombre,
        tipo: TipoUsuario.INTERNO,
        rolInterno: payload.rol as unknown as RolInterno,
        areaId: payload.areaId,
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
