import { AuthExternalService } from '../../src/modules/auth/application/auth-external.service';
import { AuthInternalService } from '../../src/modules/auth/application/auth-internal.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RolInterno } from '../../src/modules/usuarios/domain/enums/rol-interno.enum';
import { EstadoUsuarioExterno } from '../../src/modules/usuarios/domain/enums/estado-usuario-externo.enum';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';

describe('Auth Services (External & Internal Mock)', () => {
  let prismaMock: any;
  let jwtService: JwtService;
  let authExternalService: AuthExternalService;
  let authInternalService: AuthInternalService;

  beforeEach(() => {
    prismaMock = {
      usuarioExterno: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      usuarioInterno: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      area: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = new JwtService({ secret: 'auth-test-secret' });
    authExternalService = new AuthExternalService(prismaMock, jwtService);
    authInternalService = new AuthInternalService(prismaMock, jwtService);
  });

  describe('AuthExternalService', () => {
    it('debe registrar un usuario externo con contraseña hasheada y retornar token', async () => {
      prismaMock.usuarioExterno.findUnique.mockResolvedValue(null);
      prismaMock.usuarioExterno.create.mockImplementation((args: any) =>
        Promise.resolve({
          id: 'ext-uuid-1',
          ...args.data,
        }),
      );

      const res = await authExternalService.register({
        nombre: 'Empresa Test',
        email: 'test@empresa.com',
        password: 'Password123!',
        documento: '30-11223344-5',
        organizacion: 'Empresa Test S.A.',
      });

      expect(res.accessToken).toBeDefined();
      expect(res.user.email).toBe('test@empresa.com');
      expect(res.user.tipo).toBe(TipoUsuario.EXTERNO);
      expect(prismaMock.usuarioExterno.create).toHaveBeenCalled();
    });

    it('debe rechazar registro con correo duplicado (409 Conflict)', async () => {
      prismaMock.usuarioExterno.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        authExternalService.register({
          nombre: 'Otra Empresa',
          email: 'test@empresa.com',
          password: 'Password123!',
          documento: '30-99887766-5',
          organizacion: 'Otra Empresa S.A.',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe autenticar exitosamente a un usuario externo con credenciales correctas', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      prismaMock.usuarioExterno.findUnique.mockResolvedValue({
        id: 'ext-1',
        email: 'user@test.com',
        nombre: 'Usuario Test',
        passwordHash,
        estado: EstadoUsuarioExterno.ACTIVO,
      });

      const res = await authExternalService.login({
        email: 'user@test.com',
        password: 'CorrectPassword!',
      });

      expect(res.accessToken).toBeDefined();
      expect(res.user.id).toBe('ext-1');
    });

    it('debe rechazar login si el usuario está bloqueado (401)', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      prismaMock.usuarioExterno.findUnique.mockResolvedValue({
        id: 'ext-1',
        email: 'user@test.com',
        nombre: 'Usuario Bloqueado',
        passwordHash,
        estado: EstadoUsuarioExterno.BLOQUEADO,
      });

      await expect(
        authExternalService.login({
          email: 'user@test.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar login si la contraseña es incorrecta (401)', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword!', 10);
      prismaMock.usuarioExterno.findUnique.mockResolvedValue({
        id: 'ext-1',
        email: 'user@test.com',
        passwordHash,
        estado: EstadoUsuarioExterno.ACTIVO,
      });

      await expect(
        authExternalService.login({
          email: 'user@test.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('AuthInternalService', () => {
    it('debe generar token mock con claims de Azure Entra ID para desarrollo local', async () => {
      prismaMock.usuarioInterno.findFirst.mockResolvedValue({
        id: 'int-op-1',
        nombre: 'Operador Compras',
        email: 'operador.compras@bpm.local',
        rol: RolInterno.OPERADOR,
        areaId: 'area-compras-id',
        activo: true,
      });

      const res = await authInternalService.loginMock({
        rol: RolInterno.OPERADOR,
      });

      expect(res.accessToken).toBeDefined();
      expect(res.user.rolInterno).toBe(RolInterno.OPERADOR);
      expect(res.user.tipo).toBe(TipoUsuario.INTERNO);
      expect(res.user.areaId).toBe('area-compras-id');

      const decoded: any = jwtService.decode(res.accessToken);
      expect(decoded.rol).toBe(RolInterno.OPERADOR);
      expect(decoded.tipo).toBe(TipoUsuario.INTERNO);
      expect(decoded.areaId).toBe('area-compras-id');
    });
  });
});
