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
import { AuthenticatedUser } from '../../domain/auth-user.interface';

interface JwtExternalPayload {
  sub: string;
  email: string;
  nombre: string;
  tipo: string;
}

@Injectable()
export class ExternalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user: AuthenticatedUser }>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización no provisto o con formato inválido');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify<JwtExternalPayload>(token);

      if (payload.tipo !== TipoUsuario.EXTERNO) {
        throw new ForbiddenException('No tiene permisos para acceder como usuario externo con un token corporativo');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        nombre: payload.nombre,
        tipo: TipoUsuario.EXTERNO,
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
