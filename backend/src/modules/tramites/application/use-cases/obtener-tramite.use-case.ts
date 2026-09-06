import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { ITipoTramiteRepository, TIPO_TRAMITE_REPOSITORY_TOKEN } from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { SlaCalculatorService, SlaInfo } from '../../domain/services/sla-calculator.service';
import {
  EntityNotFoundException,
  UnauthorizedActionException,
} from '../../../../shared/domain/exceptions/domain.exception';

export interface ObtenerTramiteQuery {
  tramiteId: string;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
  rolInterno?: RolInterno;
  areaUsuarioId?: string;
}

export interface TramiteDetalleDto {
  tramite: Tramite;
  slaInfo: SlaInfo;
}

@Injectable()
export class ObtenerTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(query: ObtenerTramiteQuery): Promise<TramiteDetalleDto> {
    const tramite = await this.tramiteRepository.findById(query.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', query.tramiteId);
    }

    // Regla de seguridad: Usuario externo solo puede ver trámites donde participe
    if (query.usuarioTipo === TipoUsuario.EXTERNO) {
      const participa =
        tramite.usuarioExternoId === query.usuarioId ||
        (tramite.creadoPorTipo === TipoUsuario.EXTERNO && tramite.creadoPorId === query.usuarioId);

      if (!participa) {
        throw new UnauthorizedActionException('No tiene permisos para consultar este trámite');
      }
    }

    // Regla de seguridad: Operador interno solo puede ver trámites asignados a su área
    if (
      query.usuarioTipo === TipoUsuario.INTERNO &&
      query.rolInterno === RolInterno.OPERADOR &&
      query.areaUsuarioId &&
      tramite.areaActualId &&
      query.areaUsuarioId !== tramite.areaActualId
    ) {
      throw new UnauthorizedActionException('Solo tiene permisos para visualizar trámites asignados a su área');
    }

    const tipoTramite = await this.tipoTramiteRepository.findById(tramite.tipoTramiteId);
    const slaHoras = tipoTramite ? tipoTramite.slaHoras : 24;
    const slaInfo = SlaCalculatorService.calcularSla(tramite, slaHoras);

    return {
      tramite,
      slaInfo,
    };
  }
}
