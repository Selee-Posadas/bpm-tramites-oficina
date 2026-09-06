import { Injectable } from '@nestjs/common';
import {
  ITramiteRepository,
  TramiteFiltros,
} from '../../domain/repositories/tramite.repository.interface';
import { Tramite } from '../../domain/entities/tramite.entity';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';
import { OrigenTramite } from '../../domain/enums/origen-tramite.enum';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { TramiteMapper } from '../mappers/tramite.mapper';
import {
  EstadoTramite as PrismaEstadoTramite,
  OrigenTramite as PrismaOrigenTramite,
  PrioridadTramite as PrismaPrioridadTramite,
  Prisma,
} from '@prisma/client';
import { ConcurrencyConflictException } from '../../../../shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaTramiteRepository implements ITramiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tramite | null> {
    const raw = await this.prisma.tramite.findUnique({
      where: { id },
      include: {
        movimientos: { orderBy: { fecha: 'asc' } },
        documentos: { orderBy: { fechaCarga: 'asc' } },
        comentarios: { orderBy: { fecha: 'asc' } },
      },
    });
    return raw ? TramiteMapper.toDomain(raw) : null;
  }

  async findByNumero(numero: string): Promise<Tramite | null> {
    const raw = await this.prisma.tramite.findUnique({
      where: { numero },
      include: {
        movimientos: { orderBy: { fecha: 'asc' } },
        documentos: { orderBy: { fechaCarga: 'asc' } },
        comentarios: { orderBy: { fecha: 'asc' } },
      },
    });
    return raw ? TramiteMapper.toDomain(raw) : null;
  }

  async findAll(filtros?: TramiteFiltros): Promise<{ tramites: Tramite[]; total: number }> {
    const where: Prisma.TramiteWhereInput = {};

    if (filtros) {
      if (filtros.estado) {
        where.estado = filtros.estado as unknown as PrismaEstadoTramite;
      }
      if (filtros.origen) {
        where.origen = filtros.origen as unknown as PrismaOrigenTramite;
      }
      if (filtros.prioridad) {
        where.prioridad = filtros.prioridad as unknown as PrismaPrioridadTramite;
      }
      if (filtros.areaActualId) {
        where.areaActualId = filtros.areaActualId;
      }
      if (filtros.usuarioAsignadoId) {
        where.usuarioAsignadoId = filtros.usuarioAsignadoId;
      }
      if (filtros.usuarioExternoId) {
        where.usuarioExternoId = filtros.usuarioExternoId;
      }
      if (filtros.creadoPorId) {
        where.creadoPorId = filtros.creadoPorId;
      }
      if (filtros.fechaDesde || filtros.fechaHasta) {
        where.fechaCreacion = {};
        if (filtros.fechaDesde) where.fechaCreacion.gte = filtros.fechaDesde;
        if (filtros.fechaHasta) where.fechaCreacion.lte = filtros.fechaHasta;
      }
      if (filtros.busqueda) {
        where.OR = [
          { numero: { contains: filtros.busqueda, mode: 'insensitive' } },
          { titulo: { contains: filtros.busqueda, mode: 'insensitive' } },
          { descripcion: { contains: filtros.busqueda, mode: 'insensitive' } },
        ];
      }
    }

    const [raws, total] = await Promise.all([
      this.prisma.tramite.findMany({
        where,
        include: {
          movimientos: { orderBy: { fecha: 'desc' }, take: 1 },
          documentos: true,
          comentarios: true,
        },
        skip: filtros?.skip || 0,
        take: filtros?.take || 50,
        orderBy: { fechaActualizacion: 'desc' },
      }),
      this.prisma.tramite.count({ where }),
    ]);

    return {
      tramites: raws.map(TramiteMapper.toDomain),
      total,
    };
  }

  async save(tramite: Tramite): Promise<Tramite> {
    const data = TramiteMapper.toPersistence(tramite);
    const raw = await this.prisma.tramite.create({
      data,
      include: {
        movimientos: true,
        documentos: true,
        comentarios: true,
      },
    });
    return TramiteMapper.toDomain(raw);
  }

  async update(tramite: Tramite): Promise<Tramite> {
    const data = TramiteMapper.toPersistence(tramite);
    const raw = await this.prisma.tramite.update({
      where: { id: tramite.id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        estado: data.estado,
        prioridad: data.prioridad,
        areaActualId: data.areaActualId,
        usuarioAsignadoId: data.usuarioAsignadoId,
        usuarioExternoId: data.usuarioExternoId,
        fechaActualizacion: new Date(),
        fechaCierre: data.fechaCierre,
      },
      include: {
        movimientos: { orderBy: { fecha: 'asc' } },
        documentos: true,
        comentarios: true,
      },
    });
    return TramiteMapper.toDomain(raw);
  }

  async updateIfUnassigned(tramite: Tramite): Promise<Tramite> {
    const data = TramiteMapper.toPersistence(tramite);
    return await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.tramite.updateMany({
        where: {
          id: tramite.id,
          OR: [
            { usuarioAsignadoId: null },
            { usuarioAsignadoId: data.usuarioAsignadoId },
          ],
        },
        data: {
          estado: data.estado,
          usuarioAsignadoId: data.usuarioAsignadoId,
          areaActualId: data.areaActualId,
          fechaActualizacion: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new ConcurrencyConflictException(
          'El trámite ya ha sido tomado por otro operador o su estado ha cambiado',
        );
      }

      const raw = await tx.tramite.findUnique({
        where: { id: tramite.id },
        include: {
          movimientos: { orderBy: { fecha: 'asc' } },
          documentos: true,
          comentarios: true,
        },
      });

      return TramiteMapper.toDomain(raw!);
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tramite.delete({ where: { id } });
  }

  async countByEstado(): Promise<Record<EstadoTramite, number>> {
    const counts = await this.prisma.tramite.groupBy({
      by: ['estado'],
      _count: { _all: true },
    });

    const result = Object.values(EstadoTramite).reduce((acc, estado) => {
      acc[estado] = 0;
      return acc;
    }, {} as Record<EstadoTramite, number>);

    counts.forEach((item) => {
      const estado = item.estado as unknown as EstadoTramite;
      if (result[estado] !== undefined) {
        result[estado] = item._count._all;
      }
    });

    return result;
  }

  async countByOrigen(): Promise<Record<OrigenTramite, number>> {
    const counts = await this.prisma.tramite.groupBy({
      by: ['origen'],
      _count: { _all: true },
    });

    const result = Object.values(OrigenTramite).reduce((acc, origen) => {
      acc[origen] = 0;
      return acc;
    }, {} as Record<OrigenTramite, number>);

    counts.forEach((item) => {
      const origen = item.origen as unknown as OrigenTramite;
      if (result[origen] !== undefined) {
        result[origen] = item._count._all;
      }
    });

    return result;
  }

  async countByArea(): Promise<Array<{ areaId: string; cantidad: number }>> {
    const counts = await this.prisma.tramite.groupBy({
      by: ['areaActualId'],
      _count: { _all: true },
      where: {
        areaActualId: { not: null },
      },
    });

    return counts.map((item) => ({
      areaId: item.areaActualId as string,
      cantidad: item._count._all,
    }));
  }
}
