import { Inject, Injectable } from '@nestjs/common';
import {
  IDocumentoTramiteRepository,
  DOCUMENTO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/documento-tramite.repository.interface';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';

export interface ObtenerDocumentoQuery {
  documentoId: string;
  tramiteId: string;
}

@Injectable()
export class ObtenerDocumentoUseCase {
  constructor(
    @Inject(DOCUMENTO_TRAMITE_REPOSITORY_TOKEN)
    private readonly documentoRepository: IDocumentoTramiteRepository,
  ) {}

  async execute(query: ObtenerDocumentoQuery): Promise<DocumentoTramite> {
    const doc = await this.documentoRepository.findById(query.documentoId);
    if (!doc || doc.tramiteId !== query.tramiteId) {
      throw new EntityNotFoundException('Documento', query.documentoId);
    }

    return doc;
  }
}
