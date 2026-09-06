import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TIPO_TRAMITE_REPOSITORY_TOKEN } from './domain/repositories/tipo-tramite.repository.interface';
import { PrismaTipoTramiteRepository } from './infrastructure/repositories/prisma-tipo-tramite.repository';
import { TiposTramiteController } from './infrastructure/controllers/tipos-tramite.controller';
import { ListarTiposTramiteUseCase } from './application/use-cases/listar-tipos-tramite.use-case';
import { ObtenerTipoTramiteUseCase } from './application/use-cases/obtener-tipo-tramite.use-case';
import { CrearTipoTramiteUseCase } from './application/use-cases/crear-tipo-tramite.use-case';
import { ActualizarTipoTramiteUseCase } from './application/use-cases/actualizar-tipo-tramite.use-case';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TiposTramiteController],
  providers: [
    {
      provide: TIPO_TRAMITE_REPOSITORY_TOKEN,
      useClass: PrismaTipoTramiteRepository,
    },
    ListarTiposTramiteUseCase,
    ObtenerTipoTramiteUseCase,
    CrearTipoTramiteUseCase,
    ActualizarTipoTramiteUseCase,
  ],
  exports: [
    TIPO_TRAMITE_REPOSITORY_TOKEN,
    ListarTiposTramiteUseCase,
    ObtenerTipoTramiteUseCase,
    CrearTipoTramiteUseCase,
    ActualizarTipoTramiteUseCase,
  ],
})
export class TiposTramiteModule {}
