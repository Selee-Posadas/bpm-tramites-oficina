import { Inject, Injectable } from '@nestjs/common';
import {
  IUsuarioRepository,
  USUARIO_REPOSITORY_TOKEN,
} from '../../domain/repositories/usuario.repository.interface';
import { UsuarioInterno } from '../../domain/entities/usuario-interno.entity';

@Injectable()
export class ListarUsuariosInternosUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY_TOKEN)
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(areaId?: string): Promise<UsuarioInterno[]> {
    return await this.usuarioRepository.findAllInternos(areaId);
  }
}
