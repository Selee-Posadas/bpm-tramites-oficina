import { Inject, Injectable } from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../domain/repositories/usuario.repository.interface';
import {
  UsuarioResponseMapper,
  UsuarioInternoResponseDto,
} from '../mappers/usuario-response.mapper';

export { UsuarioInternoResponseDto };

@Injectable()
export class ListarUsuariosInternosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(areaId?: string): Promise<UsuarioInternoResponseDto[]> {
    const usuarios = await this.usuarioRepository.findAllInternos(areaId);
    return UsuarioResponseMapper.toListInternosResponseDto(usuarios);
  }
}
