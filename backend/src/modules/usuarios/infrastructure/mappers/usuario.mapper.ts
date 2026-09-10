import {
  UsuarioInterno as PrismaUsuarioInterno,
  UsuarioExterno as PrismaUsuarioExterno,
  RolInterno as PrismaRolInterno,
  EstadoUsuarioExterno as PrismaEstadoUsuarioExterno,
} from '@prisma/client';
import { UsuarioInterno } from '../../domain/entities/usuario-interno.entity';
import { UsuarioExterno } from '../../domain/entities/usuario-externo.entity';
import { RolInterno } from '../../domain/enums/rol-interno.enum';
import { EstadoUsuarioExterno } from '../../domain/enums/estado-usuario-externo.enum';

export class UsuarioMapper {
  static toDomainInterno(raw: PrismaUsuarioInterno): UsuarioInterno {
    return new UsuarioInterno({
      id: raw.id,
      nombre: raw.nombre,
      email: raw.email,
      areaId: raw.areaId,
      rol: raw.rol as unknown as RolInterno,
      azureObjectId: raw.azureObjectId,
      activo: raw.activo,
      fechaCreacion: raw.fechaCreacion,
      fechaActualizacion: raw.fechaActualizacion,
    });
  }

  static toPersistenceInterno(entity: UsuarioInterno): PrismaUsuarioInterno {
    return {
      id: entity.id,
      nombre: entity.nombre,
      email: entity.email,
      passwordHash: null,
      areaId: entity.areaId,
      rol: entity.rol as unknown as PrismaRolInterno,
      azureObjectId: entity.azureObjectId || null,
      activo: entity.activo,
      fechaCreacion: entity.fechaCreacion || new Date(),
      fechaActualizacion: entity.fechaActualizacion || new Date(),
    };
  }

  static toDomainExterno(raw: PrismaUsuarioExterno): UsuarioExterno {
    return new UsuarioExterno({
      id: raw.id,
      nombre: raw.nombre,
      email: raw.email,
      passwordHash: raw.passwordHash,
      documento: raw.documento,
      organizacion: raw.organizacion,
      estado: raw.estado as unknown as EstadoUsuarioExterno,
      fechaAlta: raw.fechaAlta,
      fechaActualizacion: raw.fechaActualizacion,
    });
  }

  static toPersistenceExterno(entity: UsuarioExterno): PrismaUsuarioExterno {
    return {
      id: entity.id,
      nombre: entity.nombre,
      email: entity.email,
      passwordHash: entity.passwordHash ?? '',
      documento: entity.documento,
      organizacion: entity.organizacion,
      estado: entity.estado as unknown as PrismaEstadoUsuarioExterno,
      fechaAlta: entity.fechaAlta || new Date(),
      fechaActualizacion: entity.fechaActualizacion || new Date(),
    };
  }
}
