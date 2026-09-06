import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TipoUsuario } from '../../../tramites/domain/enums/tipo-usuario.enum';
import { AuthenticatedUser } from '../../domain/auth-user.interface';

@Injectable()
export class TramiteOwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      FastifyRequest<{ Params: { id?: string; tramiteId?: string } }> & { user?: AuthenticatedUser }
    >();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado en el contexto de la solicitud');
    }

    // Los usuarios internos tienen sus propios controles de acceso y roles
    if (user.tipo === TipoUsuario.INTERNO) {
      return true;
    }

    const tramiteId = request.params?.id || request.params?.tramiteId;
    if (!tramiteId) {
      return true;
    }

    const tramite = await this.prisma.tramite.findUnique({
      where: { id: tramiteId },
      select: {
        id: true,
        usuarioExternoId: true,
        creadoPorId: true,
      },
    });

    if (!tramite) {
      throw new NotFoundException(`Trámite con id ${tramiteId} no encontrado`);
    }

    const esPropietario =
      tramite.usuarioExternoId === user.id || tramite.creadoPorId === user.id;

    if (!esPropietario) {
      throw new ForbiddenException(
        'Acceso denegado: No tiene permisos para acceder o modificar un trámite que no le pertenece',
      );
    }

    return true;
  }
}
