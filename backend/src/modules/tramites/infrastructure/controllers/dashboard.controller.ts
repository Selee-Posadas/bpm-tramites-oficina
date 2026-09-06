import { Controller, Get, UseGuards } from '@nestjs/common';
import { ObtenerEstadisticasDashboardUseCase } from '../../application/use-cases/obtener-estadisticas-dashboard.use-case';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';

@Controller('dashboard')
@UseGuards(InternalAuthGuard)
export class DashboardController {
  constructor(
    private readonly obtenerEstadisticasDashboardUseCase: ObtenerEstadisticasDashboardUseCase,
  ) {}

  @Get('stats')
  async getStats() {
    return await this.obtenerEstadisticasDashboardUseCase.execute();
  }
}
