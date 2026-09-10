import { ApiDashboardStatsDto } from '../interfaces/dashboard.api.interface';
import {
  DashboardStats,
  OrigenStatItem,
  AreaStatItem,
  MovimientoStatItem,
} from '../interfaces/dashboard.interface';

export class DashboardAdapter {
  static toStats(dto: ApiDashboardStatsDto): DashboardStats {
    const enTermino = (dto.sla?.EN_TERMINO || 0) + (dto.sla?.PROXIMO_A_VENCER || 0);
    const vencidos = dto.vencidosSla ?? dto.sla?.VENCIDO ?? 0;
    const totalSla = enTermino + vencidos;
    const cumplimiento = totalSla > 0 ? Math.round((enTermino / totalSla) * 100) : 100;
    const total = dto.total ?? 0;

    const origenLabels: Record<string, string> = {
      EXTERNO_INTERNO: 'Externo a Interno',
      INTERNO_INTERNO: 'Circuito Interno',
      INTERNO_EXTERNO: 'Intervención Externa',
      EXTERNO: 'Iniciado por Externo',
      INTERNO: 'Iniciado por Interno',
    };

    const porOrigenRaw = dto.porOrigen || {};
    const tramitesPorOrigen: OrigenStatItem[] = Object.entries(porOrigenRaw).map(([key, cant]) => ({
      origen: key,
      label: origenLabels[key] || key,
      cantidad: cant,
      porcentaje: total > 0 ? Math.round((cant / total) * 100) : 0,
    }));

    const porAreaRaw = dto.porArea || [];
    const tramitesPorArea: AreaStatItem[] = porAreaRaw
      .map((item) => ({
        areaId: item.areaId,
        nombreArea: item.nombreArea || `Área ${item.areaId.slice(0, 6)}`,
        cantidad: item.cantidad,
        porcentaje: total > 0 ? Math.round((item.cantidad / total) * 100) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const ultimosMovimientos: MovimientoStatItem[] = (dto.ultimosMovimientos || []).map((m) => ({
      id: m.id,
      tramiteId: m.tramiteId,
      estadoAnterior: m.estadoAnterior,
      estadoNuevo: m.estadoNuevo,
      usuarioTipo: m.usuarioTipo,
      usuarioId: m.usuarioId,
      accion: m.accion,
      comentario: m.comentario,
      fecha: new Date(m.fecha),
    }));

    return {
      totalTramites: total,
      tramitesPorEstado: dto.porEstado ?? {},
      tramitesPorPrioridad: dto.porPrioridad ?? {
        BAJA: 0,
        MEDIA: 0,
        ALTA: 0,
        URGENTE: 0,
      },
      tramitesPorOrigen,
      tramitesPorArea,
      tramitesVencidosSla: vencidos,
      tramitesEnTerminoSla: enTermino,
      cumplimientoSlaPorcentaje: cumplimiento,
      promedioResolucionHoras: dto.promedioResolucionHoras ?? 0,
      ultimosMovimientos,
    };
  }
}
