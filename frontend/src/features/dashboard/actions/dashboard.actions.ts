import { httpClient } from '../../../shared/api/httpClient';
import { ApiDashboardStatsDto } from '../interfaces/dashboard.api.interface';
import { DashboardStats } from '../interfaces/dashboard.interface';
import { DashboardAdapter } from '../adapters/dashboard.adapter';

export class DashboardActions {
  static async obtenerEstadisticas(): Promise<DashboardStats> {
    const response = await httpClient.get<ApiDashboardStatsDto>('/dashboard/stats');
    return DashboardAdapter.toStats(response.data);
  }
}
