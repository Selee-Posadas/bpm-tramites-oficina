import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrearTramiteUseCase } from '../../application/use-cases/crear-tramite.use-case';
import { ObtenerTramiteUseCase } from '../../application/use-cases/obtener-tramite.use-case';
import { ListarTramitesUseCase } from '../../application/use-cases/listar-tramites.use-case';
import { ModificarBorradorUseCase } from '../../application/use-cases/modificar-borrador.use-case';
import { EliminarTramiteBorradorUseCase } from '../../application/use-cases/eliminar-tramite-borrador.use-case';
import { CreateTramiteDto } from '../../dto/create-tramite.dto';
import { UpdateTramiteDto } from '../../dto/update-tramite.dto';
import { FiltrosTramiteDto } from '../../dto/filtros-tramite.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { TramiteResponseMapper } from '../../application/mappers/tramite-response.mapper';

@Controller('tramites')
@UseGuards(AnyAuthGuard)
export class TramitesController {
  constructor(
    private readonly crearTramiteUseCase: CrearTramiteUseCase,
    private readonly listarTramitesUseCase: ListarTramitesUseCase,
    private readonly obtenerTramiteUseCase: ObtenerTramiteUseCase,
    private readonly modificarBorradorUseCase: ModificarBorradorUseCase,
    private readonly eliminarTramiteBorradorUseCase: EliminarTramiteBorradorUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() query: FiltrosTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.listarTramitesUseCase.execute({
      filtros: query,
      usuarioTipo: user.tipo,
      usuarioId: user.id,
      rolInterno: user.rolInterno,
      areaUsuarioId: user.areaId,
    });
    const dtos = result.items.map((item) =>
      TramiteResponseMapper.toItemDto(item.tramite, item.tipo, item.sla),
    );
    return TramiteResponseMapper.toListDto(dtos, result.total, result.skip, result.take);
  }

  @Get(':id')
  @UseGuards(TramiteOwnershipGuard)
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const detalle = await this.obtenerTramiteUseCase.execute({
      tramiteId: id,
      usuarioTipo: user.tipo,
      usuarioId: user.id,
      rolInterno: user.rolInterno,
      areaUsuarioId: user.areaId,
    });
    return TramiteResponseMapper.toDetalleDto(
      detalle.tramite,
      detalle.tipoTramite,
      detalle.slaInfo,
      detalle.comentariosVisibles,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tramite = await this.crearTramiteUseCase.execute({
      tipoTramiteId: dto.tipoTramiteId,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      prioridad: dto.prioridad,
      usuarioTipo: user.tipo,
      usuarioId: user.id,
      areaDestinoId: user.areaId,
      usuarioExternoId:
        user.tipo === TipoUsuario.EXTERNO ? user.id : dto.usuarioExternoId,
      website: dto.website,
    });
    return TramiteResponseMapper.toCreadoDto(tramite);
  }

  @Put(':id')
  @UseGuards(TramiteOwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tramite = await this.modificarBorradorUseCase.execute({
      tramiteId: id,
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      prioridad: dto.prioridad,
      usuarioTipo: user.tipo,
      usuarioId: user.id,
    });
    return TramiteResponseMapper.toModificadoDto(tramite);
  }

  @Delete(':id')
  @UseGuards(TramiteOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.eliminarTramiteBorradorUseCase.execute({
      tramiteId: id,
      usuarioTipo: user.tipo,
      usuarioId: user.id,
    });
    return { message: 'Trámite borrador eliminado con éxito' };
  }
}
