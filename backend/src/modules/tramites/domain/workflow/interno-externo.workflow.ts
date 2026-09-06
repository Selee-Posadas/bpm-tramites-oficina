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

export class InternoExternoWorkflow implements ITramiteWorkflow {
  validarTransicion(
    estadoActual: EstadoTramite,
    accion: AccionWorkflow,
    contexto: WorkflowContext,
  ): void {
    // 1. Auditor no puede modificar nunca
    if (contexto.usuarioTipo === TipoUsuario.INTERNO && contexto.rolInterno === RolInterno.AUDITOR) {
      throw new UnauthorizedActionException('Los usuarios con rol AUDITOR solo tienen permisos de lectura');
    }

    // 2. Invariante: Ningún trámite en BORRADOR puede ser aprobado ni rechazado
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

    // 4. Cancelación
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
          'No se puede cancelar un trámite finalizado',
        );
      }
      return;
    }

    // 5. Transiciones específicas del circuito Interno -> Externo
    switch (estadoActual) {
      case EstadoTramite.BORRADOR:
        if (accion !== AccionWorkflow.INGRESAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde BORRADOR solo se permite la acción INGRESAR',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
          throw new UnauthorizedActionException('En el circuito Interno-Externo, el inicio lo realiza personal interno');
        }
        break;

      case EstadoTramite.INGRESADO:
        if (
          accion !== AccionWorkflow.SOLICITAR_INTERVENCION_EXTERNA &&
          accion !== AccionWorkflow.TOMAR
        ) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde INGRESADO se debe solicitar la intervención externa o tomar para revisión previa',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
          throw new UnauthorizedActionException('Solo personal interno puede requerir intervención externa');
        }
        break;

      case EstadoTramite.ESPERANDO_EXTERNO:
        if (accion !== AccionWorkflow.RESPONDER_INTERVENCION_EXTERNA) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'El trámite está esperando la respuesta o documentación del usuario externo',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.EXTERNO) {
          throw new UnauthorizedActionException('Solo el usuario externo requerido puede responder esta intervención');
        }
        if (!contexto.motivo || contexto.motivo.trim().length === 0) {
          throw new BusinessRuleValidationException('Es obligatorio incluir una respuesta o detalle de la documentación aportada');
        }
        break;

      case EstadoTramite.ESPERANDO_INTERNO:
        if (accion !== AccionWorkflow.TOMAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Un trámite en ESPERANDO_INTERNO debe ser retomado por el operador interno',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
          throw new UnauthorizedActionException('Solo personal interno puede reanudar la revisión del trámite');
        }
        break;

      case EstadoTramite.EN_REVISION:
        if (
          accion !== AccionWorkflow.SOLICITAR_INTERVENCION_EXTERNA &&
          accion !== AccionWorkflow.APROBAR &&
          accion !== AccionWorkflow.RECHAZAR
        ) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde EN_REVISION solo se permite requerir nueva intervención externa, APROBAR o RECHAZAR',
          );
        }
        if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
          throw new UnauthorizedActionException('Solo personal interno puede dictaminar o requerir intervenciones');
        }
        break;

      default:
        throw new InvalidStateTransitionException(
          estadoActual,
          accion,
          `Acción ${accion} no permitida desde el estado actual ${estadoActual}`,
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
      case AccionWorkflow.SOLICITAR_INTERVENCION_EXTERNA:
        return EstadoTramite.ESPERANDO_EXTERNO;
      case AccionWorkflow.RESPONDER_INTERVENCION_EXTERNA:
        return EstadoTramite.ESPERANDO_INTERNO;
      case AccionWorkflow.TOMAR:
        return EstadoTramite.EN_REVISION;
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
          `Acción desconocida en InternoExternoWorkflow: ${accion}`,
        );
    }
  }
}
