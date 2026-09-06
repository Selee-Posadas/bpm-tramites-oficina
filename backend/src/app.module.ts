import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AreasModule } from './modules/areas/areas.module';
import { TiposTramiteModule } from './modules/tipos-tramite/tipos-tramite.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { TramitesModule } from './modules/tramites/tramites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    AreasModule,
    TiposTramiteModule,
    UsuariosModule,
    TramitesModule,
  ],
})
export class AppModule {}
