import {
  DocumentoTramite as PrismaDocumentoTramite,
  TipoUsuario as PrismaTipoUsuario,
} from '@prisma/client';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';

export class DocumentoMapper {
  static toDomain(raw: PrismaDocumentoTramite): DocumentoTramite {
    return new DocumentoTramite({
      id: raw.id,
      tramiteId: raw.tramiteId,
      nombreArchivo: raw.nombreArchivo,
      mimeType: raw.mimeType,
      size: raw.size,
      storageKey: raw.storageKey,
      subidoPorTipo: raw.subidoPorTipo as unknown as TipoUsuario,
      subidoPorId: raw.subidoPorId,
      fechaCarga: raw.fechaCarga,
    });
  }

  static toPersistence(entity: DocumentoTramite): PrismaDocumentoTramite {
    return {
      id: entity.id,
      tramiteId: entity.tramiteId,
      nombreArchivo: entity.nombreArchivo,
      mimeType: entity.mimeType,
      size: entity.size,
      storageKey: entity.storageKey,
      subidoPorTipo: entity.subidoPorTipo as unknown as PrismaTipoUsuario,
      subidoPorId: entity.subidoPorId,
      fechaCarga: entity.fechaCarga,
    };
  }
}
