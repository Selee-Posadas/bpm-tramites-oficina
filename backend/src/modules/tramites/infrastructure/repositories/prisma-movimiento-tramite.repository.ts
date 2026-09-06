import { Injectable } from '@nestjs/common';
import { IMovimientoTramiteRepository } from '../../domain/repositories/movimiento-tramite.repository.interface';
import { MovimientoTramite } from '../../domain/entities/movimiento-tramite.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { MovimientoMapper } from '../mappers/movimiento.mapper';

@Injectable()
export class PrismaMovimientoTramiteRepository implements IMovimientoTramiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MovimientoTramite | null> {
    const raw = await this.prisma.movimientoTramite.findUnique({ where: { id } });
    return raw ? MovimientoMapper.toDomain(raw) : null;
  }

  async findByTramiteId(tramiteId: string): Promise<MovimientoTramite[]> {
    const raws = await this.prisma.movimientoTramite.findMany({
      where: { tramiteId },
      orderBy: { fecha: 'asc' },
    });
    return raws.map(MovimientoMapper.toDomain);
  }

  async save(movimiento: MovimientoTramite): Promise<MovimientoTramite> {
    const data = MovimientoMapper.toPersistence(movimiento);
    const raw = await this.prisma.movimientoTramite.create({ data });
    return MovimientoMapper.toDomain(raw);
  }

  async findUltimosMovimientos(limit = 10): Promise<MovimientoTramite[]> {
    const raws = await this.prisma.movimientoTramite.findMany({
      take: limit,
      orderBy: { fecha: 'desc' },
    });
    return raws.map(MovimientoMapper.toDomain);
  }
}
