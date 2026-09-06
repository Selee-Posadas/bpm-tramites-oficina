import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TIPO_TRAMITE_REPOSITORY_TOKEN } from './domain/repositories/tipo-tramite.repository.interface';
import { PrismaTipoTramiteRepository } from './infrastructure/repositories/prisma-tipo-tramite.repository';
import { TiposTramiteController } from './infrastructure/controllers/tipos-tramite.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TiposTramiteController],
  providers: [
    {
      provide: TIPO_TRAMITE_REPOSITORY_TOKEN,
      useClass: PrismaTipoTramiteRepository,
    },
  ],
  exports: [TIPO_TRAMITE_REPOSITORY_TOKEN],
})
export class TiposTramiteModule {}
