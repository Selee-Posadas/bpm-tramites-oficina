export interface ApiAreaStatDto {
  areaId: string;
  nombreArea?: string;
  cantidad: number;
}

export interface ApiMovimientoStatDto {
  id: string;
  tramiteId?: string;
  estadoAnterior?: string | null;
  estadoNuevo: string;
  areaAnteriorId?: string | null;
  areaNuevaId?: string | null;
  usuarioTipo: string;
  usuarioId: string;
  accion: string;
  comentario?: string | null;
  fecha: string | Date;
}

export interface ApiDashboardStatsDto {
  porEstado: Record<string, number>;
  porOrigen: Record<string, number>;
  porArea: ApiAreaStatDto[];
  sla: {
    EN_TERMINO?: number;
    PROXIMO_A_VENCER?: number;
    VENCIDO?: number;
    FINALIZADO?: number;
  };
  vencidosSla?: number;
  promedioResolucionHoras?: number;
  porPrioridad?: Record<string, number>;
  ultimosMovimientos?: ApiMovimientoStatDto[];
  total: number;
}
