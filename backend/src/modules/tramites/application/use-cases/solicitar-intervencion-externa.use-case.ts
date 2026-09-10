import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import {
  EntityNotFoundException,
  BusinessRuleValidationException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import * as crypto from 'crypto';

export interface SolicitarIntervencionExternaCommand {
  tramiteId: string;
  motivo: string;
  contexto: WorkflowContext;
}

@Injectable()
export class SolicitarIntervencionExternaUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: SolicitarIntervencionExternaCommand): Promise<Tramite> {
    if (!command.motivo || command.motivo.trim().length === 0) {
      throw new BusinessRuleValidationException('El motivo de la solicitud de intervención es obligatorio');
    }

    if (command.contexto.usuarioTipo !== TipoUsuario.INTERNO) {
      throw new UnauthorizedActionException('Solo personal interno puede solicitar intervención externa');
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
      AccionWorkflow.SOLICITAR_INTERVENCION_EXTERNA,
      contextWithReason,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    return await this.tramiteRepository.update(tramite);
  }
}
