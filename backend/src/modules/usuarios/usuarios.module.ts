import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { USUARIO_REPOSITORY_TOKEN } from './domain/repositories/usuario.repository.interface';
import { PrismaUsuarioRepository } from './infrastructure/repositories/prisma-usuario.repository';
import { UsuariosController } from './infrastructure/controllers/usuarios.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsuariosController],
  providers: [
    {
      provide: USUARIO_REPOSITORY_TOKEN,
      useClass: PrismaUsuarioRepository,
    },
  ],
  exports: [USUARIO_REPOSITORY_TOKEN],
})
export class UsuariosModule {}
