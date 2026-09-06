import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../shared/infrastructure/prisma/prisma.module';
import { AuthExternalService } from './application/auth-external.service';
import { AuthInternalService } from './application/auth-internal.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { ExternalAuthGuard } from './infrastructure/guards/external-auth.guard';
import { InternalAuthGuard } from './infrastructure/guards/internal-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { TramiteOwnershipGuard } from './infrastructure/guards/tramite-ownership.guard';
import { AnyAuthGuard } from './infrastructure/guards/any-auth.guard';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'bpm-super-secret-jwt-key-for-development-2025',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthExternalService,
    AuthInternalService,
    ExternalAuthGuard,
    InternalAuthGuard,
    RolesGuard,
    TramiteOwnershipGuard,
    AnyAuthGuard,
  ],
  exports: [
    JwtModule,
    AuthExternalService,
    AuthInternalService,
    ExternalAuthGuard,
    InternalAuthGuard,
    RolesGuard,
    TramiteOwnershipGuard,
    AnyAuthGuard,
  ],
})
export class AuthModule {}
