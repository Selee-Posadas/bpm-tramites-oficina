import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { FastifyAuthRequest } from '../interfaces/auth-request.interface';
import { extractBearerToken } from '../utils/auth-header.util';

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
  private readonly logger = new Logger(AnyAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyAuthRequest>();
    const token = extractBearerToken(request);

    if (!token) {
      this.logger.warn(
        `[AnyAuthGuard] Acceso rechazado (401): Header Authorization ausente, inválido o sin prefijo Bearer. Ruta: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }

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
        this.logger.warn(
          `[AnyAuthGuard] Acceso rechazado (401): Tipo de identidad desconocido "${payload.tipo}". Usuario ID: ${payload.sub}, Ruta: ${request.method} ${request.url}`,
        );
        throw new UnauthorizedException('Token inválido o expirado');
      }

      return true;
    } catch (error) {
      this.logger.warn(
        `[AnyAuthGuard] Acceso rechazado (401): Verificación de token fallida. Causa: ${(error as Error).message}. Ruta: ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
