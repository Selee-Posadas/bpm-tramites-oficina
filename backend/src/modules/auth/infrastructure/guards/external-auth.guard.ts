import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { FastifyAuthRequest } from '../interfaces/auth-request.interface';
import { extractBearerToken } from '../utils/auth-header.util';

interface JwtExternalPayload {
  sub: string;
  email: string;
  nombre: string;
  tipo: string;
}

@Injectable()
export class ExternalAuthGuard implements CanActivate {
  private readonly logger = new Logger(ExternalAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyAuthRequest>();
    const token = extractBearerToken(request);

    if (!token) {
      this.logger.warn(
        `[ExternalAuthGuard] Acceso rechazado (401): Header Authorization ausente, inválido o sin prefijo Bearer. Ruta: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }

    try {
      const payload = this.jwtService.verify<JwtExternalPayload>(token);

      if (payload.tipo !== TipoUsuario.EXTERNO) {
        this.logger.warn(
          `[ExternalAuthGuard] Acceso rechazado (403): Intento de acceso a recurso externo con identidad tipo "${payload.tipo}". Usuario ID: ${payload.sub}, Email: ${payload.email}, Ruta: ${request.method} ${request.url}`,
        );
        throw new ForbiddenException('No tiene permisos para acceder a este recurso');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        nombre: payload.nombre,
        tipo: TipoUsuario.EXTERNO,
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.warn(
        `[ExternalAuthGuard] Acceso rechazado (401): Verificación de token fallida. Causa: ${(error as Error).message}. Ruta: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
