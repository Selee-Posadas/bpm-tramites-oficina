import { Inject, Injectable } from '@nestjs/common';
import {
  IDocumentoTramiteRepository,
  DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/documento-tramite.repository.interface';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';

@Injectable()
export class ListarDocumentosUseCase {
  constructor(
    @Inject(DOCUMENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly documentoRepository: IDocumentoTramiteRepository,
  ) {}

  async execute(tramiteId: string): Promise<DocumentoTramite[]> {
    return await this.documentoRepository.findByTramiteId(tramiteId);
  }
}
