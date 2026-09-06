import { Injectable } from '@nestjs/common';
import { ITipoTramiteRepository } from '../../domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TipoTramiteMapper } from '../mappers/tipo-tramite.mapper';

@Injectable()
export class PrismaTipoTramiteRepository implements ITipoTramiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TipoTramite | null> {
    const raw = await this.prisma.tipoTramite.findUnique({ where: { id } });
    return raw ? TipoTramiteMapper.toDomain(raw) : null;
  }

  async findByCodigo(codigo: string): Promise<TipoTramite | null> {
    const raw = await this.prisma.tipoTramite.findUnique({ where: { codigo } });
    return raw ? TipoTramiteMapper.toDomain(raw) : null;
  }

  async findAll(soloActivos?: boolean): Promise<TipoTramite[]> {
    const raws = await this.prisma.tipoTramite.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return raws.map(TipoTramiteMapper.toDomain);
  }

  async save(tipoTramite: TipoTramite): Promise<TipoTramite> {
    const data = TipoTramiteMapper.toPersistence(tipoTramite);
    const raw = await this.prisma.tipoTramite.create({ data });
    return TipoTramiteMapper.toDomain(raw);
  }

  async update(tipoTramite: TipoTramite): Promise<TipoTramite> {
    const data = TipoTramiteMapper.toPersistence(tipoTramite);
    const raw = await this.prisma.tipoTramite.update({
      where: { id: tipoTramite.id },
      data,
    });
    return TipoTramiteMapper.toDomain(raw);
  }
}
