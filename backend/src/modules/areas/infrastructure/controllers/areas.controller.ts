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
  IAreaRepository,
  AREA_REPOSITORY_TOKEN,
} from '../../domain/repositories/area.repository.interface';
import { Area } from '../../domain/entities/area.entity';
import { CreateAreaDto } from '../../dto/create-area.dto';
import { UpdateAreaDto } from '../../dto/update-area.dto';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import * as crypto from 'crypto';

@Controller('areas')
export class AreasController {
  constructor(
    @Inject(AREA_REPOSITORY_TOKEN)
    private readonly areaRepository: IAreaRepository,
  ) {}

  @Get()
  async findAll(@Query('soloActivas') soloActivas?: string) {
    const activas = soloActivas === 'false' ? false : true;
    const areas = await this.areaRepository.findAll(activas);
    return areas.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      codigo: a.codigo,
      activa: a.activa,
      fechaCreacion: a.fechaCreacion,
    }));
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }
    return {
      id: area.id,
      nombre: area.nombre,
      codigo: area.codigo,
      activa: area.activa,
      fechaCreacion: area.fechaCreacion,
    };
  }

  @Post()
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  async create(@Body() dto: CreateAreaDto) {
    const existing = await this.areaRepository.findByCodigo(dto.codigo);
    if (existing) {
      throw new ConflictException(`Ya existe un área con el código ${dto.codigo}`);
    }

    const area = new Area({
      id: crypto.randomUUID(),
      nombre: dto.nombre,
      codigo: dto.codigo,
      activa: dto.activa ?? true,
      fechaCreacion: new Date(),
    });

    const saved = await this.areaRepository.save(area);
    return {
      id: saved.id,
      nombre: saved.nombre,
      codigo: saved.codigo,
      activa: saved.activa,
      fechaCreacion: saved.fechaCreacion,
    };
  }

  @Put(':id')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }

    if (dto.nombre || dto.codigo) {
      area.actualizar(dto.nombre ?? area.nombre, dto.codigo ?? area.codigo);
    }

    if (dto.activa !== undefined) {
      if (dto.activa) {
        area.activar();
      } else {
        area.desactivar();
      }
    }

    const updated = await this.areaRepository.update(area);
    return {
      id: updated.id,
      nombre: updated.nombre,
      codigo: updated.codigo,
      activa: updated.activa,
      fechaCreacion: updated.fechaCreacion,
    };
  }
}
