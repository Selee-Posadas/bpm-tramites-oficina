import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tipo-tramite.repository.interface';
import { TipoTramite } from '../../domain/entities/tipo-tramite.entity';
import { CreateTipoTramiteDto } from '../../dto/create-tipo-tramite.dto';
import { UpdateTipoTramiteDto } from '../../dto/update-tipo-tramite.dto';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import * as crypto from 'crypto';

@Controller('tipos-tramite')
export class TiposTramiteController {
  constructor(
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
  ) {}

  @Get()
  async findAll(@Query('soloActivos') soloActivos?: string) {
    const activos = soloActivos === 'false' ? false : true;
    const tipos = await this.tipoTramiteRepository.findAll(activos);
    return tipos.map((t) => ({
      id: t.id,
      codigo: t.codigo,
      nombre: t.nombre,
      descripcion: t.descripcion,
      activo: t.activo,
      slaHoras: t.slaHoras,
      requiereExterno: t.requiereExterno,
      permiteInicioExterno: t.permiteInicioExterno,
      areaInicialId: t.areaInicialId,
      fechaCreacion: t.fechaCreacion,
    }));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const tipo = await this.tipoTramiteRepository.findById(id);
    if (!tipo) {
      throw new NotFoundException(`Tipo de trámite con ID ${id} no encontrado`);
    }
    return {
      id: tipo.id,
      codigo: tipo.codigo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      activo: tipo.activo,
      slaHoras: tipo.slaHoras,
      requiereExterno: tipo.requiereExterno,
      permiteInicioExterno: tipo.permiteInicioExterno,
      areaInicialId: tipo.areaInicialId,
      fechaCreacion: tipo.fechaCreacion,
    };
  }

  @Post()
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  async create(@Body() dto: CreateTipoTramiteDto) {
    const existing = await this.tipoTramiteRepository.findByCodigo(dto.codigo);
    if (existing) {
      throw new ConflictException(`Ya existe un tipo de trámite con el código ${dto.codigo}`);
    }

    const tipo = new TipoTramite({
      id: crypto.randomUUID(),
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      slaHoras: dto.slaHoras,
      areaInicialId: dto.areaInicialId,
      requiereExterno: dto.requiereExterno ?? false,
      permiteInicioExterno: dto.permiteInicioExterno ?? false,
      activo: dto.activo ?? true,
      fechaCreacion: new Date(),
    });

    const saved = await this.tipoTramiteRepository.save(tipo);
    return {
      id: saved.id,
      codigo: saved.codigo,
      nombre: saved.nombre,
      descripcion: saved.descripcion,
      activo: saved.activo,
      slaHoras: saved.slaHoras,
      requiereExterno: saved.requiereExterno,
      permiteInicioExterno: saved.permiteInicioExterno,
      areaInicialId: saved.areaInicialId,
      fechaCreacion: saved.fechaCreacion,
    };
  }

  @Put(':id')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateTipoTramiteDto) {
    const tipo = await this.tipoTramiteRepository.findById(id);
    if (!tipo) {
      throw new NotFoundException(`Tipo de trámite con ID ${id} no encontrado`);
    }

    if (dto.slaHoras) {
      tipo.actualizarSla(dto.slaHoras);
    }
    if (dto.activo !== undefined) {
      if (dto.activo) {
        tipo.activar();
      } else {
        tipo.desactivar();
      }
    }

    const updated = await this.tipoTramiteRepository.update(tipo);
    return {
      id: updated.id,
      codigo: updated.codigo,
      nombre: updated.nombre,
      descripcion: updated.descripcion,
      activo: updated.activo,
      slaHoras: updated.slaHoras,
      requiereExterno: updated.requiereExterno,
      permiteInicioExterno: updated.permiteInicioExterno,
      areaInicialId: updated.areaInicialId,
      fechaCreacion: updated.fechaCreacion,
    };
  }
}
