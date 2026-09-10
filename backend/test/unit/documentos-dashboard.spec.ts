import { ObtenerDocumentoUseCase } from '../../src/modules/tramites/application/use-cases/obtener-documento.use-case';
import { ObtenerEstadisticasDashboardUseCase } from '../../src/modules/tramites/application/use-cases/obtener-estadisticas-dashboard.use-case';
import { IDocumentoTramiteRepository } from '../../src/modules/tramites/domain/repositories/documento-tramite.repository.interface';
import { ITramiteRepository } from '../../src/modules/tramites/domain/repositories/tramite.repository.interface';
import { ITipoTramiteRepository } from '../../src/modules/tipos-tramite/domain/repositories/tipo-tramite.repository.interface';
import { IMovimientoTramiteRepository } from '../../src/modules/tramites/domain/repositories/movimiento-tramite.repository.interface';
import { DocumentoTramite } from '../../src/modules/tramites/domain/entities/documento-tramite.entity';
import { Tramite } from '../../src/modules/tramites/domain/entities/tramite.entity';
import { MovimientoTramite } from '../../src/modules/tramites/domain/entities/movimiento-tramite.entity';
import { TipoTramite } from '../../src/modules/tipos-tramite/domain/entities/tipo-tramite.entity';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { OrigenTramite } from '../../src/modules/tramites/domain/enums/origen-tramite.enum';
import { EstadoTramite } from '../../src/modules/tramites/domain/enums/estado-tramite.enum';
import { PrioridadTramite } from '../../src/modules/tramites/domain/enums/prioridad-tramite.enum';
import { AccionWorkflow } from '../../src/modules/tramites/domain/enums/accion-workflow.enum';
import { EntityNotFoundException } from '../../src/shared/domain/exceptions/domain.exception';

