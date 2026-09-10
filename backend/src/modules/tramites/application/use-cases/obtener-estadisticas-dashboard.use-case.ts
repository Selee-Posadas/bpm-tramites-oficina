import { Inject, Injectable } from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { SlaCalculatorService, SlaStatus } from '../../domain/services/sla-calculator.service';

export interface DashboardStatsDto {
  porEstado: Record<string, number>;
  porOrigen: Record<string, number>;
  porArea: Array<{ areaId: string; cantidad: number }>;
  sla: Record<SlaStatus, number>;
  porPrioridad: Record<string, number>;
  total: number;
}

@Injectable()
export class ObtenerEstadisticasDashboardUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(): Promise<DashboardStatsDto> {
    const [porEstado, porOrigen, porArea, allActive] = await Promise.all([
      this.tramiteRepository.countByEstado(),
      this.tramiteRepository.countByOrigen(),
      this.tramiteRepository.countByArea(),
      this.tramiteRepository.findAll({ take: 1000 }),
    ]);

    const tipos = await this.tipoTramiteRepository.findAll();
    const tiposMap = new Map(tipos.map((t) => [t.id, t.slaHoras]));

    const slaCounts: Record<SlaStatus, number> = {
      [SlaStatus.EN_TERMINO]: 0,
      [SlaStatus.PROXIMO_A_VENCER]: 0,
      [SlaStatus.VENCIDO]: 0,
      [SlaStatus.FINALIZADO]: 0,
    };

    const porPrioridad: Record<string, number> = {
      BAJA: 0,
      MEDIA: 0,
      ALTA: 0,
      URGENTE: 0,
    };

    allActive.tramites.forEach((t) => {
      const slaHoras = tiposMap.get(t.tipoTramiteId) || 24;
      const slaInfo = SlaCalculatorService.calcularSla(t, slaHoras);
      slaCounts[slaInfo.estadoSla]++;
      if (t.prioridad) {
        porPrioridad[t.prioridad] = (porPrioridad[t.prioridad] || 0) + 1;
      }
    });

    return {
      porEstado,
      porOrigen,
      porArea,
      sla: slaCounts,
      porPrioridad,
      total: allActive.total,
    };
  }
}
