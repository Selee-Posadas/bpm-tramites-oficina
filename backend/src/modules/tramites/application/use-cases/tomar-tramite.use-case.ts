import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import {
  EntityNotFoundException,
  ConcurrencyConflictException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';

export interface TomarTramiteCommand {
  tramiteId: string;
  contexto: WorkflowContext;
}

@Injectable()
export class TomarTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: TomarTramiteCommand): Promise<Tramite> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    // Validación de concurrencia: si ya está asignado a otro operador
    if (tramite.usuarioAsignadoId && tramite.usuarioAsignadoId !== command.contexto.usuarioId) {
      throw new ConcurrencyConflictException('El trámite ya ha sido tomado por otro operador');
    }

    // Validación de área: operadores solo pueden tomar trámites de su área asignada
    if (
      command.contexto.rolInterno === RolInterno.OPERADOR &&
      command.contexto.areaUsuarioId &&
      tramite.areaActualId &&
      command.contexto.areaUsuarioId !== tramite.areaActualId
    ) {
      throw new UnauthorizedActionException(
        'Los operadores solo pueden tomar trámites correspondientes a su área asignada',
      );
    }

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.TOMAR,
      command.contexto,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    if (this.tramiteRepository.updateIfUnassigned) {
      return await this.tramiteRepository.updateIfUnassigned(tramite);
    }
    return await this.tramiteRepository.update(tramite);
  }
}
