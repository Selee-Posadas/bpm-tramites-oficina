import { Injectable } from '@nestjs/common';
import { IComentarioTramiteRepository } from '../../domain/repositories/comentario-tramite.repository.interface';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { ComentarioMapper } from '../mappers/comentario.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaComentarioTramiteRepository implements IComentarioTramiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(comentario: ComentarioTramite): Promise<ComentarioTramite> {
    const data = ComentarioMapper.toPersistence(comentario);
    const raw = await this.prisma.comentarioTramite.create({
      data,
    });
    return ComentarioMapper.toDomain(raw);
  }

  async findByTramiteId(
    tramiteId: string,
    soloVisiblesParaExterno = false,
  ): Promise<ComentarioTramite[]> {
    const where: Prisma.ComentarioTramiteWhereInput = { tramiteId };

    if (soloVisiblesParaExterno) {
      where.visibilidad = { in: ['EXTERNA', 'TODOS'] };
    }

    const raws = await this.prisma.comentarioTramite.findMany({
      where,
      orderBy: { fecha: 'asc' },
    });

    return raws.map(ComentarioMapper.toDomain);
  }
}
