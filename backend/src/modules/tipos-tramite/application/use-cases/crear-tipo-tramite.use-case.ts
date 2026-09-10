import { Inject, Injectable } from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';
import { DuplicateEntityException } from '../../../../shared/domain/exceptions/domain.exception';
import * as crypto from 'crypto';

export interface CrearTipoTramiteCommand {
  codigo: string;
  nombre: string;
  descripcion: string;
  slaHoras: number;
  areaInicialId: string;
  requiereExterno?: boolean;
  permiteInicioExterno?: boolean;
  activo?: boolean;
}

@Injectable()
export class CrearTipoTramiteUseCase {
  constructor(
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  async execute(command: CrearTipoTramiteCommand): Promise<TipoTramite> {
    const existing = await this.tipoTramiteRepository.findByCodigo(command.codigo);
    if (existing) {
      throw new DuplicateEntityException('Tipo de trámite', 'código', command.codigo);
    }

    const tipo = new TipoTramite({
      id: crypto.randomUUID(),
      codigo: command.codigo,
      nombre: command.nombre,
      descripcion: command.descripcion,
      slaHoras: command.slaHoras,
      areaInicialId: command.areaInicialId,
      requiereExterno: command.requiereExterno ?? false,
      permiteInicioExterno: command.permiteInicioExterno ?? false,
      activo: command.activo ?? true,
      fechaCreacion: new Date(),
    });

    return await this.tipoTramiteRepository.save(tipo);
  }
}
