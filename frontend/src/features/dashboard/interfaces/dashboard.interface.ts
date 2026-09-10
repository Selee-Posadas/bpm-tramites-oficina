export interface AreaStatItem {
  areaId: string;
  nombreArea: string;
  cantidad: number;
  porcentaje: number;
}

export interface OrigenStatItem {
  origen: string;
  label: string;
  cantidad: number;
  porcentaje: number;
}

export interface MovimientoStatItem {
  id: string;
  tramiteId?: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  usuarioTipo: string;
  usuarioId: string;
  accion: string;
  comentario?: string | null;
  fecha: Date;
}

export interface DashboardStats {
  totalTramites: number;
  tramitesPorEstado: Record<string, number>;
  tramitesPorPrioridad: Record<string, number>;
  tramitesPorOrigen: OrigenStatItem[];
  tramitesPorArea: AreaStatItem[];
  tramitesVencidosSla: number;
  tramitesEnTerminoSla: number;
  cumplimientoSlaPorcentaje: number;
  promedioResolucionHoras: number;
  ultimosMovimientos: MovimientoStatItem[];
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
