import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AREA_REPOSITORY_TOKEN } from './domain/repositories/area.repository.interface';
import { PrismaAreaRepository } from './infrastructure/repositories/prisma-area.repository';
import { AreasController } from './infrastructure/controllers/areas.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AreasController],
  providers: [
    {
      provide: AREA_REPOSITORY_TOKEN,
      useClass: PrismaAreaRepository,
    },
  ],
  exports: [AREA_REPOSITORY_TOKEN],
})
export class AreasModule {}
