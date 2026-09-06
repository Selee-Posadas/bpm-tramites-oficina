import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return status ok and connected database', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(typeof result.uptime).toBe('number');
    expect(result.timestamp).toBeDefined();
  });

  it('should return disconnected when database query fails', async () => {
    jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('DB error'));
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('disconnected');
  });
});
