import { CrearTramiteUseCase } from '../../src/modules/tramites/application/use-cases/crear-tramite.use-case';
import { TomarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/tomar-tramite.use-case';
import { AsignarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/asignar-tramite.use-case';
import { DerivarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/derivar-tramite.use-case';
import { ObservarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/observar-tramite.use-case';
import { ResponderObservacionUseCase } from '../../src/modules/tramites/application/use-cases/responder-observacion.use-case';
import { AprobarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/aprobar-tramite.use-case';
import { RechazarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/rechazar-tramite.use-case';
import { CerrarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/cerrar-tramite.use-case';
import { ListarComentariosUseCase } from '../../src/modules/tramites/application/use-cases/listar-comentarios.use-case';
import { ModificarBorradorUseCase } from '../../src/modules/tramites/application/use-cases/modificar-borrador.use-case';
import { EliminarTramiteBorradorUseCase } from '../../src/modules/tramites/application/use-cases/eliminar-tramite-borrador.use-case';
import { ListarTramitesUseCase } from '../../src/modules/tramites/application/use-cases/listar-tramites.use-case';
import { IComentarioTramiteRepository } from '../../src/modules/tramites/domain/repositories/comentario-tramite.repository.interface';
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
  let comentarioRepoMock: jest.Mocked<IComentarioTramiteRepository>;

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

    comentarioRepoMock = {
      save: jest.fn(),
      findByTramiteId: jest.fn(),
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

    it('debe rechazar la creación si se completa el campo honeypot website (detección de bot)', async () => {
      const useCase = new CrearTramiteUseCase(
        tramiteRepoMock,
        tipoTramiteRepoMock,
        movimientoRepoMock,
      );

      await expect(
        useCase.execute({
          tipoTramiteId: 'tipo-1',
          titulo: 'Trámite generado por bot',
          descripcion: 'Spam automático',
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: 'ext-user-1',
          website: 'http://spam-bot.com',
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
            areaUsuarioId: 'area-compras',
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
    it('debe filtrar y solicitar solo comentarios públicos cuando el usuario es EXTERNO', async () => {
      const publicComment = new ComentarioTramite({
        id: 'c-2',
        tramiteId: 't-1',
        mensaje: 'Comentario público para el solicitante',
        visibilidad: VisibilidadComentario.EXTERNA,
        autorTipo: TipoUsuario.INTERNO,
        autorId: 'op-1',
      });
      comentarioRepoMock.findByTramiteId.mockResolvedValue([publicComment]);

      const useCase = new ListarComentariosUseCase(comentarioRepoMock);

      const result = await useCase.execute({
        tramiteId: 't-1',
        usuarioTipo: TipoUsuario.EXTERNO,
      });

      expect(comentarioRepoMock.findByTramiteId).toHaveBeenCalledWith('t-1', true);
      expect(result).toHaveLength(1);
      expect(result[0].mensaje).toBe('Comentario público para el solicitante');
    });

    it('debe solicitar todos los comentarios (internos y públicos) cuando el usuario es INTERNO', async () => {
      const internalComment = new ComentarioTramite({
        id: 'c-1',
        tramiteId: 't-1',
        mensaje: 'Nota interna confidencial',
        visibilidad: VisibilidadComentario.INTERNA,
        autorTipo: TipoUsuario.INTERNO,
        autorId: 'op-1',
      });
      const publicComment = new ComentarioTramite({
        id: 'c-2',
        tramiteId: 't-1',
        mensaje: 'Mensaje general',
        visibilidad: VisibilidadComentario.TODOS,
        autorTipo: TipoUsuario.INTERNO,
        autorId: 'op-1',
      });
      comentarioRepoMock.findByTramiteId.mockResolvedValue([internalComment, publicComment]);

      const useCase = new ListarComentariosUseCase(comentarioRepoMock);

      const result = await useCase.execute({
        tramiteId: 't-1',
        usuarioTipo: TipoUsuario.INTERNO,
      });

      expect(comentarioRepoMock.findByTramiteId).toHaveBeenCalledWith('t-1', false);
      expect(result).toHaveLength(2);
    });
  });

  describe('ModificarBorradorUseCase', () => {
    it('debe permitir modificar un trámite en estado BORRADOR por su dueño', async () => {
      const tramite = new Tramite({
        id: 't-borrador',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Título Original',
        descripcion: 'Desc Original',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.BORRADOR,
        prioridad: PrioridadTramite.BAJA,
        usuarioExternoId: 'ext-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new ModificarBorradorUseCase(tramiteRepoMock);
      const result = await useCase.execute({
        tramiteId: 't-borrador',
        titulo: 'Título Actualizado',
        descripcion: 'Desc Actualizada',
        prioridad: PrioridadTramite.ALTA,
        usuarioTipo: TipoUsuario.EXTERNO,
        usuarioId: 'ext-1',
      });

      expect(result.titulo).toBe('Título Actualizado');
      expect(result.prioridad).toBe(PrioridadTramite.ALTA);
      expect(tramiteRepoMock.update).toHaveBeenCalled();
    });

    it('debe rechazar modificación si el usuario externo no es el propietario', async () => {
      const tramite = new Tramite({
        id: 't-borrador',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Título',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.BORRADOR,
        prioridad: PrioridadTramite.BAJA,
        usuarioExternoId: 'otro-usuario',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'otro-usuario',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new ModificarBorradorUseCase(tramiteRepoMock);
      await expect(
        useCase.execute({
          tramiteId: 't-borrador',
          titulo: 'Hack',
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: 'ext-1',
        }),
      ).rejects.toThrow(UnauthorizedActionException);
    });

    it('debe rechazar modificación si el trámite no está en estado BORRADOR', async () => {
      const tramite = new Tramite({
        id: 't-ingresado',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Título',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.INGRESADO,
        prioridad: PrioridadTramite.BAJA,
        usuarioExternoId: 'ext-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new ModificarBorradorUseCase(tramiteRepoMock);
      await expect(
        useCase.execute({
          tramiteId: 't-ingresado',
          titulo: 'Nuevo título',
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: 'ext-1',
        }),
      ).rejects.toThrow(BusinessRuleValidationException);
    });
  });

  describe('EliminarTramiteBorradorUseCase', () => {
    it('debe permitir eliminar un trámite en estado BORRADOR', async () => {
      const tramite = new Tramite({
        id: 't-borrador',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Título',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.BORRADOR,
        prioridad: PrioridadTramite.BAJA,
        usuarioExternoId: 'ext-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new EliminarTramiteBorradorUseCase(tramiteRepoMock);
      await useCase.execute({
        tramiteId: 't-borrador',
        usuarioTipo: TipoUsuario.EXTERNO,
        usuarioId: 'ext-1',
      });

      expect(tramiteRepoMock.delete).toHaveBeenCalledWith('t-borrador');
    });

    it('debe rechazar eliminación si el trámite no está en estado BORRADOR', async () => {
      const tramite = new Tramite({
        id: 't-en-revision',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Título',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.BAJA,
        usuarioExternoId: 'ext-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
      });
      tramiteRepoMock.findById.mockResolvedValue(tramite);

      const useCase = new EliminarTramiteBorradorUseCase(tramiteRepoMock);
      await expect(
        useCase.execute({
          tramiteId: 't-en-revision',
          usuarioTipo: TipoUsuario.EXTERNO,
          usuarioId: 'ext-1',
        }),
      ).rejects.toThrow(BusinessRuleValidationException);
    });
  });

  describe('ListarTramitesUseCase', () => {
    it('debe normalizar areaId hacia areaActualId y listar trámites', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'TP-1',
        nombre: 'Tipo Prueba',
        descripcion: 'Desc',
        activo: true,
        slaHoras: 24,
        areaInicialId: 'area-1',
        requiereExterno: false,
        permiteInicioExterno: true,
      });
      tipoTramiteRepoMock.findAll.mockResolvedValue([tipo]);

      const tramite = new Tramite({
        id: 't-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Título',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.BAJA,
        areaActualId: 'area-1',
        creadoPorTipo: TipoUsuario.INTERNO,
        creadoPorId: 'usr-1',
      });
      tramiteRepoMock.findAll.mockResolvedValue({ tramites: [tramite], total: 1 });

      const useCase = new ListarTramitesUseCase(tramiteRepoMock, tipoTramiteRepoMock);
      const res = await useCase.execute({
        filtros: { areaId: 'area-1' },
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'usr-1',
      });

      expect(res.total).toBe(1);
      expect(res.items).toHaveLength(1);
      expect(res.items[0].id).toBe('t-1');
      expect(tramiteRepoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ areaActualId: 'area-1' }),
      );
    });

    it('debe filtrar exclusivamente trámites vencidos cuando soloVencidos es true', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'TP-1',
        nombre: 'Tipo Prueba',
        descripcion: 'Desc',
        activo: true,
        slaHoras: 1,
        areaInicialId: 'area-1',
        requiereExterno: false,
        permiteInicioExterno: true,
      });
      tipoTramiteRepoMock.findAll.mockResolvedValue([tipo]);

      const tramiteVencido = new Tramite({
        id: 't-vencido',
        numero: 'TRM-VENCIDO',
        tipoTramiteId: 'tipo-1',
        titulo: 'Vencido',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.ALTA,
        fechaCreacion: new Date(Date.now() - 5 * 3600 * 1000),
        creadoPorTipo: TipoUsuario.INTERNO,
        creadoPorId: 'usr-1',
      });

      const tramiteEnTermino = new Tramite({
        id: 't-vigente',
        numero: 'TRM-VIGENTE',
        tipoTramiteId: 'tipo-1',
        titulo: 'Vigente',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.EN_REVISION,
        prioridad: PrioridadTramite.MEDIA,
        fechaCreacion: new Date(Date.now() - 5 * 60 * 1000),
        creadoPorTipo: TipoUsuario.INTERNO,
        creadoPorId: 'usr-1',
      });

      tramiteRepoMock.findAll.mockResolvedValue({
        tramites: [tramiteVencido, tramiteEnTermino],
        total: 2,
      });

      const useCase = new ListarTramitesUseCase(tramiteRepoMock, tipoTramiteRepoMock);
      const res = await useCase.execute({
        filtros: { soloVencidos: true },
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'usr-1',
      });

      expect(res.total).toBe(1);
      expect(res.items).toHaveLength(1);
      expect(res.items[0].id).toBe('t-vencido');
      expect(res.items[0].sla.estaVencido).toBe(true);
    });

    it('debe forzar el filtro al área del operador aunque se intente consultar otra área', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'TP-1',
        nombre: 'Tipo Prueba',
        descripcion: 'Desc',
        activo: true,
        slaHoras: 24,
        areaInicialId: 'area-compras',
        requiereExterno: false,
        permiteInicioExterno: true,
      });
      tipoTramiteRepoMock.findAll.mockResolvedValue([tipo]);
      tramiteRepoMock.findAll.mockResolvedValue({ tramites: [], total: 0 });

      const useCase = new ListarTramitesUseCase(tramiteRepoMock, tipoTramiteRepoMock);
      await useCase.execute({
        filtros: { areaId: 'area-legales' },
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'op-compras-id',
        rolInterno: RolInterno.OPERADOR,
        areaUsuarioId: 'area-compras',
      });

      expect(tramiteRepoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ areaActualId: 'area-compras' }),
      );
    });

    it('debe forzar el filtro al área del supervisor', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'TP-1',
        nombre: 'Tipo Prueba',
        descripcion: 'Desc',
        activo: true,
        slaHoras: 24,
        areaInicialId: 'area-compras',
        requiereExterno: false,
        permiteInicioExterno: true,
      });
      tipoTramiteRepoMock.findAll.mockResolvedValue([tipo]);
      tramiteRepoMock.findAll.mockResolvedValue({ tramites: [], total: 0 });

      const useCase = new ListarTramitesUseCase(tramiteRepoMock, tipoTramiteRepoMock);
      await useCase.execute({
        filtros: {},
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'sup-compras-id',
        rolInterno: RolInterno.SUPERVISOR,
        areaUsuarioId: 'area-compras',
      });

      expect(tramiteRepoMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ areaActualId: 'area-compras' }),
      );
    });

    it('debe permitir a un admin ver todas las áreas si no especifica filtro', async () => {
      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'TP-1',
        nombre: 'Tipo Prueba',
        descripcion: 'Desc',
        activo: true,
        slaHoras: 24,
        areaInicialId: 'area-compras',
        requiereExterno: false,
        permiteInicioExterno: true,
      });
      tipoTramiteRepoMock.findAll.mockResolvedValue([tipo]);
      tramiteRepoMock.findAll.mockResolvedValue({ tramites: [], total: 0 });

      const useCase = new ListarTramitesUseCase(tramiteRepoMock, tipoTramiteRepoMock);
      await useCase.execute({
        filtros: {},
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'admin-id',
        rolInterno: RolInterno.ADMIN,
        areaUsuarioId: 'area-mesa',
      });

      expect(tramiteRepoMock.findAll).toHaveBeenCalledWith(
        expect.not.objectContaining({ areaActualId: expect.anything() }),
      );
    });
  });
});
