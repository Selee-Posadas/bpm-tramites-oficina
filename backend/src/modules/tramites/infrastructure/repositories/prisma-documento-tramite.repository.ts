import { Injectable } from '@nestjs/common';
import { IDocumentoTramiteRepository } from '../../domain/repositories/documento-tramite.repository.interface';
import { DocumentoTramite } from '../../domain/entities/documento-tramite.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DocumentoMapper } from '../mappers/documento.mapper';

@Injectable()
export class PrismaDocumentoTramiteRepository implements IDocumentoTramiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(documento: DocumentoTramite): Promise<DocumentoTramite> {
    const data = DocumentoMapper.toPersistence(documento);
    const raw = await this.prisma.documentoTramite.create({
      data,
    });
    return DocumentoMapper.toDomain(raw);
  }

  async findById(id: string): Promise<DocumentoTramite | null> {
    const raw = await this.prisma.documentoTramite.findUnique({
      where: { id },
    });
    return raw ? DocumentoMapper.toDomain(raw) : null;
  }

  async findByTramiteId(tramiteId: string): Promise<DocumentoTramite[]> {
    const raws = await this.prisma.documentoTramite.findMany({
      where: { tramiteId },
      orderBy: { fechaCarga: 'asc' },
    });
    return raws.map(DocumentoMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.documentoTramite.delete({
      where: { id },
    });
  }
}
