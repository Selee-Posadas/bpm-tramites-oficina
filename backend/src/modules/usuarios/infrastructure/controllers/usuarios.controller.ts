import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../domain/repositories/usuario.repository.interface';
import { InternalAuthGuard } from '../../../auth/infrastructure/guards/internal-auth.guard';

@Controller('usuarios')
@UseGuards(InternalAuthGuard)
export class UsuariosController {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  @Get('internos')
  async findAllInternos(@Query('areaId') areaId?: string) {
    const usuarios = await this.usuarioRepository.findAllInternos(areaId);
    return usuarios.map((u) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      areaId: u.areaId,
      activo: u.activo,
    }));
  }

  @Get('internos/:id')
  async findInternoById(@Param('id') id: string) {
    const user = await this.usuarioRepository.findInternoById(id);
    if (!user) {
      throw new NotFoundException(`Usuario interno con ID ${id} no encontrado`);
    }
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      areaId: user.areaId,
      activo: user.activo,
    };
  }
}
