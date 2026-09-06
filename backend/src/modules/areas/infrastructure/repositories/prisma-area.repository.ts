import { Injectable } from '@nestjs/common';
import { IAreaRepository } from '../../domain/repositories/area.repository.interface';
import { Area } from '../../domain/entities/area.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { AreaMapper } from '../mappers/area.mapper';

@Injectable()
export class PrismaAreaRepository implements IAreaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Area | null> {
    const raw = await this.prisma.area.findUnique({ where: { id } });
    return raw ? AreaMapper.toDomain(raw) : null;
  }

  async findByCodigo(codigo: string): Promise<Area | null> {
    const raw = await this.prisma.area.findUnique({ where: { codigo } });
    return raw ? AreaMapper.toDomain(raw) : null;
  }

  async findAll(soloActivas?: boolean): Promise<Area[]> {
    const raws = await this.prisma.area.findMany({
      where: soloActivas ? { activa: true } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return raws.map(AreaMapper.toDomain);
  }

  async save(area: Area): Promise<Area> {
    const data = AreaMapper.toPersistence(area);
    const raw = await this.prisma.area.create({ data });
    return AreaMapper.toDomain(raw);
  }

  async update(area: Area): Promise<Area> {
    const data = AreaMapper.toPersistence(area);
    const raw = await this.prisma.area.update({
      where: { id: area.id },
      data,
    });
    return AreaMapper.toDomain(raw);
  }
}
