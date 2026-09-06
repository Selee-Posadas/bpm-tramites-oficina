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

@Controller('usuarios')
@UseGuards(InternalAuthGuard)
export class UsuariosController {
  constructor(
    private readonly listarUsuariosInternosUseCase: ListarUsuariosInternosUseCase,
    private readonly obtenerUsuarioInternoUseCase: ObtenerUsuarioInternoUseCase,
  ) {}

  @Get('internos')
  async findAllInternos(@Query('areaId') areaId?: string) {
    return await this.listarUsuariosInternosUseCase.execute(areaId);
  }

  @Get('internos/:id')
  async findInternoById(@Param('id') id: string) {
    return await this.obtenerUsuarioInternoUseCase.execute(id);
  }
}
