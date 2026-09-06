import { Inject, Injectable } from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
  TramiteFiltros,
} from '../../domain/repositories/tramite.repository.interface';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { SlaCalculatorService } from '../../domain/services/sla-calculator.service';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import {
  TramiteResponseMapper,
  TramiteItemResponseDto,
  ListarTramitesResponseDto,
} from '../mappers/tramite-response.mapper';

export { TramiteItemResponseDto, ListarTramitesResponseDto };

export interface ListarTramitesQuery {
  filtros: TramiteFiltros;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
}

@Injectable()
export class ListarTramitesUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(query: ListarTramitesQuery): Promise<ListarTramitesResponseDto> {
    const filtros = { ...query.filtros };

    if (query.usuarioTipo === TipoUsuario.EXTERNO) {
      filtros.usuarioExternoId = query.usuarioId;
    }

    const { tramites, total } = await this.tramiteRepository.findAll(filtros);

    const tipos = await this.tipoTramiteRepository.findAll();
    const tiposMap = new Map(tipos.map((t) => [t.id, t]));

    const items: TramiteItemResponseDto[] = tramites.map((t) => {
      const tipo = tiposMap.get(t.tipoTramiteId);
      const slaHoras = tipo ? tipo.slaHoras : 24;
      const slaInfo = SlaCalculatorService.calcularSla(t, slaHoras);
      return TramiteResponseMapper.toItemDto(t, tipo, slaInfo);
    });

    return TramiteResponseMapper.toListDto(
      items,
      total,
      filtros.skip || 0,
      filtros.take || 20,
    );
  }
}
