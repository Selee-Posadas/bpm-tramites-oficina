import { DocumentoTramite } from '../entities/documento-tramite.entity';

export interface IDocumentoTramiteRepository {
  save(documento: DocumentoTramite): Promise<DocumentoTramite>;
  findById(id: string): Promise<DocumentoTramite | null>;
  findByTramiteId(tramiteId: string): Promise<DocumentoTramite[]>;
  delete(id: string): Promise<void>;
}

export const DOCUMENTO_TRAMITE_REPOSITORY_TOKEN = Symbol('IDocumentoTramiteRepository');
