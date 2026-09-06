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

export class InternoInternoWorkflow implements ITramiteWorkflow {
  validarTransicion(
    estadoActual: EstadoTramite,
    accion: AccionWorkflow,
    contexto: WorkflowContext,
  ): void {
    if (contexto.usuarioTipo !== TipoUsuario.INTERNO) {
      throw new UnauthorizedActionException('Solo personal interno puede operar en el circuito Interno-Interno');
    }

    if (contexto.rolInterno === RolInterno.AUDITOR) {
      throw new UnauthorizedActionException('Los usuarios con rol AUDITOR solo tienen permisos de lectura');
    }

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
      return;
    }

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

    switch (estadoActual) {
      case EstadoTramite.BORRADOR:
        if (accion !== AccionWorkflow.INGRESAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde BORRADOR solo se permite la acción INGRESAR',
          );
        }
        break;

      case EstadoTramite.INGRESADO:
        if (accion !== AccionWorkflow.TOMAR && accion !== AccionWorkflow.ASIGNAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Un trámite INGRESADO debe ser tomado o asignado a un operador',
          );
        }
        break;

      case EstadoTramite.EN_REVISION:
        if (
          accion !== AccionWorkflow.DERIVAR &&
          accion !== AccionWorkflow.APROBAR &&
          accion !== AccionWorkflow.RECHAZAR &&
          accion !== AccionWorkflow.ASIGNAR
        ) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Desde EN_REVISION solo se permite DERIVAR, APROBAR, RECHAZAR o REASIGNAR',
          );
        }
        if (accion === AccionWorkflow.DERIVAR) {
          if (!contexto.areaDestinoId) {
            throw new BusinessRuleValidationException('Es obligatorio especificar el área destino para derivar el trámite');
          }
        }
        break;

      case EstadoTramite.DERIVADO:
        if (accion !== AccionWorkflow.TOMAR && accion !== AccionWorkflow.ASIGNAR) {
          throw new InvalidStateTransitionException(
            estadoActual,
            accion,
            'Un trámite DERIVADO debe ser tomado en la nueva área para continuar la revisión',
          );
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
      case AccionWorkflow.TOMAR:
        return EstadoTramite.EN_REVISION;
      case AccionWorkflow.ASIGNAR:
        return estadoActual === EstadoTramite.INGRESADO ? EstadoTramite.EN_REVISION : estadoActual;
      case AccionWorkflow.DERIVAR:
        return EstadoTramite.DERIVADO;
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
          `Acción desconocida en InternoInternoWorkflow: ${accion}`,
        );
    }
  }
}
