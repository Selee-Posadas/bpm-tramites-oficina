import { Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/repositories/usuario.repository.interface';
import { UsuarioInterno } from '../../domain/entities/usuario-interno.entity';
import { UsuarioExterno } from '../../domain/entities/usuario-externo.entity';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { UsuarioMapper } from '../mappers/usuario.mapper';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInternoById(id: string): Promise<UsuarioInterno | null> {
    const raw = await this.prisma.usuarioInterno.findUnique({ where: { id } });
    return raw ? UsuarioMapper.toDomainInterno(raw) : null;
  }

  async findInternoByEmail(email: string): Promise<UsuarioInterno | null> {
    const raw = await this.prisma.usuarioInterno.findUnique({ where: { email } });
    return raw ? UsuarioMapper.toDomainInterno(raw) : null;
  }

  async findAllInternos(areaId?: string): Promise<UsuarioInterno[]> {
    const raws = await this.prisma.usuarioInterno.findMany({
      where: areaId ? { areaId, activo: true } : { activo: true },
      orderBy: { nombre: 'asc' },
    });
    return raws.map(UsuarioMapper.toDomainInterno);
  }

  async saveInterno(usuario: UsuarioInterno, passwordHash?: string | null): Promise<UsuarioInterno> {
    const data = UsuarioMapper.toPersistenceInterno(usuario, passwordHash);
    const raw = await this.prisma.usuarioInterno.create({ data });
    return UsuarioMapper.toDomainInterno(raw);
  }

  async findExternoById(id: string): Promise<UsuarioExterno | null> {
    const raw = await this.prisma.usuarioExterno.findUnique({ where: { id } });
    return raw ? UsuarioMapper.toDomainExterno(raw) : null;
  }

  async findExternoByEmail(email: string): Promise<UsuarioExterno | null> {
    const raw = await this.prisma.usuarioExterno.findUnique({ where: { email } });
    return raw ? UsuarioMapper.toDomainExterno(raw) : null;
  }

  async saveExterno(usuario: UsuarioExterno, passwordHash = ''): Promise<UsuarioExterno> {
    const data = UsuarioMapper.toPersistenceExterno(usuario, passwordHash);
    const raw = await this.prisma.usuarioExterno.create({ data });
    return UsuarioMapper.toDomainExterno(raw);
  }
}
