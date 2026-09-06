import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { FastifyAuthRequest } from '../interfaces/auth-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolInterno[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyAuthRequest>();
    const user = request.user;

    if (!user || !user.rolInterno) {
      this.logger.warn(
        `[RolesGuard] Acceso rechazado (403): Usuario sin rol interno asignado o no autenticado. Usuario ID: ${user?.id || 'anónimo'}, Ruta: ${request.method} ${request.url}`,
      );
      throw new ForbiddenException('No tiene permisos para acceder a este recurso');
    }

    const hasRole = requiredRoles.includes(user.rolInterno);
    if (!hasRole) {
      this.logger.warn(
        `[RolesGuard] Acceso rechazado (403): Permisos insuficientes. Usuario ID: ${user.id}, Rol actual: "${user.rolInterno}". Roles requeridos: [${requiredRoles.join(', ')}]. Ruta: ${request.method} ${request.url}`,
      );
      // Prevención estricta de Information Leakage: mensaje genérico y opaco hacia el cliente
      throw new ForbiddenException('No tiene permisos para acceder a este recurso');
    }

    return true;
  }
}
