import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { AuthenticatedUser } from '../../domain/auth-user.interface';

interface JwtGenericPayload {
  sub: string;
  email: string;
  nombre: string;
  tipo: string;
  rol?: string;
  areaId?: string;
}

@Injectable()
export class AnyAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user: AuthenticatedUser }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Token de autorización no provisto o con formato inválido',
      );
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify<JwtGenericPayload>(token);

      if (payload.tipo === TipoUsuario.INTERNO) {
        request.user = {
          id: payload.sub,
          email: payload.email,
          nombre: payload.nombre,
          tipo: TipoUsuario.INTERNO,
          rolInterno: payload.rol as unknown as RolInterno,
          areaId: payload.areaId,
        };
      } else if (payload.tipo === TipoUsuario.EXTERNO) {
        request.user = {
          id: payload.sub,
          email: payload.email,
          nombre: payload.nombre,
          tipo: TipoUsuario.EXTERNO,
        };
      } else {
        throw new UnauthorizedException('Tipo de token desconocido');
      }

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
