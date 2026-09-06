import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { WorkflowContext } from '../../domain/workflow/workflow.interface';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import {
  EntityNotFoundException,
  BusinessRuleValidationException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';

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
      throw new BusinessRuleValidationException('La respuesta a la observación es obligatoria');
    }

    // Regla de negocio: Un interno no puede responder como externo
    if (command.contexto.usuarioTipo !== TipoUsuario.EXTERNO) {
      throw new UnauthorizedActionException('Solo un usuario externo puede responder una observación');
    }

    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    // Regla de negocio: El usuario externo solo puede responder en su propio trámite
    if (tramite.usuarioExternoId && tramite.usuarioExternoId !== command.contexto.usuarioId) {
      throw new UnauthorizedActionException('No tiene permisos para responder observaciones en este trámite');
    }

    const contextWithAnswer: WorkflowContext = {
      ...command.contexto,
      motivo: command.respuesta,
    };

    const movimientoId = crypto.randomUUID();
    const movimiento = tramite.ejecutarTransicion(
      AccionWorkflow.RESPONDER_OBSERVACION,
      contextWithAnswer,
      movimientoId,
    );

    await this.movimientoRepository.save(movimiento);
    return await this.tramiteRepository.update(tramite);
  }
}
