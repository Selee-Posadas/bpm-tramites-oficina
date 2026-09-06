import { Inject, Injectable } from '@nestjs/common';
import { Tramite } from '../../domain/entities/tramite.entity';
import { OrigenTramite } from '../../domain/enums/origen-tramite.enum';
import { PrioridadTramite } from '../../domain/enums/prioridad-tramite.enum';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { AccionWorkflow } from '../../domain/enums/accion-workflow.enum';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import { ITramiteRepository, TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/tramite.repository.interface';
import { ITipoTramiteRepository, TIPO_TRAMITE_REPOSITORY_TOKEN } from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { MovimientoTramite } from '../../domain/entities/movimiento-tramite.entity';
import { IMovimientoTramiteRepository, MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN } from '../../domain/repositories/movimiento-tramite.repository.interface';
import {
  EntityNotFoundException,
  BusinessRuleValidationException,
} from '../../../../shared/domain/exceptions/domain.exception';

import {
  TramiteResponseMapper,
  TramiteCreadoResponseDto,
} from '../mappers/tramite-response.mapper';

export { TramiteCreadoResponseDto };

export interface CrearTramiteCommand {
  tipoTramiteId: string;
  titulo: string;
  descripcion: string;
  prioridad?: PrioridadTramite;
  areaDestinoId?: string;
  usuarioExternoId?: string;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
}

@Injectable()
export class CrearTramiteUseCase {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
    @Inject(MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly movimientoRepository: IMovimientoTramiteRepository,
  ) {}

  async execute(command: CrearTramiteCommand): Promise<TramiteCreadoResponseDto> {
    const tipoTramite = await this.tipoTramiteRepository.findById(command.tipoTramiteId);
    if (!tipoTramite) {
      throw new EntityNotFoundException('Tipo de trámite', command.tipoTramiteId);
    }

    if (!tipoTramite.activo) {
      throw new BusinessRuleValidationException('El tipo de trámite seleccionado no se encuentra activo');
    }

    if (command.usuarioTipo === TipoUsuario.EXTERNO && !tipoTramite.permiteInicioExterno) {
      throw new BusinessRuleValidationException(
        'Este tipo de trámite no admite inicio por parte de solicitantes externos',
      );
    }

    let origen: OrigenTramite;
    let areaActualId: string;
    let usuarioExternoId: string | undefined;

    if (command.usuarioTipo === TipoUsuario.EXTERNO) {
      origen = OrigenTramite.EXTERNO_INTERNO;
      areaActualId = tipoTramite.areaInicialId;
      usuarioExternoId = command.usuarioId;
    } else {
      if (tipoTramite.requiereExterno) {
        if (!command.usuarioExternoId) {
          throw new BusinessRuleValidationException(
            'Para este trámite es obligatorio vincular un usuario externo destinatario',
          );
        }
        origen = OrigenTramite.INTERNO_EXTERNO;
        areaActualId = command.areaDestinoId || tipoTramite.areaInicialId;
        usuarioExternoId = command.usuarioExternoId;
      } else {
        origen = OrigenTramite.INTERNO_INTERNO;
        areaActualId = command.areaDestinoId || tipoTramite.areaInicialId;
        usuarioExternoId = undefined;
      }
    }

    const tramiteId = crypto.randomUUID();
    const movimientoId = crypto.randomUUID();
    const timestamp = Date.now().toString().slice(-6);
    const numero = `TRM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${timestamp}`;

    const tramite = new Tramite({
      id: tramiteId,
      numero,
      tipoTramiteId: tipoTramite.id,
      titulo: command.titulo,
      descripcion: command.descripcion,
      origen,
      estado: EstadoTramite.BORRADOR,
      prioridad: command.prioridad || PrioridadTramite.MEDIA,
      areaActualId,
      usuarioAsignadoId: null,
      usuarioExternoId,
      creadoPorTipo: command.usuarioTipo,
      creadoPorId: command.usuarioId,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });

    const movimientoInicial = new MovimientoTramite({
      id: movimientoId,
      tramiteId,
      estadoAnterior: null,
      estadoNuevo: EstadoTramite.BORRADOR,
      areaAnteriorId: null,
      areaNuevaId: areaActualId,
      usuarioTipo: command.usuarioTipo,
      usuarioId: command.usuarioId,
      accion: AccionWorkflow.CREAR,
      comentario: 'Creación de trámite en borrador',
      fecha: new Date(),
    });

    await this.movimientoRepository.save(movimientoInicial);
    const saved = await this.tramiteRepository.save(tramite);

    return TramiteResponseMapper.toCreadoDto(saved);
  }
}
