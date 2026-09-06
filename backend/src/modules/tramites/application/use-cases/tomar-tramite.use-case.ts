import { Inject, Injectable } from '@nestjs/common';
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
import { WorkflowTransitionResponseDto } from '../dto/workflow-transition-response.dto';
import { TramiteResponseMapper } from '../mappers/tramite-response.mapper';
import * as crypto from 'crypto';

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

  async execute(command: TomarTramiteCommand): Promise<WorkflowTransitionResponseDto> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    if (tramite.usuarioAsignadoId && tramite.usuarioAsignadoId !== command.contexto.usuarioId) {
      throw new ConcurrencyConflictException('El trámite ya ha sido tomado por otro operador');
    }

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
    let updated = tramite;
    if (this.tramiteRepository.updateIfUnassigned) {
      updated = await this.tramiteRepository.updateIfUnassigned(tramite);
    } else {
      updated = await this.tramiteRepository.update(tramite);
    }

    return TramiteResponseMapper.toTransitionDto(updated);
  }
}
