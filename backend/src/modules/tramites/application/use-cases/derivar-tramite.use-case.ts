import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import { IAreaRepository, AREA_REPOSITORY_TOKEN } from '../../../areas/domain/repositories/area.repository.interface';
import {
  EntityNotFoundException,
  BusinessRuleValidationException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { WorkflowTransitionResponseDto } from '../dto/workflow-transition-response.dto';
import { TramiteResponseMapper } from '../mappers/tramite-response.mapper';
import * as crypto from 'crypto';

export interface DerivarTramiteCommand {
  tramiteId: string;
  areaDestinoId: string;
  motivo?: string;
  contexto: WorkflowContext;
}

@Injectable()
export class DerivarTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  async execute(command: DerivarTramiteCommand): Promise<WorkflowTransitionResponseDto> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    const areaDestino = await this.areaRepository.findById(command.areaDestinoId);
    if (!areaDestino) {
      throw new EntityNotFoundException('Área Destino', command.areaDestinoId);
    }
    if (!areaDestino.activa) {
      throw new BusinessRuleValidationException('El área destino se encuentra inactiva');
    }
    if (tramite.areaActualId === command.areaDestinoId) {
      throw new BusinessRuleValidationException('El trámite ya se encuentra actualmente en esa área');
    }

    const contextWithDestination: WorkflowContext = {
      ...command.contexto,
      areaDestinoId: command.areaDestinoId,
      motivo: command.motivo,
    };

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.DERIVAR,
      contextWithDestination,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    const updated = await this.tramiteRepository.update(tramite);
    return TramiteResponseMapper.toTransitionDto(updated);
  }
}
