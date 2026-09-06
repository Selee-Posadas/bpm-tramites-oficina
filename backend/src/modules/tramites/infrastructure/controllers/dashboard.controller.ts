import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { SlaCalculatorService, SlaStatus } from '../../domain/services/sla-calculator.service';

@Controller('dashboard')
@UseGuards(InternalAuthGuard)
export class DashboardController {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  @Get('stats')
  async getStats() {
    const [porEstado, porOrigen, porArea, allActive] = await Promise.all([
      this.tramiteRepository.countByEstado(),
      this.tramiteRepository.countByOrigen(),
      this.tramiteRepository.countByArea(),
      this.tramiteRepository.findAll({ take: 1000 }), // Trámites para cálculo de SLA
    ]);

    const tipos = await this.tipoTramiteRepository.findAll();
    const tiposMap = new Map(tipos.map((t) => [t.id, t.slaHoras]));

    const slaCounts: Record<SlaStatus, number> = {
      [SlaStatus.EN_TERMINO]: 0,
      [SlaStatus.PROXIMO_A_VENCER]: 0,
      [SlaStatus.VENCIDO]: 0,
      [SlaStatus.FINALIZADO]: 0,
    };

    allActive.tramites.forEach((t) => {
      const slaHoras = tiposMap.get(t.tipoTramiteId) || 24;
      const slaInfo = SlaCalculatorService.calcularSla(t, slaHoras);
      slaCounts[slaInfo.estadoSla]++;
    });

    return {
      porEstado,
      porOrigen,
      porArea,
      sla: slaCounts,
      total: allActive.total,
    };
  }
}
