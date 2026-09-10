import { ApiDashboardStatsDto } from '../interfaces/dashboard.api.interface';
import { DashboardStats } from '../interfaces/dashboard.interface';

export class DashboardAdapter {
  static toStats(dto: ApiDashboardStatsDto): DashboardStats {
    const enTermino = (dto.sla?.EN_TERMINO || 0) + (dto.sla?.PROXIMO_A_VENCER || 0);
    const vencidos = dto.sla?.VENCIDO || 0;
    const totalSla = enTermino + vencidos;
    const cumplimiento = totalSla > 0 ? Math.round((enTermino / totalSla) * 100) : 100;

    return {
      totalTramites: dto.total ?? 0,
      tramitesPorEstado: dto.porEstado ?? {},
      tramitesPorPrioridad: dto.porPrioridad ?? {
        BAJA: 0,
        MEDIA: 0,
        ALTA: 0,
        URGENTE: 0,
      },
      tramitesVencidosSla: vencidos,
      tramitesEnTerminoSla: enTermino,
      cumplimientoSlaPorcentaje: cumplimiento,
    };
  }
}
