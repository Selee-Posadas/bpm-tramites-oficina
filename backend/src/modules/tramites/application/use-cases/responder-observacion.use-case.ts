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

export interface ResponderObservacionCommand {
  tramiteId: string;
  respuesta: string;
  contexto: WorkflowContext;
}

@Injectable()
export class ResponderObservacionUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: ResponderObservacionCommand): Promise<Tramite> {
    if (!command.respuesta || command.respuesta.trim().length === 0) {
      throw new BusinessRuleValidationException('El mensaje de respuesta a la observación es obligatorio');
    }

    if (command.contexto.usuarioTipo !== TipoUsuario.EXTERNO) {
      throw new UnauthorizedActionException('Solo el solicitante externo puede responder a una observación');
    }

    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    const contextWithReason: WorkflowContext = {
      ...command.contexto,
      motivo: command.respuesta,
    };

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.RESPONDER_OBSERVACION,
      contextWithReason,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    return await this.tramiteRepository.update(tramite);
  }
}
