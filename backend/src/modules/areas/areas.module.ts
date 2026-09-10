import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AREA_REPOSITORY_TOKEN } from './domain/repositories/area.repository.interface';
import { PrismaAreaRepository } from './infrastructure/repositories/prisma-area.repository';
import { AreasController } from './infrastructure/controllers/areas.controller';
import { ListarAreasUseCase } from './application/use-cases/listar-areas.use-case';
import { ObtenerAreaUseCase } from './application/use-cases/obtener-area.use-case';
import { CrearAreaUseCase } from './application/use-cases/crear-area.use-case';
import { ActualizarAreaUseCase } from './application/use-cases/actualizar-area.use-case';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [AreasController],
  providers: [
    {
      provide: AREA_REPOSITORY_TOKEN,
      useClass: PrismaAreaRepository,
    },
    ListarAreasUseCase,
    ObtenerAreaUseCase,
    CrearAreaUseCase,
    ActualizarAreaUseCase,
  ],
  exports: [
    AREA_REPOSITORY_TOKEN,
    ListarAreasUseCase,
    ObtenerAreaUseCase,
    CrearAreaUseCase,
    ActualizarAreaUseCase,
  ],
})
export class AreasModule {}
