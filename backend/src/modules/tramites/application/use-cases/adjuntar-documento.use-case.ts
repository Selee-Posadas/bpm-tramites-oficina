import { Inject, Injectable } from '@nestjs/common';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import {
  IDocumentoTramiteRepository,
  DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/documento-tramite.repository.interface';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  TramiteResponseMapper,
  DocumentoResponseDto,
} from '../mappers/tramite-response.mapper';
import * as crypto from 'crypto';

export type DocumentoAdjuntadoResponseDto = DocumentoResponseDto;

export interface AdjuntarDocumentoCommand {
  tramiteId: string;
  nombreArchivo: string;
  mimeType: string;
  size: number;
  storageKey: string;
  subidoPorTipo: TipoUsuario;
  subidoPorId: string;
}

@Injectable()
export class AdjuntarDocumentoUseCase {
  constructor(
    @Inject(DOCUMENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly documentoRepository: IDocumentoTramiteRepository,
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  async execute(command: AdjuntarDocumentoCommand): Promise<DocumentoAdjuntadoResponseDto> {
    const tramite = await this.tramiteRepository.findById(command.tramiteId);
    if (!tramite) {
      throw new EntityNotFoundException('Trámite', command.tramiteId);
    }

    const documento = new DocumentoTramite({
      id: crypto.randomUUID(),
      tramiteId: command.tramiteId,
      nombreArchivo: command.nombreArchivo,
      mimeType: command.mimeType,
      size: command.size,
      storageKey: command.storageKey,
      subidoPorTipo: command.subidoPorTipo,
      subidoPorId: command.subidoPorId,
      fechaCarga: new Date(),
    });

    const saved = await this.documentoRepository.save(documento);
    return TramiteResponseMapper.toDocumentoDto(saved);
  }
}
