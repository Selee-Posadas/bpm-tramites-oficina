import { ExecutionContext, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InternalAuthGuard } from '../../src/modules/auth/infrastructure/guards/internal-auth.guard';
import { ExternalAuthGuard } from '../../src/modules/auth/infrastructure/guards/external-auth.guard';
import { RolesGuard } from '../../src/modules/auth/infrastructure/guards/roles.guard';
import { TramiteOwnershipGuard } from '../../src/modules/auth/infrastructure/guards/tramite-ownership.guard';
import { AnyAuthGuard } from '../../src/modules/auth/infrastructure/guards/any-auth.guard';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../src/modules/usuarios/domain/enums/rol-interno.enum';
import { Reflector } from '@nestjs/core';

describe('Auth Guards & Ownership (Security Hardened)', () => {
  let jwtService: JwtService;
  const jwtSecret = 'test-secret';

  beforeEach(() => {
    jwtService = new JwtService({ secret: jwtSecret });
  });

  const createMockContext = (
    headers: Record<string, string> = {},
    params: Record<string, string> = {},
    user?: any,
    method = 'GET',
    url = '/api/test',
  ): ExecutionContext => {
    const req: any = {
      headers,
      params,
      user,
      method,
      url,
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

    it('debe rechazar la solicitud si no hay header Authorization con mensaje opaco (401)', () => {
      const context = createMockContext();
      try {
        guard.canActivate(context);
        fail('Se esperaba UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe('Token inválido o expirado');
      }
    });

    it('debe rechazar la solicitud con 403 y mensaje opaco si un externo usa token en recurso interno (Aislamiento)', () => {
      const token = jwtService.sign({
        sub: 'ext-1',
        email: 'proveedor@test.com',
        nombre: 'Proveedor',
        tipo: TipoUsuario.EXTERNO,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });
      try {
        guard.canActivate(context);
        fail('Se esperaba ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe('No tiene permisos para acceder a este recurso');
      }
    });

    it('debe normalizar variaciones de mayúsculas/minúsculas y espacios en el header Bearer', () => {
      const token = jwtService.sign({
        sub: 'int-1',
        email: 'operador@bpm.local',
        nombre: 'Operador',
        tipo: TipoUsuario.INTERNO,
        rol: RolInterno.OPERADOR,
        areaId: 'area-1',
      });

      const contextLower = createMockContext({ authorization: `bearer   ${token}` });
      expect(guard.canActivate(contextLower)).toBe(true);

      const contextUpper = createMockContext({ authorization: `BEARER ${token}` });
      expect(guard.canActivate(contextUpper)).toBe(true);
    });
  });

  describe('ExternalAuthGuard', () => {
    let guard: ExternalAuthGuard;

    beforeEach(() => {
      guard = new ExternalAuthGuard(jwtService);
    });

    it('debe rechazar la solicitud con 403 y mensaje opaco si un interno usa token en recurso externo (Aislamiento)', () => {
      const token = jwtService.sign({
        sub: 'int-1',
        email: 'admin@bpm.local',
        nombre: 'Admin',
        tipo: TipoUsuario.INTERNO,
      });

      const context = createMockContext({ authorization: `Bearer ${token}` });
      try {
        guard.canActivate(context);
        fail('Se esperaba ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe('No tiene permisos para acceder a este recurso');
      }
    });

    it('debe permitir el acceso con token externo normalizando "bearer"', () => {
      const token = jwtService.sign({
        sub: 'ext-1',
        email: 'proveedor@test.com',
        nombre: 'Proveedor Test',
        tipo: TipoUsuario.EXTERNO,
      });

      const context = createMockContext({ authorization: `bearer ${token}` });
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

    it('debe denegar acceso con mensaje opaco (403) sin revelar roles requeridos ni rol actual (Prevención de fuga)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolInterno.SUPERVISOR, RolInterno.ADMIN]);
      const context = createMockContext({}, {}, { id: 'usr-1', rolInterno: RolInterno.OPERADOR });

      try {
        guard.canActivate(context);
        fail('Se esperaba ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe('No tiene permisos para acceder a este recurso');
        expect((error as ForbiddenException).message).not.toContain('SUPERVISOR');
        expect((error as ForbiddenException).message).not.toContain('OPERADOR');
      }
    });

    it('debe denegar acceso (403) a un usuario con rol AUDITOR que intente ejecutar una acción restringida', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolInterno.OPERADOR, RolInterno.SUPERVISOR]);
      const context = createMockContext({}, {}, { id: 'usr-2', rolInterno: RolInterno.AUDITOR });
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('debe permitir acceso si el usuario cuenta con el rol requerido', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RolInterno.SUPERVISOR, RolInterno.ADMIN]);
      const context = createMockContext({}, {}, { id: 'usr-3', rolInterno: RolInterno.ADMIN });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('TramiteOwnershipGuard', () => {
    let tramiteRepoMock: any;
    let guard: TramiteOwnershipGuard;

    beforeEach(() => {
      tramiteRepoMock = {
        findById: jest.fn(),
      };
      guard = new TramiteOwnershipGuard(tramiteRepoMock);
    });

    it('debe permitir acceso transparente si el usuario es de tipo INTERNO', async () => {
      const context = createMockContext({}, { id: 't-1' }, { tipo: TipoUsuario.INTERNO, id: 'user-int' });
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(tramiteRepoMock.findById).not.toHaveBeenCalled();
    });

    it('debe arrojar 404 NotFoundException con mensaje opaco si el trámite no existe', async () => {
      tramiteRepoMock.findById.mockResolvedValue(null);
      const context = createMockContext({}, { id: 't-inexistente' }, { tipo: TipoUsuario.EXTERNO, id: 'user-ext' });

      try {
        await guard.canActivate(context);
        fail('Se esperaba NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect((error as NotFoundException).message).toBe('Trámite no encontrado');
      }
    });

    it('debe arrojar 403 ForbiddenException con mensaje opaco si el usuario externo intenta acceder a un trámite ajeno', async () => {
      tramiteRepoMock.findById.mockResolvedValue({
        id: 't-1',
        usuarioExternoId: 'otro-usuario',
        creadoPorId: 'otro-usuario',
      });
      const context = createMockContext({}, { id: 't-1' }, { tipo: TipoUsuario.EXTERNO, id: 'mi-usuario' });

      try {
        await guard.canActivate(context);
        fail('Se esperaba ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect((error as ForbiddenException).message).toBe('No tiene permisos para acceder a este recurso');
      }
    });

    it('debe permitir el acceso si el usuario externo es el propietario del trámite', async () => {
      tramiteRepoMock.findById.mockResolvedValue({
        id: 't-1',
        usuarioExternoId: 'mi-usuario',
        creadoPorId: 'mi-usuario',
      });
      const context = createMockContext({}, { id: 't-1' }, { tipo: TipoUsuario.EXTERNO, id: 'mi-usuario' });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });
  });

  describe('AnyAuthGuard', () => {
    let guard: AnyAuthGuard;

    beforeEach(() => {
      guard = new AnyAuthGuard(jwtService);
    });

    it('debe aceptar token interno válido con prefijo normalizado', () => {
      const token = jwtService.sign({
        sub: 'int-1',
        email: 'user@bpm.local',
        nombre: 'Usuario Interno',
        tipo: TipoUsuario.INTERNO,
        rol: RolInterno.OPERADOR,
        areaId: 'area-1',
      });

      const context = createMockContext({ authorization: `bearer  ${token}` });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('debe aceptar token externo válido con prefijo normalizado', () => {
      const token = jwtService.sign({
        sub: 'ext-1',
        email: 'user@externo.local',
        nombre: 'Usuario Externo',
        tipo: TipoUsuario.EXTERNO,
      });

      const context = createMockContext({ authorization: `BEARER ${token}` });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('debe rechazar tokens malformados con mensaje opaco (401)', () => {
      const context = createMockContext({ authorization: 'Bearer token-invalido' });
      try {
        guard.canActivate(context);
        fail('Se esperaba UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect((error as UnauthorizedException).message).toBe('Token inválido o expirado');
      }
    });
  });
});
