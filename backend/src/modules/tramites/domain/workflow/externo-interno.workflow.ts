import { EstadoTramite } from '../enums/estado-tramite.enum';
import { AccionWorkflow } from '../enums/accion-workflow.enum';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { ITramiteWorkflow, WorkflowContext } from './workflow.interface';
import {
  InvalidStateTransitionException,
  UnauthorizedActionException,
  BusinessRuleValidationException,
} from '../../../../shared/domain/exceptions/domain.exception';

export class ExternoInternoWorkflow implements ITramiteWorkflow {
  validarTransicion(
    estadoActual: EstadoTramite,
    accion: AccionWorkflow,
    contexto: WorkflowContext,
  ): void {
    // 1. Auditor no puede modificar nunca
    if (contexto.usuarioTipo === TipoUsuario.INTERNO && contexto.rolInterno === RolInterno.AUDITOR) {
      throw new UnauthorizedActionException('Los usuarios con rol AUDITOR solo tienen permisos de lectura');
    }

    // 2. Invariante fundamental: Ningún trámite en BORRADOR puede ser aprobado ni rechazado
    if (
      estadoActual === EstadoTramite.BORRADOR &&
      (accion === AccionWorkflow.APROBAR || accion === AccionWorkflow.RECHAZAR)
    ) {
      throw new InvalidStateTransitionException(
        estadoActual,
        accion === AccionWorkflow.APROBAR ? EstadoTramite.APROBADO : EstadoTramite.RECHAZADO,
        'No se puede aprobar ni rechazar un trámite en estado BORRADOR',
      );
    }

    // 3. Invariante: Solo se puede CERRAR un trámite en APROBADO, RECHAZADO o CANCELADO
    if (accion === AccionWorkflow.CERRAR) {
      if (
        estadoActual !== EstadoTramite.APROBADO &&
        estadoActual !== EstadoTramite.RECHAZADO &&
        estadoActual !== EstadoTramite.CANCELADO
      ) {
        throw new InvalidStateTransitionException(
          estadoActual,
          EstadoTramite.CERRADO,
          'Solo se puede cerrar un trámite que se encuentre previamente Aprobado, Rechazado o Cancelado',
        );
      }
      if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
        throw new UnauthorizedActionException('Solo un usuario interno puede cerrar un trámite');
      }
      return;
    }

    // 4. Invariante: CANCELAR
    if (accion === AccionWorkflow.CANCELAR) {
      if (
        estadoActual === EstadoTramite.APROBADO ||
        estadoActual === EstadoTramite.RECHAZADO ||
        estadoActual === EstadoTramite.CERRADO ||
        estadoActual === EstadoTramite.CANCELADO
      ) {
        throw new InvalidStateTransitionException(
          estadoActual,
          EstadoTramite.CANCELADO,
          'No se puede cancelar un trámite que ya ha concluido',
        );
      }
      return;
    }

    // 5. Transiciones específicas del circuito Externo -> Interno
    switch (estadoActual) {
      case EstadoTramite.BORRADOR:
        if (accion !== AccionWorkflow.INGRESAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde BORRADOR solo se permite la acción INGRESAR',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.EXTERNO) {
          throw new UnauthorizedActionException('En el circuito Externo-Interno, el ingreso debe ser realizado por un usuario externo');
        }
        break;

      case EstadoTramite.INGRESADO:
        if (accion !== AccionWorkflow.TOMAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Un trámite INGRESADO debe ser tomado para pasar a revisión',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
          throw new UnauthorizedActionException('Solo personal interno puede tomar un trámite ingresado');
        }
        break;

      case EstadoTramite.EN_REVISION:
        if (
          accion !== AccionWorkflow.OBSERVAR &&
          accion !== AccionWorkflow.APROBAR &&
          accion !== AccionWorkflow.RECHAZAR
        ) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde EN_REVISION solo se permite OBSERVAR, APROBAR o RECHAZAR',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
          throw new UnauthorizedActionException('Solo usuarios internos pueden dictaminar en la revisión');
        }
        if (accion === AccionWorkflow.OBSERVAR && (!contexto.motivo || contexto.motivo.trim().length === 0)) {
          throw new BusinessRuleValidationException('Es obligatorio indicar el motivo de la observación');
        }
        break;

      case EstadoTramite.OBSERVADO:
        if (accion !== AccionWorkflow.RESPONDER_OBSERVACION) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Un trámite OBSERVADO solo puede ser continuado mediante RESPONDER_OBSERVACION',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.EXTERNO) {
          throw new UnauthorizedActionException('Solo el usuario externo puede responder una observación');
        }
        if (!contexto.motivo || contexto.motivo.trim().length === 0) {
          throw new BusinessRuleValidationException('Es obligatorio incluir una respuesta a la observación');
        }
        break;

      default:
        throw new InvalidStateTransitionException(
          estadoActual,
          accion,
          `No hay transiciones válidas configuradas para la acción ${accion} desde el estado ${estadoActual}`,
        );
    }
  }

  determinarProximoEstado(
    estadoActual: EstadoTramite,
    accion: AccionWorkflow,
    contexto: WorkflowContext,
  ): EstadoTramite {
    this.validarTransicion(estadoActual, accion, contexto);

    switch (accion) {
      case AccionWorkflow.INGRESAR:
        return EstadoTramite.INGRESADO;
      case AccionWorkflow.TOMAR:
        return EstadoTramite.EN_REVISION;
      case AccionWorkflow.OBSERVAR:
        return EstadoTramite.OBSERVADO;
      case AccionWorkflow.RESPONDER_OBSERVACION:
        return EstadoTramite.INGRESADO;
      case AccionWorkflow.APROBAR:
        return EstadoTramite.APROBADO;
      case AccionWorkflow.RECHAZAR:
        return EstadoTramite.RECHAZADO;
      case AccionWorkflow.CANCELAR:
        return EstadoTramite.CANCELADO;
      case AccionWorkflow.CERRAR:
        return EstadoTramite.CERRADO;
      default:
        throw new InvalidStateTransitionException(
          estadoActual,
          accion,
          `Acción desconocida en ExternoInternoWorkflow: ${accion}`,
        );
    }
  }
}
