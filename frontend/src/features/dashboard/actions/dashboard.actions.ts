import { httpClient } from '../../../shared/api/httpClient';
import { DashboardStats } from '../interfaces/dashboard.interface';

export class DashboardActions {
  static async obtenerEstadisticas(): Promise<DashboardStats> {
    const response = await httpClient.get<DashboardStats>('/dashboard/stats');
    return response.data;
  }
}
