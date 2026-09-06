import { Inject, Injectable } from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../domain/repositories/usuario.repository.interface';
import { EntityNotFoundException } from '../../../../shared/domain/exceptions/domain.exception';
import {
  UsuarioResponseMapper,
  UsuarioInternoResponseDto,
} from '../mappers/usuario-response.mapper';

@Injectable()
export class ObtenerUsuarioInternoUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(id: string): Promise<UsuarioInternoResponseDto> {
    const user = await this.usuarioRepository.findInternoById(id);
    if (!user) {
      throw new EntityNotFoundException('Usuario interno', id);
    }
    return UsuarioResponseMapper.toInternoResponseDto(user);
  }
}
