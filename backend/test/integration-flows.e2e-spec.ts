import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthExternalService } from '../src/modules/auth/application/auth-external.service';
import { AuthInternalService } from '../src/modules/auth/application/auth-internal.service';
import { CrearTramiteUseCase } from '../src/modules/tramites/application/use-cases/crear-tramite.use-case';
import { IngresarTramiteUseCase } from '../src/modules/tramites/application/use-cases/ingresar-tramite.use-case';
import { TomarTramiteUseCase } from '../src/modules/tramites/application/use-cases/tomar-tramite.use-case';
import { ObservarTramiteUseCase } from '../src/modules/tramites/application/use-cases/observar-tramite.use-case';
import { ResponderObservacionUseCase } from '../src/modules/tramites/application/use-cases/responder-observacion.use-case';
import { AprobarTramiteUseCase } from '../src/modules/tramites/application/use-cases/aprobar-tramite.use-case';
import { TramiteOwnershipGuard } from '../src/modules/auth/infrastructure/guards/tramite-ownership.guard';
import { Tramite } from '../src/modules/tramites/domain/entities/tramite.entity';
import { MovimientoTramite } from '../src/modules/tramites/domain/entities/movimiento-tramite.entity';
import { TipoTramite } from '../src/modules/tipos-tramite/domain/entities/tipo-tramite.entity';
import { UsuarioExterno } from '../src/modules/usuarios/domain/entities/usuario-externo.entity';
import { UsuarioInterno } from '../src/modules/usuarios/domain/entities/usuario-interno.entity';
import { Area } from '../src/modules/areas/domain/entities/area.entity';
import { EstadoTramite } from '../src/modules/tramites/domain/enums/estado-tramite.enum';
import { AccionWorkflow } from '../src/modules/tramites/domain/enums/accion-workflow.enum';
import { OrigenTramite } from '../src/modules/tramites/domain/enums/origen-tramite.enum';
import { TipoUsuario } from '../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { PrioridadTramite } from '../src/modules/tramites/domain/enums/prioridad-tramite.enum';
import { RolInterno } from '../src/modules/usuarios/domain/enums/rol-interno.enum';
import { ITramiteRepository } from '../src/modules/tramites/domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository } from '../src/modules/tramites/domain/repositories/movimiento-tramite.repository.interface';
import { ITipoTramiteRepository } from '../src/modules/tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { IUsuarioRepository } from '../src/modules/usuarios/domain/repositories/usuario.repository.interface';
import { IAreaRepository } from '../src/modules/areas/domain/repositories/area.repository.interface';
import {
  UnauthorizedActionException,
  ConcurrencyConflictException,
} from '../src/shared/domain/exceptions/domain.exception';
import { AuthenticatedUser } from '../src/modules/auth/domain/auth-user.interface';

