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
import { ListarAreasUseCase } from '../../application/use-cases/listar-areas.use-case';
import { ObtenerAreaUseCase } from '../../application/use-cases/obtener-area.use-case';
import { CrearAreaUseCase } from '../../application/use-cases/crear-area.use-case';
import { ActualizarAreaUseCase } from '../../application/use-cases/actualizar-area.use-case';
import { CreateAreaDto } from '../../dto/create-area.dto';
import { UpdateAreaDto } from '../../dto/update-area.dto';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { AreaResponseMapper } from '../../application/mappers/area-response.mapper';

@Controller('areas')
export class AreasController {
  constructor(
    private readonly listarAreasUseCase: ListarAreasUseCase,
    private readonly obtenerAreaUseCase: ObtenerAreaUseCase,
    private readonly crearAreaUseCase: CrearAreaUseCase,
    private readonly actualizarAreaUseCase: ActualizarAreaUseCase,
  ) {}

  @Get()
  async findAll(@Query('soloActivas') soloActivas?: string) {
    const activas = soloActivas === 'false' ? false : true;
    const areas = await this.listarAreasUseCase.execute(activas);
    return AreaResponseMapper.toListResponseDto(areas);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const area = await this.obtenerAreaUseCase.execute(id);
    return AreaResponseMapper.toResponseDto(area);
  }

  @Post()
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAreaDto) {
    const area = await this.crearAreaUseCase.execute({
      nombre: dto.nombre,
      codigo: dto.codigo,
      activa: dto.activa,
    });
    return AreaResponseMapper.toResponseDto(area);
  }

  @Put(':id')
  @UseGuards(InternalAuthGuard, RolesGuard)
  @Roles(RolInterno.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateAreaDto) {
    const area = await this.actualizarAreaUseCase.execute({
      id,
      nombre: dto.nombre,
      codigo: dto.codigo,
      activa: dto.activa,
    });
    return AreaResponseMapper.toResponseDto(area);
  }
}
