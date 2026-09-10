import { Inject, Injectable } from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import {
  IMovimientoTramiteRepository,
  MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/movimiento-tramite.repository.interface';
import { SlaCalculatorService, SlaStatus } from '../../domain/services/sla-calculator.service';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import { MovimientoResponseDto, TramiteResponseMapper } from '../mappers/tramite-response.mapper';

export interface DashboardStatsDto {
  porEstado: Record<string, number>;
  porOrigen: Record<string, number>;
  porArea: Array<{ areaId: string; cantidad: number }>;
  sla: Record<SlaStatus, number>;
  vencidosSla: number;
  promedioResolucionHoras: number;
  porPrioridad: Record<string, number>;
  ultimosMovimientos: MovimientoResponseDto[];
  total: number;
}

@Injectable()
export class ObtenerEstadisticasDashboardUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(): Promise<DashboardStatsDto> {
    const [porEstado, porOrigen, porArea, allActive, ultimosMovimientosRaw] = await Promise.all([
      this.tramiteRepository.countByEstado(),
      this.tramiteRepository.countByOrigen(),
      this.tramiteRepository.countByArea(),
      this.tramiteRepository.findAll({ take: 1000 }),
      this.movimientoRepository.findUltimosMovimientos(10),
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

    const resueltos = allActive.tramites.filter((t) =>
      [EstadoTramite.APROBADO, EstadoTramite.RECHAZADO, EstadoTramite.CERRADO].includes(t.estado),
    );

    const promedioResolucionHoras =
      resueltos.length > 0
        ? Math.round(
            resueltos.reduce((acc, t) => {
              const fin = t.fechaCierre ?? t.fechaActualizacion;
              const diffMs = fin.getTime() - t.fechaCreacion.getTime();
              return acc + Math.max(0, diffMs / (1000 * 60 * 60));
            }, 0) / resueltos.length,
          )
        : 0;

    const ultimosMovimientos = ultimosMovimientosRaw.map(TramiteResponseMapper.toMovimientoDto);

    return {
      porEstado,
      porOrigen,
      porArea,
      sla: slaCounts,
      vencidosSla: slaCounts[SlaStatus.VENCIDO],
      promedioResolucionHoras,
      porPrioridad,
      ultimosMovimientos,
      total: allActive.total,
    };
  }
}
