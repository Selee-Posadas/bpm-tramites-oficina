import { ExecutionContext, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InternalAuthGuard } from '../../src/modules/auth/infrastructure/guards/internal-auth.guard';
import { ExternalAuthGuard } from '../../src/modules/auth/infrastructure/guards/external-auth.guard';
import { RolesGuard } from '../../src/modules/auth/infrastructure/guards/roles.guard';
import { TramiteOwnershipGuard } from '../../src/modules/auth/infrastructure/guards/tramite-ownership.guard';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../src/modules/usuarios/domain/enums/rol-interno.enum';
import { Reflector } from '@nestjs/core';

describe('Auth Guards & Ownership', () => {
  let jwtService: JwtService;
  const jwtSecret = 'test-secret';

  beforeEach(() => {
    jwtService = new JwtService({ secret: jwtSecret });
  });

  const createMockContext = (headers: Record<string, string> = {}, params: Record<string, string> = {}, user?: any): ExecutionContext => {
    const req: any = {
      headers,
      params,
      user,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  describe('InternalAuthGuard', () => {
    let guard: InternalAuthGuard;

    beforeEach(() => {
      guard = new InternalAuthGuard(jwtService);
    });

    it('debe rechazar la solicitud si no hay header Authorization (401)', () => {
      const context = createMockContext();
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('debe rechazar la solicitud si se presenta un token de usuario externo (403)', () => {
      const token = jwtService.sign({
        sub: 'ext-1',
        email: 'proveedor@test.com',
        nombre: 'Proveedor',
        tipo: TipoUsuario.EXTERNO,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('debe permitir el acceso con un token de usuario interno válido', () => {
      const token = jwtService.sign({
        sub: 'int-1',
        email: 'operador@bpm.local',
        nombre: 'Operador',
        tipo: TipoUsuario.INTERNO,
        rol: RolInterno.OPERADOR,
        areaId: 'area-1',
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('ExternalAuthGuard', () => {
    let guard: ExternalAuthGuard;

    beforeEach(() => {
      guard = new ExternalAuthGuard(jwtService);
    });

    it('debe rechazar la solicitud si se presenta un token corporativo interno (403)', () => {
      const token = jwtService.sign({
        sub: 'int-1',
        email: 'admin@bpm.local',
        nombre: 'Admin',
        tipo: TipoUsuario.INTERNO,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('debe permitir el acceso con un token de usuario externo válido', () => {
      const token = jwtService.sign({
        sub: 'ext-1',
        email: 'proveedor@test.com',
        nombre: 'Proveedor Test',
        tipo: TipoUsuario.EXTERNO,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('RolesGuard', () => {
    let reflector: Reflector;
    let guard: RolesGuard;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    it('debe permitir acceso si el endpoint no requiere roles específicos', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext({}, {}, { rolInterno: RolInterno.OPERADOR });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('debe denegar acceso (403) si el usuario no tiene el rol requerido', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolInterno.SUPERVISOR, RolInterno.ADMIN]);
      const context = createMockContext({}, {}, { rolInterno: RolInterno.OPERADOR });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('debe denegar acceso (403) a un usuario con rol AUDITOR que intente ejecutar una mutación restringida', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolInterno.OPERADOR, RolInterno.SUPERVISOR]);
      const context = createMockContext({}, {}, { rolInterno: RolInterno.AUDITOR });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('debe permitir acceso si el usuario cuenta con el rol requerido', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolInterno.SUPERVISOR, RolInterno.ADMIN]);
      const context = createMockContext({}, {}, { rolInterno: RolInterno.ADMIN });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('TramiteOwnershipGuard', () => {
    let prismaMock: any;
    let guard: TramiteOwnershipGuard;

    beforeEach(() => {
      prismaMock = {
        tramite: {
          findUnique: jest.fn(),
        },
      };
      guard = new TramiteOwnershipGuard(prismaMock);
    });

    it('debe permitir acceso transparente si el usuario es de tipo INTERNO', async () => {
      const context = createMockContext({}, { id: 't-1' }, { tipo: TipoUsuario.INTERNO, id: 'user-int' });
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(prismaMock.tramite.findUnique).not.toHaveBeenCalled();
    });

    it('debe arrojar 404 NotFoundException si el trámite no existe', async () => {
      prismaMock.tramite.findUnique.mockResolvedValue(null);
      const context = createMockContext({}, { id: 't-inexistente' }, { tipo: TipoUsuario.EXTERNO, id: 'user-ext' });

      await expect(guard.canActivate(context)).rejects.toThrow(NotFoundException);
    });

    it('debe arrojar 403 ForbiddenException si el usuario externo intenta acceder a un trámite ajeno', async () => {
      prismaMock.tramite.findUnique.mockResolvedValue({
        id: 't-1',
        usuarioExternoId: 'otro-usuario',
        creadoPorId: 'otro-usuario',
      });
      const context = createMockContext({}, { id: 't-1' }, { tipo: TipoUsuario.EXTERNO, id: 'mi-usuario' });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('debe permitir el acceso si el usuario externo es el propietario del trámite', async () => {
      prismaMock.tramite.findUnique.mockResolvedValue({
        id: 't-1',
        usuarioExternoId: 'mi-usuario',
        creadoPorId: 'mi-usuario',
      });
      const context = createMockContext({}, { id: 't-1' }, { tipo: TipoUsuario.EXTERNO, id: 'mi-usuario' });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
