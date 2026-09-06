import { CrearTramiteUseCase } from '../../src/modules/tramites/application/use-cases/crear-tramite.use-case';
import { TomarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/tomar-tramite.use-case';
import { AsignarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/asignar-tramite.use-case';
import { DerivarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/derivar-tramite.use-case';
import { ObservarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/observar-tramite.use-case';
import { ResponderObservacionUseCase } from '../../src/modules/tramites/application/use-cases/responder-observacion.use-case';
import { AprobarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/aprobar-tramite.use-case';
import { RechazarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/rechazar-tramite.use-case';
import { CerrarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/cerrar-tramite.use-case';
import { ListarComentariosUseCase } from '../../src/modules/comentarios/application/use-cases/listar-comentarios.use-case';
import { ITramiteRepository } from '../../src/modules/tramites/domain/repositories/tramite.repository.interface';
import { ITipoTramiteRepository } from '../../src/modules/tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { IMovimientoTramiteRepository } from '../../src/modules/tramites/domain/repositories/movimiento-tramite.repository.interface';
import { IAreaRepository } from '../../src/modules/areas/domain/repositories/area.repository.interface';
import { TipoTramite } from '../../src/modules/tipos-tramite/domain/entities/tipo-tramite.entity';
import { Area } from '../../src/modules/areas/domain/entities/area.entity';
import { Tramite } from '../../src/modules/tramites/domain/entities/tramite.entity';
import { ComentarioTramite } from '../../src/modules/tramites/domain/entities/comentario-tramite.entity';
import { OrigenTramite } from '../../src/modules/tramites/domain/enums/origen-tramite.enum';
import { EstadoTramite } from '../../src/modules/tramites/domain/enums/estado-tramite.enum';
import { PrioridadTramite } from '../../src/modules/tramites/domain/enums/prioridad-tramite.enum';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { VisibilidadComentario } from '../../src/modules/tramites/domain/enums/visibilidad-comentario.enum';
import { RolInterno } from '../../src/modules/usuarios/domain/enums/rol-interno.enum';
import {
  UnauthorizedActionException,
  BusinessRuleValidationException,
  ConcurrencyConflictException,
} from '../../src/shared/domain/exceptions/domain.exception';

describe('Casos de Uso de Aplicación (Domain Application Core)', () => {
  let tramiteRepoMock: jest.Mocked<ITramiteRepository>;
  let tipoTramiteRepoMock: jest.Mocked<ITipoTramiteRepository>;
  let movimientoRepoMock: jest.Mocked<IMovimientoTramiteRepository>;
  let areaRepoMock: jest.Mocked<IAreaRepository>;

  beforeEach(() => {
    tramiteRepoMock = {
      findById: jest.fn(),
      findByNumero: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn().mockImplementation((t) => Promise.resolve(t)),
      update: jest.fn().mockImplementation((t) => Promise.resolve(t)),
      delete: jest.fn(),
      countByEstado: jest.fn(),
      countByOrigen: jest.fn(),
      countByArea: jest.fn(),
    };

    tipoTramiteRepoMock = {
      findById: jest.fn(),
      findByCodigo: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    movimientoRepoMock = {
      findById: jest.fn(),
      findByTramiteId: jest.fn(),
      save: jest.fn().mockImplementation((m) => Promise.resolve(m)),
      findUltimosMovimientos: jest.fn(),
    };

    areaRepoMock = {
      findById: jest.fn(),
      findByCodigo: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
  });

  describe('CrearTramiteUseCase', () => {
    it('debe crear exitosamente un trámite externo en BORRADOR y generar movimiento CREAR', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'PROV',
        nombre: 'Alta Proveedor',
        descripcion: 'Desc',
        activo: true,
        requiereExterno: false,
        permiteInicioExterno: true,
        slaHoras: 48,
        areaInicialId: 'area-compras',
      });
      tipoTramiteRepoMock.findById.mockResolvedValue(tipo);

      const useCase = new CrearTramiteUseCase(
        tramiteRepoMock,
        tipoTramiteRepoMock,
        movimientoRepoMock,
      );

      const result = await useCase.execute({
        tipoTramiteId: 'tipo-1',
        titulo: 'Solicitud de Alta de Proveedor',
        descripcion: 'Inscripción proveedor de insumos',
        usuarioTipo: TipoUsuario.EXTERNO,
        usuarioId: 'ext-user-1',
      });

      expect(result).toBeDefined();
      expect(result.estado).toBe(EstadoTramite.BORRADOR);
      expect(result.origen).toBe(OrigenTramite.EXTERNO_INTERNO);
      expect(result.areaActualId).toBe('area-compras');
      expect(result.usuarioExternoId).toBe('ext-user-1');
      expect(tramiteRepoMock.save).toHaveBeenCalled();
      expect(movimientoRepoMock.save).toHaveBeenCalled();
    });

    it('debe rechazar la creación externa si el tipo de trámite no permite inicio externo', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-2',
        codigo: 'INT-ONLY',
        nombre: 'Memorando Interno',
        descripcion: 'Desc',
        activo: true,
        requiereExterno: false,
        permiteInicioExterno: false,
        slaHoras: 24,
        areaInicialId: 'area-1',
      });
      tipoTramiteRepoMock.findById.mockResolvedValue(tipo);

      const useCase = new CrearTramiteUseCase(
        tramiteRepoMock,
        tipoTramiteRepoMock,
        movimientoRepoMock,
      );

      await expect(
        useCase.execute({
          tipoTramiteId: 'tipo-2',
          titulo: 'Intento inválido',
          descripcion: 'Desc',
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: 'ext-user-1',
        }),
      ).rejects.toThrow(BusinessRuleValidationException);
    });
  });

  describe('TomarTramiteUseCase', () => {
    it('debe permitir tomar el trámite a un operador de la misma área y pasar a EN_REVISION', async () => {
      const tramite = new Tramite({
        id: 'tramite-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.INGRESADO,
        prioridad: PrioridadTramite.MEDIA,
        areaActualId: 'area-legales',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new TomarTramiteUseCase(tramiteRepoMock, movimientoRepoMock);

      const result = await useCase.execute({
        tramiteId: 'tramite-1',
        contexto: {
          usuarioTipo: TipoUsuario.INTERNO,
          usuarioId: 'op-1',
          rolInterno: RolInterno.OPERADOR,
          areaUsuarioId: 'area-legales',
        },
      });

      expect(result.estado).toBe(EstadoTramite.EN_REVISION);
      expect(result.usuarioAsignadoId).toBe('op-1');
      expect(movimientoRepoMock.save).toHaveBeenCalled();
    });

    it('debe rechazar si ya está tomado por otro operador (control de concurrencia)', async () => {
      const tramite = new Tramite({
        id: 'tramite-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.MEDIA,
        areaActualId: 'area-legales',
        usuarioAsignadoId: 'op-primero',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new TomarTramiteUseCase(tramiteRepoMock, movimientoRepoMock);

      await expect(
        useCase.execute({
          tramiteId: 'tramite-1',
          contexto: {
            usuarioTipo: TipoUsuario.INTERNO,
            usuarioId: 'op-segundo',
            rolInterno: RolInterno.OPERADOR,
            areaUsuarioId: 'area-legales',
          },
        }),
      ).rejects.toThrow(ConcurrencyConflictException);
    });

    it('debe rechazar si un operador intenta tomar un trámite de otra área', async () => {
      const tramite = new Tramite({
        id: 'tramite-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.INGRESADO,
        prioridad: PrioridadTramite.MEDIA,
        areaActualId: 'area-legales',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new TomarTramiteUseCase(tramiteRepoMock, movimientoRepoMock);

      await expect(
        useCase.execute({
          tramiteId: 'tramite-1',
          contexto: {
            usuarioTipo: TipoUsuario.INTERNO,
            usuarioId: 'op-compras',
            rolInterno: RolInterno.OPERADOR,
            areaUsuarioId: 'area-compras', // Área distinta
          },
        }),
      ).rejects.toThrow(UnauthorizedActionException);
    });
  });

  describe('AsignarTramiteUseCase', () => {
    it('debe permitir reasignar a un SUPERVISOR de la misma área', async () => {
      const tramite = new Tramite({
        id: 'tramite-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.INTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.MEDIA,
        areaActualId: 'area-legales',
        usuarioAsignadoId: 'op-antiguo',
        creadoPorTipo: TipoUsuario.INTERNO,
        creadoPorId: 'user-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new AsignarTramiteUseCase(tramiteRepoMock, movimientoRepoMock);

      const result = await useCase.execute({
        tramiteId: 'tramite-1',
        nuevoOperadorId: 'op-nuevo',
        contexto: {
          usuarioTipo: TipoUsuario.INTERNO,
          usuarioId: 'supervisor-1',
          rolInterno: RolInterno.SUPERVISOR,
          areaUsuarioId: 'area-legales',
        },
      });

      expect(result.usuarioAsignadoId).toBe('op-nuevo');
    });

    it('debe denegar la reasignación si la ejecuta un OPERADOR sin permisos de supervisor/admin', async () => {
      const tramite = new Tramite({
        id: 'tramite-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.INTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.MEDIA,
        areaActualId: 'area-legales',
        usuarioAsignadoId: 'op-1',
        creadoPorTipo: TipoUsuario.INTERNO,
        creadoPorId: 'user-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new AsignarTramiteUseCase(tramiteRepoMock, movimientoRepoMock);

      await expect(
        useCase.execute({
          tramiteId: 'tramite-1',
          nuevoOperadorId: 'op-2',
          contexto: {
            usuarioTipo: TipoUsuario.INTERNO,
            usuarioId: 'op-1',
            rolInterno: RolInterno.OPERADOR,
            areaUsuarioId: 'area-legales',
          },
        }),
      ).rejects.toThrow(UnauthorizedActionException);
    });
  });

  describe('ListarComentariosUseCase (Filtro de Seguridad)', () => {
    it('debe filtrar y ocultar los comentarios internos a los usuarios externos', async () => {
      const tramite = new Tramite({
        id: 't-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.MEDIA,
        usuarioExternoId: 'ext-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
        comentarios: [
          new ComentarioTramite({
            id: 'c-1',
            tramiteId: 't-1',
            mensaje: 'Comentario interno confidencial entre auditores',
            visibilidad: VisibilidadComentario.INTERNA,
            autorTipo: TipoUsuario.INTERNO,
            autorId: 'op-1',
          }),
          new ComentarioTramite({
            id: 'c-2',
            tramiteId: 't-1',
            mensaje: 'Comentario público para el solicitante',
            visibilidad: VisibilidadComentario.EXTERNA,
            autorTipo: TipoUsuario.INTERNO,
            autorId: 'op-1',
          }),
        ],
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new ListarComentariosUseCase(tramiteRepoMock);

      const result = await useCase.execute({
        tramiteId: 't-1',
        usuarioTipo: TipoUsuario.EXTERNO,
        usuarioId: 'ext-1',
      });

      expect(result).toHaveLength(1);
      expect(result[0].mensaje).toBe('Comentario público para el solicitante');
    });

    it('debe mostrar todos los comentarios (internos y externos) al personal interno', async () => {
      const tramite = new Tramite({
        id: 't-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.MEDIA,
        usuarioExternoId: 'ext-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
        comentarios: [
          new ComentarioTramite({
            id: 'c-1',
            tramiteId: 't-1',
            mensaje: 'Nota interna',
            visibilidad: VisibilidadComentario.INTERNA,
            autorTipo: TipoUsuario.INTERNO,
            autorId: 'op-1',
          }),
          new ComentarioTramite({
            id: 'c-2',
            tramiteId: 't-1',
            mensaje: 'Mensaje público',
            visibilidad: VisibilidadComentario.TODOS,
            autorTipo: TipoUsuario.INTERNO,
            autorId: 'op-1',
          }),
        ],
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new ListarComentariosUseCase(tramiteRepoMock);

      const result = await useCase.execute({
        tramiteId: 't-1',
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'op-2',
      });

      expect(result).toHaveLength(2);
    });
  });
});
