import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  IComentarioTramiteRepository,
  COMENTARIO_TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/comentario-tramite.repository.interface';
import {
  ITramiteRepository,
  TRAMITE_REPOSITORY_TOKEN,
} from '../../domain/repositories/tramite.repository.interface';
import { ComentarioTramite } from '../../domain/entities/comentario-tramite.entity';
import { CreateComentarioDto } from '../../dto/comentario.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { TipoUsuario } from '../../domain/enums/tipo-usuario.enum';
import { VisibilidadComentario } from '../../domain/enums/visibilidad-comentario.enum';
import * as crypto from 'crypto';

@Controller('tramites/:id/comentarios')
@UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
export class ComentariosController {
  constructor(
    @Inject(COMENTARIO_TRAMITE_REPOSITORY_TOKEN)
    private readonly comentarioRepository: IComentarioTramiteRepository,
    @Inject(TRAMITE_REPOSITORY_TOKEN)
    private readonly tramiteRepository: ITramiteRepository,
  ) {}

  @Get()
  async findByTramiteId(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const soloVisiblesParaExterno = user.tipo === TipoUsuario.EXTERNO;
    const comentarios = await this.comentarioRepository.findByTramiteId(
      id,
      soloVisiblesParaExterno,
    );

    return comentarios.map((c) => ({
      id: c.id,
      tramiteId: c.tramiteId,
      mensaje: c.mensaje,
      visibilidad: c.visibilidad,
      autorTipo: c.autorTipo,
      autorId: c.autorId,
      fecha: c.fecha,
    }));
  }

  @Post()
  async create(
    @Param('id') id: string,
    @Body() dto: CreateComentarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const tramite = await this.tramiteRepository.findById(id);
    if (!tramite) {
      throw new NotFoundException(`Trámite con ID ${id} no encontrado`);
    }

    let visibilidad = dto.visibilidad ?? VisibilidadComentario.INTERNA;

    // Si el comentario es de un usuario externo, forzar visibilidad pública / externa
    if (user.tipo === TipoUsuario.EXTERNO) {
      visibilidad = VisibilidadComentario.EXTERNA;
    }

    const comentario = new ComentarioTramite({
      id: crypto.randomUUID(),
      tramiteId: id,
      mensaje: dto.mensaje,
      visibilidad,
      autorTipo: user.tipo,
      autorId: user.id,
      fecha: new Date(),
    });

    const saved = await this.comentarioRepository.save(comentario);

    return {
      id: saved.id,
      tramiteId: saved.tramiteId,
      mensaje: saved.mensaje,
      visibilidad: saved.visibilidad,
      autorTipo: saved.autorTipo,
      autorId: saved.autorId,
      fecha: saved.fecha,
    };
  }
}
