export interface ApiDashboardStatsDto {
  porEstado: Record<string, number>;
  porOrigen: Record<string, number>;
  porArea: Array<{ areaId: string; cantidad: number }>;
  sla: {
    EN_TERMINO?: number;
    PROXIMO_A_VENCER?: number;
    VENCIDO?: number;
    FINALIZADO?: number;
  };
  total: number;
  porPrioridad?: Record<string, number>;
}
