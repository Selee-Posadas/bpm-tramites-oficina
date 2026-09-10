import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AgregarComentarioUseCase } from '../../application/use-cases/agregar-comentario.use-case';
import { ListarComentariosUseCase } from '../../application/use-cases/listar-comentarios.use-case';
import { CreateComentarioDto } from '../../dto/comentario.dto';
import { AnyAuthGuard } from '../../../auth/infrastructure/guards/any-auth.guard';
import { TramiteOwnershipGuard } from '../../../auth/infrastructure/guards/tramite-ownership.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/domain/auth-user.interface';
import { TramiteResponseMapper } from '../../application/mappers/tramite-response.mapper';

@Controller('tramites/:id/comentarios')
@UseGuards(AnyAuthGuard, TramiteOwnershipGuard)
export class ComentariosController {
  constructor(
    private readonly agregarComentarioUseCase: AgregarComentarioUseCase,
    private readonly listarComentariosUseCase: ListarComentariosUseCase,
  ) {}

  @Get()
  async findByTramiteId(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const comentarios = await this.listarComentariosUseCase.execute({
      tramiteId: id,
      usuarioTipo: user.tipo,
    });
    return comentarios.map(TramiteResponseMapper.toComentarioDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('id') id: string,
    @Body() dto: CreateComentarioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const comentario = await this.agregarComentarioUseCase.execute({
      tramiteId: id,
      mensaje: dto.mensaje,
      visibilidad: dto.visibilidad,
      usuarioTipo: user.tipo,
      usuarioId: user.id,
    });
    return TramiteResponseMapper.toComentarioDto(comentario);
  }
}
