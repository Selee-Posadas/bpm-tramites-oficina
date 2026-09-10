import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListarUsuariosInternosUseCase } from '../../application/use-cases/listar-usuarios-internos.use-case';
import { ObtenerUsuarioInternoUseCase } from '../../application/use-cases/obtener-usuario-interno.use-case';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';
import { UsuarioResponseMapper } from '../../application/mappers/usuario-response.mapper';

@Controller('usuarios')
@UseGuards(InternalAuthGuard)
export class UsuariosController {
  constructor(
    private readonly listarUsuariosInternosUseCase: ListarUsuariosInternosUseCase,
    private readonly obtenerUsuarioInternoUseCase: ObtenerUsuarioInternoUseCase,
  ) {}

  @Get('internos')
  async findAllInternos(@Query('areaId') areaId?: string) {
    const usuarios = await this.listarUsuariosInternosUseCase.execute(areaId);
    return UsuarioResponseMapper.toListInternosResponseDto(usuarios);
  }

  @Get('internos/:id')
  async findInternoById(@Param('id') id: string) {
    const usuario = await this.obtenerUsuarioInternoUseCase.execute(id);
    return UsuarioResponseMapper.toInternoResponseDto(usuario);
  }
}
