import { describe, it, expect } from 'vitest';
import { DashboardAdapter } from '@/features/dashboard/adapters/dashboard.adapter';
import { ApiDashboardStatsDto } from '@/features/dashboard/interfaces/dashboard.api.interface';

describe('DashboardAdapter', () => {
  it('toStats debe mapear correctamente los campos de la API al modelo de DashboardStats', () => {
    const apiDto: ApiDashboardStatsDto = {
      total: 15,
      porEstado: {
        BORRADOR: 4,
        EN_REVISION: 6,
        APROBADO: 5,
      },
      porOrigen: {
        EXTERNO: 10,
        INTERNO: 5,
      },
      porArea: [
        { areaId: 'area-1', cantidad: 6 },
      ],
      sla: {
        EN_TERMINO: 8,
        PROXIMO_A_VENCER: 2,
        VENCIDO: 3,
        FINALIZADO: 2,
      },
    };

    const stats = DashboardAdapter.toStats(apiDto);

    expect(stats.totalTramites).toBe(15);
    expect(stats.tramitesPorEstado['EN_REVISION']).toBe(6);
    expect(stats.tramitesEnTerminoSla).toBe(10);
    expect(stats.tramitesVencidosSla).toBe(3);
    expect(stats.cumplimientoSlaPorcentaje).toBe(77);
    expect(stats.tramitesPorPrioridad).toBeDefined();
  });

  it('toStats debe ser resiliente ante campos nulos o ausentes', () => {
    const emptyDto: ApiDashboardStatsDto = {
      total: 0,
      porEstado: {},
      porOrigen: {},
      porArea: [],
      sla: {},
    };

    const stats = DashboardAdapter.toStats(emptyDto);
    expect(stats.totalTramites).toBe(0);
    expect(stats.tramitesPorEstado).toEqual({});
    expect(stats.tramitesEnTerminoSla).toBe(0);
    expect(stats.tramitesVencidosSla).toBe(0);
    expect(stats.cumplimientoSlaPorcentaje).toBe(100);
  });
});
