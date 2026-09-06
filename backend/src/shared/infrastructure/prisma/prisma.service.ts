import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Optional() configService?: ConfigService) {
    const dbUrl = configService?.get<string>('DATABASE_URL') || process.env.DATABASE_URL;

    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = dbUrl;
    }

    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma conectado exitosamente a PostgreSQL');
    } catch (error) {
      this.logger.warn(`No se pudo conectar a PostgreSQL en el arranque: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma desconectado');
  }
}
