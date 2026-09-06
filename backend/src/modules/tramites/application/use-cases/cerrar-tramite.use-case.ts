import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';

export interface CerrarTramiteCommand {
  tramiteId: string;
  motivo?: string;
  contexto: WorkflowContext;
}

@Injectable()
export class CerrarTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: CerrarTramiteCommand): Promise<Tramite> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    const contextWithReason: WorkflowContext = {
      ...command.contexto,
      motivo: command.motivo || 'Cierre y archivo formal del trámite',
    };

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.CERRAR,
      contextWithReason,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    return await this.tramiteRepository.update(tramite);
  }
}
