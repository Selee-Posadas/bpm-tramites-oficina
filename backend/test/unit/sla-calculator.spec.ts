import { Tramite } from '../../src/modules/tramites/domain/entities/tramite.entity';
import { OrigenTramite } from '../../src/modules/tramites/domain/enums/origen-tramite.enum';
import { EstadoTramite } from '../../src/modules/tramites/domain/enums/estado-tramite.enum';
import { PrioridadTramite } from '../../src/modules/tramites/domain/enums/prioridad-tramite.enum';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { SlaCalculatorService, SlaStatus } from '../../src/modules/tramites/domain/services/sla-calculator.service';

describe('SlaCalculatorService (Domain Service)', () => {
  const ahora = new Date('2026-09-06T12:00:00Z');

  function crearTramite(fechaCreacion: Date, estado: EstadoTramite = EstadoTramite.EN_REVISION, fechaCierre?: Date): Tramite {
    return new Tramite({
      id: 't-1',
      numero: 'TRM-TEST-001',
      tipoTramiteId: 'tipo-1',
      titulo: 'Trámite de Prueba SLA',
      descripcion: 'Descripción',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado,
      prioridad: PrioridadTramite.MEDIA,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: 'user-1',
      fechaCreacion,
      fechaCierre,
    });
  }

  it('debe catalogar como EN_TERMINO un trámite con poco tiempo transcurrido', () => {
    const fechaCreacion = new Date('2026-09-06T10:00:00Z');
    const tramite = crearTramite(fechaCreacion);

    const slaInfo = SlaCalculatorService.calcularSla(tramite, 24, ahora);

    expect(slaInfo.estaVencido).toBe(false);
    expect(slaInfo.estadoSla).toBe(SlaStatus.EN_TERMINO);
    expect(slaInfo.porcentajeConsumido).toBeLessThan(80);
    expect(slaInfo.minutosRestantes).toBeGreaterThan(0);
  });

  it('debe catalogar como PROXIMO_A_VENCER un trámite con más del 80% consumido', () => {
    const fechaCreacion = new Date('2026-09-05T16:00:00Z');
    const tramite = crearTramite(fechaCreacion);

    const slaInfo = SlaCalculatorService.calcularSla(tramite, 24, ahora);

    expect(slaInfo.estaVencido).toBe(false);
    expect(slaInfo.estadoSla).toBe(SlaStatus.PROXIMO_A_VENCER);
    expect(slaInfo.porcentajeConsumido).toBeGreaterThanOrEqual(80);
    expect(slaInfo.minutosRestantes).toBeGreaterThan(0);
  });

  it('debe catalogar como VENCIDO un trámite que superó las horas de SLA', () => {
    const fechaCreacion = new Date('2026-09-05T10:00:00Z');
    const tramite = crearTramite(fechaCreacion);

    const slaInfo = SlaCalculatorService.calcularSla(tramite, 24, ahora);

    expect(slaInfo.estaVencido).toBe(true);
    expect(slaInfo.estadoSla).toBe(SlaStatus.VENCIDO);
    expect(slaInfo.minutosRestantes).toBeLessThan(0);
  });

  it('debe catalogar como FINALIZADO un trámite aprobado o cerrado', () => {
    const fechaCreacion = new Date('2026-09-05T10:00:00Z');
    const fechaCierre = new Date('2026-09-05T18:00:00Z');
    const tramite = crearTramite(fechaCreacion, EstadoTramite.APROBADO, fechaCierre);

    const slaInfo = SlaCalculatorService.calcularSla(tramite, 24, ahora);

    expect(slaInfo.estadoSla).toBe(SlaStatus.FINALIZADO);
    expect(slaInfo.estaVencido).toBe(false);
  });
});
