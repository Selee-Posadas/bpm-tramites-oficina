export interface DashboardStats {
  totalTramites: number;
  tramitesPorEstado: Record<string, number>;
  tramitesPorPrioridad: Record<string, number>;
  tramitesVencidosSla: number;
  tramitesEnTerminoSla: number;
  cumplimientoSlaPorcentaje: number;
}
