import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { FiltrosTramiteDto } from '../../dto/filtros-tramite.dto';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { ITipoTramiteRepository, TIPO_TRAMITE_REPOSITORY_TOKEN } from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../../tipos-tramite/domain/entities/tipo-tramite.entity';
import { SlaCalculatorService, SlaInfo } from '../../domain/services/sla-calculator.service';

export interface TramiteListadoItem {
  id: string;
  tramite: Tramite;
  tipo?: TipoTramite;
  sla: SlaInfo;
}

export interface ListarTramitesResult {
  items: TramiteListadoItem[];
  total: number;
  skip: number;
  take: number;
}

export interface ListarTramitesQuery {
  filtros: FiltrosTramiteDto;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
  rolInterno?: RolInterno;
  areaUsuarioId?: string;
}

@Injectable()
export class ListarTramitesUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(query: ListarTramitesQuery): Promise<ListarTramitesResult> {
    const filtros = { ...query.filtros };

    if (query.usuarioTipo === TipoUsuario.EXTERNO) {
      filtros.usuarioExternoId = query.usuarioId;
    } else if (query.usuarioTipo === TipoUsuario.INTERNO) {
      if (query.rolInterno === RolInterno.OPERADOR || query.rolInterno === RolInterno.SUPERVISOR) {
        if (query.areaUsuarioId) {
          filtros.areaActualId = query.areaUsuarioId;
        }
      } else if (query.rolInterno === RolInterno.MESA_ENTRADA) {
        const areaFiltro = filtros.areaActualId || filtros.areaId;
        if (!areaFiltro && query.areaUsuarioId) {
          filtros.areaActualId = query.areaUsuarioId;
        } else if (areaFiltro) {
          filtros.areaActualId = areaFiltro;
        }
      } else {
        const areaFiltro = filtros.areaActualId || filtros.areaId;
        if (areaFiltro) {
          filtros.areaActualId = areaFiltro;
        }
      }
    }

    const tipos = await this.tipoTramiteRepository.findAll();
    const tiposMap = new Map(tipos.map((t) => [t.id, t]));

    if (filtros.soloVencidos) {
      const { tramites: candidatos } = await this.tramiteRepository.findAll({
        ...filtros,
        skip: 0,
        take: 1000,
      });

      const itemsVencidos: TramiteListadoItem[] = [];
      for (const t of candidatos) {
        const tipo = tiposMap.get(t.tipoTramiteId);
        const slaHoras = tipo ? tipo.slaHoras : 24;
        const slaInfo = SlaCalculatorService.calcularSla(t, slaHoras);
        if (slaInfo.estaVencido) {
          itemsVencidos.push({
            id: t.id,
            tramite: t,
            tipo,
            sla: slaInfo,
          });
        }
      }

      const totalVencidos = itemsVencidos.length;
      const skip = filtros.skip || 0;
      const take = filtros.take || 20;
      const paginatedItems = itemsVencidos.slice(skip, skip + take);

      return {
        items: paginatedItems,
        total: totalVencidos,
        skip,
        take,
      };
    }

    const { tramites, total } = await this.tramiteRepository.findAll(filtros);

    const items: TramiteListadoItem[] = tramites.map((t) => {
      const tipo = tiposMap.get(t.tipoTramiteId);
      const slaHoras = tipo ? tipo.slaHoras : 24;
      const slaInfo = SlaCalculatorService.calcularSla(t, slaHoras);
      return {
        id: t.id,
        tramite: t,
        tipo,
        sla: slaInfo,
      };
    });

    return {
      items,
      total,
      skip: filtros.skip || 0,
      take: filtros.take || 20,
    };
  }
}
