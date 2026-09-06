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
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { FastifyAuthRequest } from '../interfaces/auth-request.interface';
import { extractBearerToken } from '../utils/auth-header.util';

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
  private readonly logger = new Logger(InternalAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyAuthRequest>();
    const token = extractBearerToken(request);

    if (!token) {
      this.logger.warn(
        `[InternalAuthGuard] Acceso rechazado (401): Header Authorization ausente, inválido o sin prefijo Bearer. Ruta: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }

    try {
      const payload = this.jwtService.verify<JwtInternalPayload>(token);

      // Aislamiento estricto de identidades: solo identidades internas permitidas
      if (payload.tipo !== TipoUsuario.INTERNO) {
        this.logger.warn(
          `[InternalAuthGuard] Acceso rechazado (403): Intento de acceso a recurso interno con identidad tipo "${payload.tipo}". Usuario ID: ${payload.sub}, Email: ${payload.email}, Ruta: ${request.method} ${request.url}`,
        );
        throw new ForbiddenException('No tiene permisos para acceder a este recurso');
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
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.warn(
        `[InternalAuthGuard] Acceso rechazado (401): Verificación de token fallida. Causa: ${(error as Error).message}. Ruta: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
