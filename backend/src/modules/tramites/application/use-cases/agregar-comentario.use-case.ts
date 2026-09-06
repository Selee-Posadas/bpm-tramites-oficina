import { Inject, Injectable } from '@nestjs/common';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { VisibilidadComentario } from '../../domain/enums/visibilidad-comentario.enum';
import {
  IComentarioTramiteRepository,
  COMENTARIO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/comentario-tramite.repository.interface';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  TramiteResponseMapper,
  ComentarioResponseDto,
} from '../mappers/tramite-response.mapper';
import * as crypto from 'crypto';

export type ComentarioAgregadoResponseDto = ComentarioResponseDto;

export interface AgregarComentarioCommand {
  tramiteId: string;
  mensaje: string;
  visibilidad?: VisibilidadComentario;
  usuarioTipo: TipoUsuario;
  usuarioId: string;
}

@Injectable()
export class AgregarComentarioUseCase {
  constructor(
    @Inject(COMENTARIO_TRAMITE_REPOSITORY_TOKEN)
    private readonly comentarioRepository: IComentarioTramiteRepository,
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  async execute(command: AgregarComentarioCommand): Promise<ComentarioAgregadoResponseDto> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    let visibilidad = command.visibilidad ?? VisibilidadComentario.INTERNA;

    if (command.usuarioTipo === TipoUsuario.EXTERNO) {
      visibilidad = VisibilidadComentario.EXTERNA;
    }

    const comentario = new ComentarioTramite({
      id: crypto.randomUUID(),
      tramiteId: command.tramiteId,
      mensaje: command.mensaje,
      visibilidad,
      autorTipo: command.usuarioTipo,
      autorId: command.usuarioId,
      fecha: new Date(),
    });

    const saved = await this.comentarioRepository.save(comentario);
    return TramiteResponseMapper.toComentarioDto(saved);
  }
}
