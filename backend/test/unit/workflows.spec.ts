import { EstadoTramite } from '../../src/modules/tramites/domain/enums/estado-tramite.enum';
import { AccionWorkflow } from '../../src/modules/tramites/domain/enums/accion-workflow.enum';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../src/modules/usuarios/domain/enums/rol-interno.enum';
import { ExternoInternoWorkflow } from '../../src/modules/tramites/domain/workflow/externo-interno.workflow';
import { InternoInternoWorkflow } from '../../src/modules/tramites/domain/workflow/interno-interno.workflow';
import { InternoExternoWorkflow } from '../../src/modules/tramites/domain/workflow/interno-externo.workflow';
import {
  InvalidStateTransitionException,
  UnauthorizedActionException,
  BusinessRuleValidationException,
} from '../../src/shared/domain/exceptions/domain.exception';

describe('Workflows y Máquinas de Estado (Domain Core)', () => {
  describe('Circuito 1: Externo → Interno', () => {
    const workflow = new ExternoInternoWorkflow();
    const externalContext = {
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: 'ext-123',
    };
    const operatorContext = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'op-456',
      rolInterno: RolInterno.OPERADOR,
    };
    const auditorContext = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'aud-789',
      rolInterno: RolInterno.AUDITOR,
    };

    it('debe completar el flujo exitoso completo', () => {
      // 1. BORRADOR -> INGRESADO
      const s1 = workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.INGRESAR, externalContext);
      expect(s1).toBe(EstadoTramite.INGRESADO);

      // 2. INGRESADO -> EN_REVISION (Tomar)
      const s2 = workflow.determinarProximoEstado(s1, AccionWorkflow.TOMAR, operatorContext);
      expect(s2).toBe(EstadoTramite.EN_REVISION);

      // 3. EN_REVISION -> OBSERVADO
      const s3 = workflow.determinarProximoEstado(s2, AccionWorkflow.OBSERVAR, {
        ...operatorContext,
        motivo: 'Falta adjuntar constancia de CUIT',
      });
      expect(s3).toBe(EstadoTramite.OBSERVADO);

      // 4. OBSERVADO -> INGRESADO (Respuesta externo)
      const s4 = workflow.determinarProximoEstado(s3, AccionWorkflow.RESPONDER_OBSERVACION, {
        ...externalContext,
        motivo: 'Se adjunta la constancia solicitada',
      });
      expect(s4).toBe(EstadoTramite.INGRESADO);

      // 5. INGRESADO -> EN_REVISION (Retomar)
      const s5 = workflow.determinarProximoEstado(s4, AccionWorkflow.TOMAR, operatorContext);
      expect(s5).toBe(EstadoTramite.EN_REVISION);

      // 6. EN_REVISION -> APROBADO
      const s6 = workflow.determinarProximoEstado(s5, AccionWorkflow.APROBAR, operatorContext);
      expect(s6).toBe(EstadoTramite.APROBADO);

      // 7. APROBADO -> CERRADO
      const s7 = workflow.determinarProximoEstado(s6, AccionWorkflow.CERRAR, operatorContext);
      expect(s7).toBe(EstadoTramite.CERRADO);
    });

    it('no debe permitir aprobar ni rechazar un trámite en BORRADOR (BPM-11)', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.APROBAR, operatorContext),
      ).toThrow(InvalidStateTransitionException);

      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.RECHAZAR, operatorContext),
      ).toThrow(InvalidStateTransitionException);
    });

    it('no debe permitir cerrar un trámite que no esté Aprobado, Rechazado o Cancelado (BPM-12)', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.CERRAR, operatorContext),
      ).toThrow(InvalidStateTransitionException);

      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.INGRESADO, AccionWorkflow.CERRAR, operatorContext),
      ).toThrow(InvalidStateTransitionException);

      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.EN_REVISION, AccionWorkflow.CERRAR, operatorContext),
      ).toThrow(InvalidStateTransitionException);

      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.OBSERVADO, AccionWorkflow.CERRAR, operatorContext),
      ).toThrow(InvalidStateTransitionException);
    });

    it('un usuario externo no puede ejecutar acciones internas como TOMAR o APROBAR', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.INGRESADO, AccionWorkflow.TOMAR, externalContext),
      ).toThrow(UnauthorizedActionException);

      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.EN_REVISION, AccionWorkflow.APROBAR, externalContext),
      ).toThrow(UnauthorizedActionException);
    });

    it('un usuario interno no puede responder observaciones como externo', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.OBSERVADO, AccionWorkflow.RESPONDER_OBSERVACION, {
          ...operatorContext,
          motivo: 'Intento de respuesta indebida',
        }),
      ).toThrow(UnauthorizedActionException);
    });

    it('un usuario con rol AUDITOR no puede ejecutar ninguna transición de mutación (SEC-11)', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.INGRESADO, AccionWorkflow.TOMAR, auditorContext),
      ).toThrow(UnauthorizedActionException);

      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.EN_REVISION, AccionWorkflow.APROBAR, auditorContext),
      ).toThrow(UnauthorizedActionException);
    });

    it('observar requiere obligatoriamente un motivo', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.EN_REVISION, AccionWorkflow.OBSERVAR, {
          ...operatorContext,
          motivo: '',
        }),
      ).toThrow(BusinessRuleValidationException);
    });
  });

  describe('Circuito 2: Interno → Interno', () => {
    const workflow = new InternoInternoWorkflow();
    const operatorContext = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'op-1',
      rolInterno: RolInterno.OPERADOR,
      areaUsuarioId: 'area-a',
    };

    it('debe ejecutar el flujo completo con derivación entre áreas', () => {
      // BORRADOR -> INGRESADO
      const s1 = workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.INGRESAR, operatorContext);
      expect(s1).toBe(EstadoTramite.INGRESADO);

      // INGRESADO -> EN_REVISION (Tomar)
      const s2 = workflow.determinarProximoEstado(s1, AccionWorkflow.TOMAR, operatorContext);
      expect(s2).toBe(EstadoTramite.EN_REVISION);

      // EN_REVISION -> DERIVADO
      const s3 = workflow.determinarProximoEstado(s2, AccionWorkflow.DERIVAR, {
        ...operatorContext,
        areaDestinoId: 'area-b',
        motivo: 'Pasa a Legales para dictamen',
      });
      expect(s3).toBe(EstadoTramite.DERIVADO);

      // DERIVADO -> EN_REVISION (Tomar en nueva área)
      const s4 = workflow.determinarProximoEstado(s3, AccionWorkflow.TOMAR, {
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'op-2',
        rolInterno: RolInterno.OPERADOR,
        areaUsuarioId: 'area-b',
      });
      expect(s4).toBe(EstadoTramite.EN_REVISION);

      // EN_REVISION -> RECHAZADO
      const s5 = workflow.determinarProximoEstado(s4, AccionWorkflow.RECHAZAR, operatorContext);
      expect(s5).toBe(EstadoTramite.RECHAZADO);

      // RECHAZADO -> CERRADO
      const s6 = workflow.determinarProximoEstado(s5, AccionWorkflow.CERRAR, operatorContext);
      expect(s6).toBe(EstadoTramite.CERRADO);
    });

    it('la derivación debe exigir un área destino', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.EN_REVISION, AccionWorkflow.DERIVAR, {
          ...operatorContext,
          motivo: 'Sin área destino',
        }),
      ).toThrow(BusinessRuleValidationException);
    });

    it('un usuario externo no puede participar en el circuito Interno-Interno', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.INGRESAR, {
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: 'ext-1',
        }),
      ).toThrow(UnauthorizedActionException);
    });
  });

  describe('Circuito 3: Interno → Externo', () => {
    const workflow = new InternoExternoWorkflow();
    const internalContext = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'int-1',
      rolInterno: RolInterno.OPERADOR,
    };
    const externalContext = {
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: 'ext-1',
    };

    it('debe ejecutar el ciclo de requerimiento e intervención externa', () => {
      // BORRADOR -> INGRESADO
      const s1 = workflow.determinarProximoEstado(EstadoTramite.BORRADOR, AccionWorkflow.INGRESAR, internalContext);
      expect(s1).toBe(EstadoTramite.INGRESADO);

      // INGRESADO -> ESPERANDO_EXTERNO
      const s2 = workflow.determinarProximoEstado(s1, AccionWorkflow.SOLICITAR_INTERVENCION_EXTERNA, {
        ...internalContext,
        motivo: 'Se requiere comprobante de pago actualizado',
      });
      expect(s2).toBe(EstadoTramite.ESPERANDO_EXTERNO);

      // ESPERANDO_EXTERNO -> ESPERANDO_INTERNO (Externo responde)
      const s3 = workflow.determinarProximoEstado(s2, AccionWorkflow.RESPONDER_INTERVENCION_EXTERNA, {
        ...externalContext,
        motivo: 'Comprobante adjunto',
      });
      expect(s3).toBe(EstadoTramite.ESPERANDO_INTERNO);

      // ESPERANDO_INTERNO -> EN_REVISION (Interno retoma)
      const s4 = workflow.determinarProximoEstado(s3, AccionWorkflow.TOMAR, internalContext);
      expect(s4).toBe(EstadoTramite.EN_REVISION);

      // EN_REVISION -> APROBADO -> CERRADO
      const s5 = workflow.determinarProximoEstado(s4, AccionWorkflow.APROBAR, internalContext);
      expect(s5).toBe(EstadoTramite.APROBADO);
      const s6 = workflow.determinarProximoEstado(s5, AccionWorkflow.CERRAR, internalContext);
      expect(s6).toBe(EstadoTramite.CERRADO);
    });

    it('un interno no puede responder en lugar del externo en ESPERANDO_EXTERNO', () => {
      expect(() =>
        workflow.determinarProximoEstado(EstadoTramite.ESPERANDO_EXTERNO, AccionWorkflow.RESPONDER_INTERVENCION_EXTERNA, {
          ...internalContext,
          motivo: 'Respuesta indebida',
        }),
      ).toThrow(UnauthorizedActionException);
    });
  });
});
