import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { USUARIO_REPOSITORY_TOKEN } from './domain/repositories/usuario.repository.interface';
import { PrismaUsuarioRepository } from './infrastructure/repositories/prisma-usuario.repository';
import { UsuariosController } from './infrastructure/controllers/usuarios.controller';
import { ListarUsuariosInternosUseCase } from './application/use-cases/listar-usuarios-internos.use-case';
import { ObtenerUsuarioInternoUseCase } from './application/use-cases/obtener-usuario-interno.use-case';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [UsuariosController],
  providers: [
    {
      provide: USUARIO_REPOSITORY_TOKEN,
      useClass: PrismaUsuarioRepository,
    },
    ListarUsuariosInternosUseCase,
    ObtenerUsuarioInternoUseCase,
  ],
  exports: [
    USUARIO_REPOSITORY_TOKEN,
    ListarUsuariosInternosUseCase,
    ObtenerUsuarioInternoUseCase,
  ],
})
export class UsuariosModule {}
