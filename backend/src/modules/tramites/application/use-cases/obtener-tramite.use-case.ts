import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { ITipoTramiteRepository, TIPO_TRAMITE_REPOSITORY_TOKEN } from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../../tipos-tramite/domain/entities/tipo-tramite.entity';
import { SlaCalculatorService, SlaInfo } from '../../domain/services/sla-calculator.service';
import {
  EntityNotFoundException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';

export interface TramiteDetalleModel {
  tramite: Tramite;
  tipoTramite: TipoTramite | null;
  slaInfo: SlaInfo;
  comentariosVisibles: readonly ComentarioTramite[];
}

export interface ObtenerTramiteQuery {
  tramiteId: string;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
  rolInterno?: RolInterno;
  areaUsuarioId?: string;
}

@Injectable()
export class ObtenerTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(query: ObtenerTramiteQuery): Promise<TramiteDetalleModel> {
    const tramite = await this.tramiteRepository.findById(query.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', query.tramiteId);
    }

    if (query.usuarioTipo === TipoUsuario.EXTERNO) {
      const participa =
        tramite.usuarioExternoId === query.usuarioId ||
        (tramite.creadoPorTipo === TipoUsuario.EXTERNO && tramite.creadoPorId === query.usuarioId);

      if (!participa) {
        throw new UnauthorizedActionException('No tiene permisos para consultar este trámite');
      }
    }

    if (
      query.usuarioTipo === TipoUsuario.INTERNO &&
      (query.rolInterno === RolInterno.OPERADOR || query.rolInterno === RolInterno.SUPERVISOR) &&
      query.areaUsuarioId &&
      tramite.areaActualId &&
      query.areaUsuarioId !== tramite.areaActualId
    ) {
      throw new UnauthorizedActionException('Solo tiene permisos para visualizar trámites asignados a su área');
    }

    const tipoTramite = await this.tipoTramiteRepository.findById(tramite.tipoTramiteId);
    const slaHoras = tipoTramite ? tipoTramite.slaHoras : 24;
    const slaInfo = SlaCalculatorService.calcularSla(tramite, slaHoras);

    const comentariosVisibles =
      query.usuarioTipo === TipoUsuario.EXTERNO
        ? tramite.comentarios.filter((c) => c.esVisibleParaExterno())
        : tramite.comentarios;

    return {
      tramite,
      tipoTramite,
      slaInfo,
      comentariosVisibles,
    };
  }
}
