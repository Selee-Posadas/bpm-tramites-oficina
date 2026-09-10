export interface DashboardStats {
  totalTramites: number;
  tramitesPorEstado: Record<string, number>;
  tramitesPorPrioridad: Record<string, number>;
  tramitesVencidosSla: number;
  tramitesEnTerminoSla: number;
  cumplimientoSlaPorcentaje: number;
}

export interface EstadoDistributionChartProps {
  estados: Record<string, number>;
  total: number;
}

export interface SliceData {
  estado: string;
  label: string;
  cantidad: number;
  porcentaje: number;
  color: string;
  bgSoft: string;
  offset: number;
  length: number;
}

