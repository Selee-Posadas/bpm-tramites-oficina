import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ListarTiposTramiteUseCase } from '../../application/use-cases/listar-tipos-tramite.use-case';
import { ObtenerTipoTramiteUseCase } from '../../application/use-cases/obtener-tipo-tramite.use-case';
import { CrearTipoTramiteUseCase } from '../../application/use-cases/crear-tipo-tramite.use-case';
import { ActualizarTipoTramiteUseCase } from '../../application/use-cases/actualizar-tipo-tramite.use-case';
import { CreateTipoTramiteDto } from '../../dto/create-tipo-tramite.dto';
import { UpdateTipoTramiteDto } from '../../dto/update-tipo-tramite.dto';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';

@Controller('tipos-tramite')
export class TiposTramiteController {
  constructor(
    private readonly listarTiposTramiteUseCase: ListarTiposTramiteUseCase,
    private readonly obtenerTipoTramiteUseCase: ObtenerTipoTramiteUseCase,
    private readonly crearTipoTramiteUseCase: CrearTipoTramiteUseCase,
    private readonly actualizarTipoTramiteUseCase: ActualizarTipoTramiteUseCase,
  ) {}

  @Get()
  async findAll(@Query('soloActivos') soloActivos?: string) {
    const activos = soloActivos === 'false' ? false : true;
    return await this.listarTiposTramiteUseCase.execute(activos);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.obtenerTipoTramiteUseCase.execute(id);
  }

  @Post()
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTipoTramiteDto) {
    return await this.crearTipoTramiteUseCase.execute({
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      slaHoras: dto.slaHoras,
      areaInicialId: dto.areaInicialId,
      requiereExterno: dto.requiereExterno,
      permiteInicioExterno: dto.permiteInicioExterno,
      activo: dto.activo,
    });
  }

  @Put(':id')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateTipoTramiteDto) {
    return await this.actualizarTipoTramiteUseCase.execute({
      id,
      slaHoras: dto.slaHoras,
      activo: dto.activo,
    });
  }
}
