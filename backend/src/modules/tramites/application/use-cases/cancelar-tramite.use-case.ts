import { Inject, Injectable } from '@nestjs/common';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import { EntityNotFoundException, BusinessRuleValidationException } from '../../../../shared/domain/exceptions/domain.exception';
import { WorkflowTransitionResponseDto } from '../dto/workflow-transition-response.dto';
import { TramiteResponseMapper } from '../mappers/tramite-response.mapper';
import * as crypto from 'crypto';

export interface CancelarTramiteCommand {
  tramiteId: string;
  motivo: string;
  contexto: WorkflowContext;
}

@Injectable()
export class CancelarTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: CancelarTramiteCommand): Promise<WorkflowTransitionResponseDto> {
    if (!command.motivo || command.motivo.trim().length === 0) {
      throw new BusinessRuleValidationException('El motivo de la cancelación es obligatorio');
    }

    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    const contextWithReason: WorkflowContext = {
      ...command.contexto,
      motivo: command.motivo,
    };

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.CANCELAR,
      contextWithReason,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    const updated = await this.tramiteRepository.update(tramite);
    return TramiteResponseMapper.toTransitionDto(updated);
  }
}
