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
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
  TramiteFiltros,
} from '../../domain/repositories/tramite.repository.interface';
import {
  ITipoTramiteRepository,
  TIPO_TRAMITE_REPOSITORY_TOKEN,
} from '../../../tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { CrearTramiteUseCase } from '../../application/use-cases/crear-tramite.use-case';
import { ObtenerTramiteUseCase } from '../../application/use-cases/obtener-tramite.use-case';
import { CreateTramiteDto } from '../../dto/create-tramite.dto';
import { UpdateTramiteDto } from '../../dto/update-tramite.dto';
import { FiltrosTramiteDto } from '../../dto/filtros-tramite.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../../usuarios/domain/enums/rol-interno.enum';
import { SlaCalculatorService } from '../../domain/services/sla-calculator.service';
import { EstadoTramite } from '../../domain/enums/estado-tramite.enum';

@Controller('tramites')
@UseGuards(AnyAuthGuard)
export class TramitesController {
  constructor(
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
    @Inject(TIPO_TRAMITE_REPOSITORY_TOKEN)
    private readonly tipoTramiteRepository: ITipoTramiteRepository,
    private readonly crearTramiteUseCase: CrearTramiteUseCase,
    private readonly obtenerTramiteUseCase: ObtenerTramiteUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() query: FiltrosTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const filtros: TramiteFiltros = {
      estado: query.estado,
      origen: query.origen,
      prioridad: query.prioridad,
      areaActualId: query.areaActualId,
      usuarioAsignadoId: query.usuarioAsignadoId,
      usuarioExternoId: query.usuarioExternoId,
      busqueda: query.busqueda,
      skip: query.skip,
      take: query.take,
    };

    // Aislamiento: Los usuarios externos solo pueden listar sus propios trámites
    if (user.tipo === TipoUsuario.EXTERNO) {
      filtros.usuarioExternoId = user.id;
    }

    const { tramites, total } = await this.tramiteRepository.findAll(filtros);

    // Enriquecer con SLA
    const items = await Promise.all(
      tramites.map(async (t) => {
        const tipo = await this.tipoTramiteRepository.findById(t.tipoTramiteId);
        const slaHoras = tipo ? tipo.slaHoras : 24;
        const slaInfo = SlaCalculatorService.calcularSla(t, slaHoras);

        return {
          id: t.id,
          numero: t.numero,
          tipoTramiteId: t.tipoTramiteId,
          tipoTramiteNombre: tipo?.nombre || 'Trámite',
          titulo: t.titulo,
          descripcion: t.descripcion,
          origen: t.origen,
          estado: t.estado,
          prioridad: t.prioridad,
          areaActualId: t.areaActualId,
          usuarioAsignadoId: t.usuarioAsignadoId,
          usuarioExternoId: t.usuarioExternoId,
          creadoPorTipo: t.creadoPorTipo,
          creadoPorId: t.creadoPorId,
          fechaCreacion: t.fechaCreacion,
          fechaActualizacion: t.fechaActualizacion,
          fechaCierre: t.fechaCierre,
          sla: slaInfo,
        };
      }),
    );

    return {
      items,
      total,
      skip: query.skip || 0,
      take: query.take || 20,
    };
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

    const t = detalle.tramite;
    const tipo = await this.tipoTramiteRepository.findById(t.tipoTramiteId);

    // Filtrar comentarios internos para usuarios externos (Regla de oro de confidencialidad)
    const comentariosVisibles =
      user.tipo === TipoUsuario.EXTERNO
        ? t.comentarios.filter((c) => c.esVisibleParaExterno())
        : t.comentarios;

    return {
      id: t.id,
      numero: t.numero,
      tipoTramiteId: t.tipoTramiteId,
      tipoTramiteNombre: tipo?.nombre || 'Trámite',
      tipoTramiteCodigo: tipo?.codigo,
      titulo: t.titulo,
      descripcion: t.descripcion,
      origen: t.origen,
      estado: t.estado,
      prioridad: t.prioridad,
      areaActualId: t.areaActualId,
      usuarioAsignadoId: t.usuarioAsignadoId,
      usuarioExternoId: t.usuarioExternoId,
      creadoPorTipo: t.creadoPorTipo,
      creadoPorId: t.creadoPorId,
      fechaCreacion: t.fechaCreacion,
      fechaActualizacion: t.fechaActualizacion,
      fechaCierre: t.fechaCierre,
      sla: detalle.slaInfo,
      movimientos: t.movimientos.map((m) => ({
        id: m.id,
        estadoAnterior: m.estadoAnterior,
        estadoNuevo: m.estadoNuevo,
        areaAnteriorId: m.areaAnteriorId,
        areaNuevaId: m.areaNuevaId,
        usuarioTipo: m.usuarioTipo,
        usuarioId: m.usuarioId,
        accion: m.accion,
        comentario: m.comentario,
        metadata: m.metadata,
        fecha: m.fecha,
      })),
      documentos: t.documentos.map((d) => ({
        id: d.id,
        nombreArchivo: d.nombreArchivo,
        mimeType: d.mimeType,
        size: d.size,
        storageKey: d.storageKey,
        subidoPorTipo: d.subidoPorTipo,
        subidoPorId: d.subidoPorId,
        fechaCarga: d.fechaCarga,
      })),
      comentarios: comentariosVisibles.map((c) => ({
        id: c.id,
        mensaje: c.mensaje,
        visibilidad: c.visibilidad,
        autorTipo: c.autorTipo,
        autorId: c.autorId,
        fecha: c.fecha,
      })),
    };
  }

  @Post()
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
    });

    return {
      id: tramite.id,
      numero: tramite.numero,
      estado: tramite.estado,
      origen: tramite.origen,
      titulo: tramite.titulo,
      prioridad: tramite.prioridad,
      fechaCreacion: tramite.fechaCreacion,
    };
  }

  @Put(':id')
  @UseGuards(TramiteOwnershipGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTramiteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tramite = await this.tramiteRepository.findById(id);
    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    if (user.tipo === TipoUsuario.EXTERNO && tramite.usuarioExternoId !== user.id) {
      throw new ForbiddenException('No tiene permisos para modificar este trámite');
    }

    tramite.modificarBorrador(
      dto.titulo ?? tramite.titulo,
      dto.descripcion ?? tramite.descripcion,
      dto.prioridad ?? tramite.prioridad,
    );

    const updated = await this.tramiteRepository.update(tramite);
    return {
      id: updated.id,
      numero: updated.numero,
      titulo: updated.titulo,
      descripcion: updated.descripcion,
      prioridad: updated.prioridad,
      fechaActualizacion: updated.fechaActualizacion,
    };
  }

  @Delete(':id')
  @UseGuards(TramiteOwnershipGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tramite = await this.tramiteRepository.findById(id);
    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    if (tramite.estado !== EstadoTramite.BORRADOR) {
      throw new ForbiddenException('Solo se pueden eliminar trámites en estado BORRADOR');
    }

    if (user.tipo === TipoUsuario.EXTERNO && tramite.usuarioExternoId !== user.id) {
      throw new ForbiddenException('No tiene permisos para eliminar este trámite');
    }

    await this.tramiteRepository.delete(id);
    return { message: 'Trámite borrador eliminado con éxito' };
  }
}