describe('Documentos y Dashboard Use Cases', () => {
  describe('ObtenerDocumentoUseCase', () => {
    let documentoRepoMock: jest.Mocked<IDocumentoTramiteRepository>;

    beforeEach(() => {
      documentoRepoMock = {
        save: jest.fn(),
        findById: jest.fn(),
        findByTramiteId: jest.fn(),
        delete: jest.fn(),
      };
    });

    it('debe devolver el documento si existe y pertenece al trámite', async () => {
      const doc = new DocumentoTramite({
        id: 'doc-1',
        tramiteId: 'tramite-1',
        nombreArchivo: 'dni.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        storageKey: 'docs/dni.pdf',
        subidoPorTipo: TipoUsuario.EXTERNO,
        subidoPorId: 'user-ext-1',
        fechaCarga: new Date(),
      });
      documentoRepoMock.findById.mockResolvedValue(doc);

      const useCase = new ObtenerDocumentoUseCase(documentoRepoMock);
      const result = await useCase.execute({
        documentoId: 'doc-1',
        tramiteId: 'tramite-1',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('doc-1');
      expect(result.nombreArchivo).toBe('dni.pdf');
    });

    it('debe arrojar EntityNotFoundException si el documento no existe', async () => {
      documentoRepoMock.findById.mockResolvedValue(null);

      const useCase = new ObtenerDocumentoUseCase(documentoRepoMock);
      await expect(
        useCase.execute({
          documentoId: 'doc-inexistente',
          tramiteId: 'tramite-1',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('debe arrojar EntityNotFoundException si el documento pertenece a otro trámite', async () => {
      const doc = new DocumentoTramite({
        id: 'doc-1',
        tramiteId: 'otro-tramite',
        nombreArchivo: 'dni.pdf',
        mimeType: 'application/pdf',
        size: 1024,
        storageKey: 'docs/dni.pdf',
        subidoPorTipo: TipoUsuario.EXTERNO,
        subidoPorId: 'user-ext-1',
        fechaCarga: new Date(),
      });
      documentoRepoMock.findById.mockResolvedValue(doc);

      const useCase = new ObtenerDocumentoUseCase(documentoRepoMock);
      await expect(
        useCase.execute({
          documentoId: 'doc-1',
          tramiteId: 'tramite-1',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('ObtenerEstadisticasDashboardUseCase', () => {
    let tramiteRepoMock: jest.Mocked<ITramiteRepository>;
    let tipoTramiteRepoMock: jest.Mocked<ITipoTramiteRepository>;
    let movimientoRepoMock: jest.Mocked<IMovimientoTramiteRepository>;

    beforeEach(() => {
      tramiteRepoMock = {
        findById: jest.fn(),
        findByNumero: jest.fn(),
        findAll: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
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
        save: jest.fn(),
        findUltimosMovimientos: jest.fn(),
      };
    });

    it('debe devolver métricas completas de dashboard: estado, origen, área, SLA, promedio de resolución y últimos movimientos', async () => {
      tramiteRepoMock.countByEstado.mockResolvedValue({
        [EstadoTramite.BORRADOR]: 0,
        [EstadoTramite.INGRESADO]: 2,
        [EstadoTramite.EN_REVISION]: 0,
        [EstadoTramite.OBSERVADO]: 0,
        [EstadoTramite.DERIVADO]: 0,
        [EstadoTramite.ESPERANDO_EXTERNO]: 0,
        [EstadoTramite.ESPERANDO_INTERNO]: 0,
        [EstadoTramite.APROBADO]: 1,
        [EstadoTramite.RECHAZADO]: 0,
        [EstadoTramite.CANCELADO]: 0,
        [EstadoTramite.CERRADO]: 0,
      });
      tramiteRepoMock.countByOrigen.mockResolvedValue({
        [OrigenTramite.EXTERNO_INTERNO]: 3,
        [OrigenTramite.INTERNO_INTERNO]: 0,
        [OrigenTramite.INTERNO_EXTERNO]: 0,
      });
      tramiteRepoMock.countByArea.mockResolvedValue([{ areaId: 'area-1', cantidad: 3 }]);

      const tipo = new TipoTramite({
        id: 'tipo-1',
        codigo: 'TP-1',
        nombre: 'Tipo Prueba',
        descripcion: 'Desc',
        activo: true,
        slaHoras: 48,
        areaInicialId: 'area-1',
        requiereExterno: false,
        permiteInicioExterno: true,
      });
      tipoTramiteRepoMock.findAll.mockResolvedValue([tipo]);

      const ahora = new Date();
      const hace2Horas = new Date(ahora.getTime() - 2 * 60 * 60 * 1000);

      const tramiteAprobado = new Tramite({
        id: 't-1',
        numero: 'TRM-001',
        tipoTramiteId: 'tipo-1',
        titulo: 'Trámite Aprobado',
        descripcion: 'Desc',
        origen: OrigenTramite.EXTERNO_INTERNO,
        estado: EstadoTramite.APROBADO,
        prioridad: PrioridadTramite.ALTA,
        areaActualId: 'area-1',
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-1',
        fechaCreacion: hace2Horas,
        fechaActualizacion: ahora,
        fechaCierre: ahora,
      });

      tramiteRepoMock.findAll.mockResolvedValue({
        tramites: [tramiteAprobado],
        total: 1,
      });

      const movimiento = new MovimientoTramite({
        id: 'mov-1',
        tramiteId: 't-1',
        estadoAnterior: EstadoTramite.EN_REVISION,
        estadoNuevo: EstadoTramite.APROBADO,
        usuarioTipo: TipoUsuario.INTERNO,
        usuarioId: 'op-1',
        accion: AccionWorkflow.APROBAR,
        fecha: ahora,
      });
      movimientoRepoMock.findUltimosMovimientos.mockResolvedValue([movimiento]);

      const useCase = new ObtenerEstadisticasDashboardUseCase(
        tramiteRepoMock,
        tipoTramiteRepoMock,
        movimientoRepoMock,
      );

      const stats = await useCase.execute();

      expect(stats.total).toBe(1);
      expect(stats.porEstado[EstadoTramite.INGRESADO]).toBe(2);
      expect(stats.porOrigen[OrigenTramite.EXTERNO_INTERNO]).toBe(3);
      expect(stats.porArea).toHaveLength(1);
      expect(stats.sla).toBeDefined();
      expect(typeof stats.vencidosSla).toBe('number');
      expect(typeof stats.promedioResolucionHoras).toBe('number');
      expect(stats.ultimosMovimientos).toHaveLength(1);
      expect(stats.ultimosMovimientos[0].accion).toBe(AccionWorkflow.APROBAR);
    });
  });
});