describe('Integration Tests Obligatorios (End-to-End Workflow & Security)', () => {
  const tramitesStore = new Map<string, Tramite>();
  const movimientosStore: MovimientoTramite[] = [];
  const usuariosExternosStore = new Map<string, UsuarioExterno>();
  const usuariosInternosStore = new Map<string, UsuarioInterno>();
  const tiposTramiteStore = new Map<string, TipoTramite>();
  const areasStore = new Map<string, Area>();

  let jwtService: JwtService;
  let authExternalService: AuthExternalService;
  let authInternalService: AuthInternalService;

  let tramiteRepo: ITramiteRepository;
  let movimientoRepo: IMovimientoTramiteRepository;
  let tipoTramiteRepo: ITipoTramiteRepository;
  let usuarioRepo: IUsuarioRepository;
  let areaRepo: IAreaRepository;

  let crearTramiteUseCase: CrearTramiteUseCase;
  let ingresarTramiteUseCase: IngresarTramiteUseCase;
  let tomarTramiteUseCase: TomarTramiteUseCase;
  let observarTramiteUseCase: ObservarTramiteUseCase;
  let responderObservacionUseCase: ResponderObservacionUseCase;
  let aprobarTramiteUseCase: AprobarTramiteUseCase;
  let tramiteOwnershipGuard: TramiteOwnershipGuard;

  let externalToken = '';
  let externalUserId = '';
  let createdTramiteId = '';
  const internalOperatorId = 'op-legales-1';
  const legalesAreaId = 'area-legales';

  beforeAll(async () => {
    jwtService = new JwtService({ secret: 'super-secret-integration-key' });

    tramiteRepo = {
      findById: jest.fn(async (id: string) => tramitesStore.get(id) || null),
      findByNumero: jest.fn(
        async (num: string) =>
          Array.from(tramitesStore.values()).find((t) => t.numero === num) || null,
      ),
      findAll: jest.fn(async () => ({
        tramites: Array.from(tramitesStore.values()),
        total: tramitesStore.size,
      })),
      save: jest.fn(async (tramite: Tramite) => {
        tramitesStore.set(tramite.id, tramite);
        return tramite;
      }),
      update: jest.fn(async (tramite: Tramite) => {
        tramitesStore.set(tramite.id, tramite);
        return tramite;
      }),
      updateIfUnassigned: jest.fn(async (tramite: Tramite) => {
        const existing = tramitesStore.get(tramite.id);
        if (
          existing &&
          existing.usuarioAsignadoId &&
          existing.usuarioAsignadoId !== tramite.usuarioAsignadoId
        ) {
          throw new ConcurrencyConflictException('El trámite ya fue tomado por otro operador');
        }
        tramitesStore.set(tramite.id, tramite);
        return tramite;
      }),
      delete: jest.fn(async (id: string) => {
        tramitesStore.delete(id);
      }),
      countByEstado: jest.fn(async () => ({}) as Record<EstadoTramite, number>),
      countByOrigen: jest.fn(async () => ({}) as Record<OrigenTramite, number>),
      countByArea: jest.fn(async () => [] as Array<{ areaId: string; cantidad: number }>),
    };

    movimientoRepo = {
      findById: jest.fn(async (id: string) => movimientosStore.find((m) => m.id === id) || null),
      findByTramiteId: jest.fn(async (tramiteId: string) =>
        movimientosStore.filter((m) => m.tramiteId === tramiteId),
      ),
      save: jest.fn(async (m: MovimientoTramite) => {
        movimientosStore.push(m);
        return m;
      }),
      findUltimosMovimientos: jest.fn(async () => movimientosStore.slice(-10)),
    };

    tipoTramiteRepo = {
      findById: jest.fn(async (id: string) => tiposTramiteStore.get(id) || null),
      findByCodigo: jest.fn(
        async (cod: string) =>
          Array.from(tiposTramiteStore.values()).find((t) => t.codigo === cod) || null,
      ),
      findAll: jest.fn(async () => Array.from(tiposTramiteStore.values())),
      save: jest.fn(async (t: TipoTramite) => {
        tiposTramiteStore.set(t.id, t);
        return t;
      }),
      update: jest.fn(async (t: TipoTramite) => {
        tiposTramiteStore.set(t.id, t);
        return t;
      }),
    };

    usuarioRepo = {
      findAllInternos: jest.fn(async () => Array.from(usuariosInternosStore.values())),
      findExternoByEmail: jest.fn(
        async (email: string) =>
          Array.from(usuariosExternosStore.values()).find((u) => u.email === email) || null,
      ),
      findExternoById: jest.fn(async (id: string) => usuariosExternosStore.get(id) || null),
      saveExterno: jest.fn(async (u: UsuarioExterno) => {
        usuariosExternosStore.set(u.id, u);
        return u;
      }),
      findInternoByEmail: jest.fn(
        async (email: string) =>
          Array.from(usuariosInternosStore.values()).find((u) => u.email === email) || null,
      ),
      findInternoByRol: jest.fn(
        async (rol: RolInterno) =>
          Array.from(usuariosInternosStore.values()).find((u) => u.rol === rol) || null,
      ),
      findInternoById: jest.fn(async (id: string) => usuariosInternosStore.get(id) || null),
      saveInterno: jest.fn(async (u: UsuarioInterno) => {
        usuariosInternosStore.set(u.id, u);
        return u;
      }),
    };

    areaRepo = {
      findById: jest.fn(async (id: string) => areasStore.get(id) || null),
      findByCodigo: jest.fn(
        async (cod: string) =>
          Array.from(areasStore.values()).find((a) => a.codigo === cod) || null,
      ),
      findAll: jest.fn(async () => Array.from(areasStore.values())),
      save: jest.fn(async (a: Area) => {
        areasStore.set(a.id, a);
        return a;
      }),
      update: jest.fn(async (a: Area) => {
        areasStore.set(a.id, a);
        return a;
      }),
    };

    const areaLegales = new Area({
      id: legalesAreaId,
      nombre: 'Asuntos Legales',
      codigo: 'LEG',
      activa: true,
    });
    areasStore.set(areaLegales.id, areaLegales);

    const tipoProveedor = new TipoTramite({
      id: 'tipo-prov-1',
      codigo: 'ALTA-PROV',
      nombre: 'Alta de Proveedor en Padrón',
      descripcion: 'Inscripción formal de empresas y proveedores',
      activo: true,
      requiereExterno: false,
      permiteInicioExterno: true,
      slaHoras: 72,
      areaInicialId: legalesAreaId,
    });
    tiposTramiteStore.set(tipoProveedor.id, tipoProveedor);

    const operadorLegales = new UsuarioInterno({
      id: internalOperatorId,
      nombre: 'Abogada Operadora',
      email: 'operador.legales@bpm.local',
      rol: RolInterno.OPERADOR,
      areaId: legalesAreaId,
      activo: true,
    });
    usuariosInternosStore.set(operadorLegales.id, operadorLegales);

    authExternalService = new AuthExternalService(usuarioRepo, jwtService);
    authInternalService = new AuthInternalService(usuarioRepo, areaRepo, jwtService);

    crearTramiteUseCase = new CrearTramiteUseCase(tramiteRepo, tipoTramiteRepo, movimientoRepo);
    ingresarTramiteUseCase = new IngresarTramiteUseCase(tramiteRepo, movimientoRepo);
    tomarTramiteUseCase = new TomarTramiteUseCase(tramiteRepo, movimientoRepo);
    observarTramiteUseCase = new ObservarTramiteUseCase(tramiteRepo, movimientoRepo);
    responderObservacionUseCase = new ResponderObservacionUseCase(tramiteRepo, movimientoRepo);
    aprobarTramiteUseCase = new AprobarTramiteUseCase(tramiteRepo, movimientoRepo);
    tramiteOwnershipGuard = new TramiteOwnershipGuard(tramiteRepo);
  });

  const createMockContext = (
    user: AuthenticatedUser,
    params: Record<string, string> = {},
  ): ExecutionContext => {
    const req = { user, params, method: 'GET', url: '/api/test' };
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('1. login externo: debe autenticar usuario externo con credenciales correctas y emitir JWT con claims', async () => {
    const regResult = await authExternalService.register({
      nombre: 'Constructora del Norte S.A.',
      email: 'contacto@constructora.com',
      password: 'PasswordSegura2026!',
      documento: '30-71234567-9',
      organizacion: 'Constructora del Norte',
    });

    externalUserId = regResult.user.id;
    expect(externalUserId).toBeDefined();

    const loginResult = await authExternalService.login({
      email: 'contacto@constructora.com',
      password: 'PasswordSegura2026!',
    });

    expect(loginResult.accessToken).toBeDefined();
    externalToken = loginResult.accessToken;

    const payload = jwtService.verify<{ sub: string; email: string; tipo: TipoUsuario }>(
      externalToken,
    );
    expect(payload.sub).toBe(externalUserId);
    expect(payload.email).toBe('contacto@constructora.com');
    expect(payload.tipo).toBe(TipoUsuario.EXTERNO);
  });

  it('2. crear trámite externo: debe crear trámite en BORRADOR e ingresarlo con registro de movimientos', async () => {
    const tramiteCreado = await crearTramiteUseCase.execute({
      tipoTramiteId: 'tipo-prov-1',
      titulo: 'Inscripción Proveedor Obra Pública',
      descripcion: 'Presentación de estatutos, poder y constancia fiscal',
      prioridad: PrioridadTramite.ALTA,
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: externalUserId,
    });

    expect(tramiteCreado.id).toBeDefined();
    expect(tramiteCreado.estado).toBe(EstadoTramite.BORRADOR);
    expect(tramiteCreado.usuarioExternoId).toBe(externalUserId);
    expect(tramiteCreado.areaActualId).toBe(legalesAreaId);
    createdTramiteId = tramiteCreado.id;

    const tramiteIngresado = await ingresarTramiteUseCase.execute({
      tramiteId: createdTramiteId,
      contexto: {
        usuarioTipo: TipoUsuario.EXTERNO,
        usuarioId: externalUserId,
      },
    });

    expect(tramiteIngresado.estado).toBe(EstadoTramite.INGRESADO);
    expect(tramitesStore.get(createdTramiteId)?.estado).toBe(EstadoTramite.INGRESADO);
  });

  it('3. tomar trámite interno: un operador debe tomar el trámite pasando a EN_REVISION con asignación', async () => {
    const tramiteTomado = await tomarTramiteUseCase.execute({
      tramiteId: createdTramiteId,
      contexto: {
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: internalOperatorId,
        rolInterno: RolInterno.OPERADOR,
        areaUsuarioId: legalesAreaId,
      },
    });

    expect(tramiteTomado.estado).toBe(EstadoTramite.EN_REVISION);
    expect(tramiteTomado.usuarioAsignadoId).toBe(internalOperatorId);
    expect(tramitesStore.get(createdTramiteId)?.estado).toBe(EstadoTramite.EN_REVISION);
  });

  it('4. observar trámite: el operador debe observar el trámite con fundamentación requerida', async () => {
    const motivoObservacion = 'Se requiere adjuntar copia legalizada del estatuto societario';

    const tramiteObservado = await observarTramiteUseCase.execute({
      tramiteId: createdTramiteId,
      motivo: motivoObservacion,
      contexto: {
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: internalOperatorId,
        rolInterno: RolInterno.OPERADOR,
        areaUsuarioId: legalesAreaId,
      },
    });

    expect(tramiteObservado.estado).toBe(EstadoTramite.OBSERVADO);
    expect(tramitesStore.get(createdTramiteId)?.estado).toBe(EstadoTramite.OBSERVADO);
  });

  it('5. responder observación como externo: el solicitante externo debe responder regresando a INGRESADO', async () => {
    const respuestaObservacion = 'Se adjunta copia legalizada por escribano público en PDF';

    const tramiteRespondido = await responderObservacionUseCase.execute({
      tramiteId: createdTramiteId,
      respuesta: respuestaObservacion,
      contexto: {
        usuarioTipo: TipoUsuario.EXTERNO,
        usuarioId: externalUserId,
      },
    });

    expect(tramiteRespondido.estado).toBe(EstadoTramite.INGRESADO);
    expect(tramitesStore.get(createdTramiteId)?.estado).toBe(EstadoTramite.INGRESADO);
  });

  it('6. aprobar trámite: el operador toma nuevamente y aprueba el trámite pasando a APROBADO', async () => {
    await tomarTramiteUseCase.execute({
      tramiteId: createdTramiteId,
      contexto: {
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: internalOperatorId,
        rolInterno: RolInterno.OPERADOR,
        areaUsuarioId: legalesAreaId,
      },
    });

    const tramiteAprobado = await aprobarTramiteUseCase.execute({
      tramiteId: createdTramiteId,
      motivo: 'Documentación legal conforme y verificada',
      contexto: {
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: internalOperatorId,
        rolInterno: RolInterno.OPERADOR,
        areaUsuarioId: legalesAreaId,
      },
    });

    expect(tramiteAprobado.estado).toBe(EstadoTramite.APROBADO);
    expect(tramitesStore.get(createdTramiteId)?.estado).toBe(EstadoTramite.APROBADO);
  });

  it('7. consultar historial: debe retornar la trazabilidad completa e inmutable de todos los movimientos', async () => {
    const historial = await movimientoRepo.findByTramiteId(createdTramiteId);

    expect(historial.length).toBeGreaterThanOrEqual(6);

    const accionesRegistradas = historial.map((m) => m.accion);
    expect(accionesRegistradas).toContain(AccionWorkflow.CREAR);
    expect(accionesRegistradas).toContain(AccionWorkflow.INGRESAR);
    expect(accionesRegistradas).toContain(AccionWorkflow.TOMAR);
    expect(accionesRegistradas).toContain(AccionWorkflow.OBSERVAR);
    expect(accionesRegistradas).toContain(AccionWorkflow.RESPONDER_OBSERVACION);
    expect(accionesRegistradas).toContain(AccionWorkflow.APROBAR);

    for (let i = 0; i < historial.length - 1; i++) {
      expect(historial[i].fecha.getTime()).toBeLessThanOrEqual(historial[i + 1].fecha.getTime());
    }
  });

  it('8. validar que externo no vea trámites ajenos: debe bloquear con 403 el acceso de un externo ajeno', async () => {
    const usuarioExternoAjeno: AuthenticatedUser = {
      id: 'ext-usuario-hacker',
      email: 'intruso@competencia.com',
      nombre: 'Usuario Intruso',
      tipo: TipoUsuario.EXTERNO,
    };

    const context = createMockContext(usuarioExternoAjeno, { id: createdTramiteId });

    await expect(tramiteOwnershipGuard.canActivate(context)).rejects.toThrow(ForbiddenException);

    const usuarioDuenio: AuthenticatedUser = {
      id: externalUserId,
      email: 'contacto@constructora.com',
      nombre: 'Constructora del Norte',
      tipo: TipoUsuario.EXTERNO,
    };
    const contextDuenio = createMockContext(usuarioDuenio, { id: createdTramiteId });
    const canAccess = await tramiteOwnershipGuard.canActivate(contextDuenio);
    expect(canAccess).toBe(true);
  });

  it('9. validar 403 en acciones no permitidas: externos y auditores no pueden ejecutar transiciones operativas', async () => {
    await expect(
      aprobarTramiteUseCase.execute({
        tramiteId: createdTramiteId,
        motivo: 'Auto-aprobación no autorizada',
        contexto: {
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: externalUserId,
        },
      }),
    ).rejects.toThrow(UnauthorizedActionException);

    const tramiteMesa = await crearTramiteUseCase.execute({
      tipoTramiteId: 'tipo-prov-1',
      titulo: 'Trámite Mesa',
      descripcion: 'Desc',
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: externalUserId,
    });
    await ingresarTramiteUseCase.execute({
      tramiteId: tramiteMesa.id,
      contexto: { usuarioTipo: TipoUsuario.EXTERNO, usuarioId: externalUserId },
    });

    await expect(
      tomarTramiteUseCase.execute({
        tramiteId: tramiteMesa.id,
        contexto: {
          usuarioTipo: TipoUsuario.INTERNO,
          usuarioId: 'op-compras-id',
          rolInterno: RolInterno.OPERADOR,
          areaUsuarioId: 'area-compras-diferente',
        },
      }),
    ).rejects.toThrow(UnauthorizedActionException);
  });

  it('10. validar concurrencia al tomar trámite: debe evitar doble asignación concurrente mediante bloqueo/atomicidad', async () => {
    const tramiteConcurrencia = await crearTramiteUseCase.execute({
      tipoTramiteId: 'tipo-prov-1',
      titulo: 'Trámite Concurrencia Race Condition',
      descripcion: 'Prueba de adquisición simultánea',
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: externalUserId,
    });
    await ingresarTramiteUseCase.execute({
      tramiteId: tramiteConcurrencia.id,
      contexto: { usuarioTipo: TipoUsuario.EXTERNO, usuarioId: externalUserId },
    });

    const opA = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'operador-A',
      rolInterno: RolInterno.OPERADOR,
      areaUsuarioId: legalesAreaId,
    };

    const opB = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'operador-B',
      rolInterno: RolInterno.OPERADOR,
      areaUsuarioId: legalesAreaId,
    };

    const [resA, resB] = await Promise.allSettled([
      tomarTramiteUseCase.execute({ tramiteId: tramiteConcurrencia.id, contexto: opA }),
      tomarTramiteUseCase.execute({ tramiteId: tramiteConcurrencia.id, contexto: opB }),
    ]);

    const cumplidas = [resA, resB].filter((r) => r.status === 'fulfilled');
    const rechazadas = [resA, resB].filter((r) => r.status === 'rejected');

    expect(cumplidas).toHaveLength(1);
    expect(rechazadas).toHaveLength(1);

    const rechazo = rechazadas[0] as PromiseRejectedResult;
    expect(rechazo.reason).toBeInstanceOf(ConcurrencyConflictException);
    expect(rechazo.reason.message).toContain('ya ha sido tomado');
  });
});
