import { Inject, Injectable } from '@nestjs/common';
import {
  IDocumentoTramiteRepository,
  DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/documento-tramite.repository.interface';
import {
  TramiteResponseMapper,
  DocumentoResponseDto,
} from '../mappers/tramite-response.mapper';

export { DocumentoResponseDto };

@Injectable()
export class ListarDocumentosUseCase {
  constructor(
    @Inject(DOCUMENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly documentoRepository: IDocumentoTramiteRepository,
  ) {}

  async execute(tramiteId: string): Promise<DocumentoResponseDto[]> {
    const docs = await this.documentoRepository.findByTramiteId(tramiteId);
    return docs.map(TramiteResponseMapper.toDocumentoDto);
  }
}
