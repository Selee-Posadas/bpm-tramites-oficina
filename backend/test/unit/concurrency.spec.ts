import { TomarTramiteUseCase } from '../../src/modules/tramites/application/use-cases/tomar-tramite.use-case';
import { Tramite } from '../../src/modules/tramites/domain/entities/tramite.entity';
import { EstadoTramite } from '../../src/modules/tramites/domain/enums/estado-tramite.enum';
import { OrigenTramite } from '../../src/modules/tramites/domain/enums/origen-tramite.enum';
import { PrioridadTramite } from '../../src/modules/tramites/domain/enums/prioridad-tramite.enum';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { RolInterno } from '../../src/modules/usuarios/domain/enums/rol-interno.enum';
import { ITramiteRepository } from '../../src/modules/tramites/domain/repositories/tramite.repository.interface';
import { IMovimientoTramiteRepository } from '../../src/modules/tramites/domain/repositories/movimiento-tramite.repository.interface';
import { ConcurrencyConflictException } from '../../src/shared/domain/exceptions/domain.exception';

describe('Control de Concurrencia - TOMAR_TRAMITE', () => {
  let tramiteRepoMock: jest.Mocked<ITramiteRepository>;
  let movimientoRepoMock: jest.Mocked<IMovimientoTramiteRepository>;

  beforeEach(() => {
    tramiteRepoMock = {
      findById: jest.fn(),
      findByNumero: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      updateIfUnassigned: jest.fn(),
      delete: jest.fn(),
      countByEstado: jest.fn(),
      countByOrigen: jest.fn(),
      countByArea: jest.fn(),
    };

    movimientoRepoMock = {
      findById: jest.fn(),
      findByTramiteId: jest.fn(),
      save: jest.fn(),
      findUltimosMovimientos: jest.fn(),
    };
  });

  it('debe evitar race condition cuando dos operadores intentan tomar el mismo trámite en simultáneo', async () => {
    // Estado inicial: Trámite INGRESADO sin operador asignado
    let asignadoActual: string | null = null;

    const tramite = new Tramite({
      id: 'tramite-concurrente-1',
      numero: 'TRM-CONC-001',
      tipoTramiteId: 'tipo-1',
      titulo: 'Trámite Concurrencia Test',
      descripcion: 'Prueba de carga y concurrencia',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.INGRESADO,
      prioridad: PrioridadTramite.ALTA,
      areaActualId: 'area-compras',
      usuarioAsignadoId: null,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: 'ext-user-1',
    });

    tramiteRepoMock.findById.mockImplementation(async () => {
      // Simula lectura simultánea de la base de datos
      return new Tramite({
        id: tramite.id,
        numero: tramite.numero,
        tipoTramiteId: tramite.tipoTramiteId,
        titulo: tramite.titulo,
        descripcion: tramite.descripcion,
        origen: tramite.origen,
        estado: EstadoTramite.INGRESADO,
        prioridad: tramite.prioridad,
        areaActualId: 'area-compras',
        usuarioAsignadoId: asignadoActual,
        creadoPorTipo: TipoUsuario.EXTERNO,
        creadoPorId: 'ext-user-1',
      });
    });

    // Simula la verificación condicional atómica a nivel base de datos
    tramiteRepoMock.updateIfUnassigned = jest.fn().mockImplementation(async (t: Tramite) => {
      if (asignadoActual !== null && asignadoActual !== t.usuarioAsignadoId) {
        throw new ConcurrencyConflictException(
          'El trámite ya ha sido tomado por otro operador o su estado ha cambiado',
        );
      }
      asignadoActual = t.usuarioAsignadoId || null;
      return t;
    });

    const useCase = new TomarTramiteUseCase(tramiteRepoMock, movimientoRepoMock);

    const operadorAContext = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'operador-A',
      rolInterno: RolInterno.OPERADOR,
      areaUsuarioId: 'area-compras',
    };

    const operadorBContext = {
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: 'operador-B',
      rolInterno: RolInterno.OPERADOR,
      areaUsuarioId: 'area-compras',
    };

    // Disparo simultáneo con Promise.allSettled
    const [resultadoA, resultadoB] = await Promise.allSettled([
      useCase.execute({ tramiteId: 'tramite-concurrente-1', contexto: operadorAContext }),
      useCase.execute({ tramiteId: 'tramite-concurrente-1', contexto: operadorBContext }),
    ]);

    // Verificación de invarianza de concurrencia:
    // Exactamente 1 debe ser exitoso (fulfilled) y exactamente 1 debe fallar con 409 (rejected)
    const exitosos = [resultadoA, resultadoB].filter((r) => r.status === 'fulfilled');
    const fallidos = [resultadoA, resultadoB].filter((r) => r.status === 'rejected');

    expect(exitosos).toHaveLength(1);
    expect(fallidos).toHaveLength(1);

    const fallido = fallidos[0] as PromiseRejectedResult;
    expect(fallido.reason).toBeInstanceOf(ConcurrencyConflictException);
    expect(fallido.reason.message).toContain('El trámite ya ha sido tomado');

    // El trámite en base de datos quedó asignado a exactamente uno de los dos operadores
    expect(asignadoActual).not.toBeNull();
    expect(['operador-A', 'operador-B']).toContain(asignadoActual);
  });
});
