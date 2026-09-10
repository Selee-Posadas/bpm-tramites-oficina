import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { FastifyAuthRequest } from '../interfaces/auth-request.interface';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../../tramites/domain/repositories/tramite.repository.interface';

interface TramiteRouteParams {
  id?: string;
  tramiteId?: string;
}

@Injectable()
export class TramiteOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(TramiteOwnershipGuard.name);

  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyAuthRequest<{ Params: TramiteRouteParams }>>();

    const user = request.user;
    if (!user) {
      this.logger.warn(
        `[TramiteOwnershipGuard] Acceso rechazado (403): Usuario no presente en contexto de la solicitud. Ruta: ${request.method} ${request.url}`,
      );
      throw new ForbiddenException('No tiene permisos para acceder a este recurso');
    }

    if (user.tipo === TipoUsuario.INTERNO) {
      return true;
    }

    const params = request.params as TramiteRouteParams | undefined;
    const tramiteId = params?.id || params?.tramiteId;
    if (!tramiteId) {
      return true;
    }

    const tramite = await this.tramiteRepository.findById(tramiteId);

    if (!tramite) {
      this.logger.warn(
        `[TramiteOwnershipGuard] Recurso no encontrado (404): Trámite ID "${tramiteId}" inexistente. Usuario ID: ${user.id}, Ruta: ${request.method} ${request.url}`,
      );
      throw new NotFoundException('Trámite no encontrado');
    }

    const esPropietario =
      tramite.usuarioExternoId === user.id || tramite.creadoPorId === user.id;

    if (!esPropietario) {
      this.logger.warn(
        `[TramiteOwnershipGuard] Acceso rechazado (403): Usuario externo intentó acceder a trámite ajeno. Usuario ID: ${user.id}, Trámite ID: ${tramite.id}, Dueño: ${tramite.usuarioExternoId || tramite.creadoPorId}, Ruta: ${request.method} ${request.url}`,
      );
      throw new ForbiddenException('No tiene permisos para acceder a este recurso');
    }

    return true;
  }
}
