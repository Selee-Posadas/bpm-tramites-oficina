import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import {
  EntityNotFoundException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';

export interface AsignarTramiteCommand {
  tramiteId: string;
  nuevoOperadorId: string;
  contexto: WorkflowContext;
}

@Injectable()
export class AsignarTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: AsignarTramiteCommand): Promise<Tramite> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    // Regla de negocio: Solo SUPERVISOR y ADMIN pueden reasignar
    if (
      command.contexto.rolInterno !== RolInterno.SUPERVISOR &&
      command.contexto.rolInterno !== RolInterno.ADMIN
    ) {
      throw new UnauthorizedActionException(
        'Solo los usuarios con rol SUPERVISOR o ADMIN tienen permisos para reasignar trámites',
      );
    }

    // Si es supervisor, debe pertenecer al área actual del trámite
    if (
      command.contexto.rolInterno === RolInterno.SUPERVISOR &&
      command.contexto.areaUsuarioId &&
      tramite.areaActualId &&
      command.contexto.areaUsuarioId !== tramite.areaActualId
    ) {
      throw new UnauthorizedActionException(
        'Un supervisor solo puede reasignar trámites pertenecientes a su propia área',
      );
    }

    const contextWithTarget: WorkflowContext = {
      ...command.contexto,
      usuarioId: command.nuevoOperadorId,
    };

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.ASIGNAR,
      contextWithTarget,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    return await this.tramiteRepository.update(tramite);
  }
}
