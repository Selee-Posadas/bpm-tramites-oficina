import { ComentarioTramite } from '../../src/modules/tramites/domain/entities/comentario-tramite.entity';
import { VisibilidadComentario } from '../../src/modules/tramites/domain/enums/visibilidad-comentario.enum';
import { TipoUsuario } from '../../src/modules/tramites/domain/enums/tipo-usuario.enum';
import { ComentariosController } from '../../src/modules/tramites/infrastructure/controllers/comentarios.controller';
import { AgregarComentarioUseCase } from '../../src/modules/tramites/application/use-cases/agregar-comentario.use-case';
import { ListarComentariosUseCase } from '../../src/modules/tramites/application/use-cases/listar-comentarios.use-case';
import { IComentarioTramiteRepository } from '../../src/modules/tramites/domain/repositories/comentario-tramite.repository.interface';
import { ITramiteRepository } from '../../src/modules/tramites/domain/repositories/tramite.repository.interface';
import { AuthenticatedUser } from '../../src/modules/auth/domain/auth-user.interface';

describe('Comentarios - Confidencialidad y Visibilidad', () => {
  let comentarioRepoMock: jest.Mocked<IComentarioTramiteRepository>;
  let tramiteRepoMock: jest.Mocked<ITramiteRepository>;
  let listarComentariosUseCase: ListarComentariosUseCase;
  let agregarComentarioUseCase: AgregarComentarioUseCase;
  let controller: ComentariosController;

  const comentarioInterno = new ComentarioTramite({
    id: 'c-1',
    tramiteId: 't-1',
    mensaje: 'Observación confidencial de legales: verificar solvencia patrimonial',
    visibilidad: VisibilidadComentario.INTERNA,
    autorTipo: TipoUsuario.INTERNO,
    autorId: 'user-legales-1',
  });

  const comentarioExterno = new ComentarioTramite({
    id: 'c-2',
    tramiteId: 't-1',
    mensaje: 'Estimado proveedor, solicitamos acompañar balance 2024 certificado',
    visibilidad: VisibilidadComentario.EXTERNA,
    autorTipo: TipoUsuario.INTERNO,
    autorId: 'user-operador-1',
  });

  const comentarioTodos = new ComentarioTramite({
    id: 'c-3',
    tramiteId: 't-1',
    mensaje: 'Aviso general: la mesa atenderá normalmente en receso',
    visibilidad: VisibilidadComentario.TODOS,
    autorTipo: TipoUsuario.INTERNO,
    autorId: 'user-mesa-1',
  });

  beforeEach(() => {
    comentarioRepoMock = {
      save: jest.fn(),
      findByTramiteId: jest.fn(),
    };
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

    listarComentariosUseCase = new ListarComentariosUseCase(comentarioRepoMock);
    agregarComentarioUseCase = new AgregarComentarioUseCase(
      comentarioRepoMock,
      tramiteRepoMock,
    );
    controller = new ComentariosController(
      agregarComentarioUseCase,
      listarComentariosUseCase,
    );
  });

  it('entidad ComentarioTramite debe responder correctamente a esVisibleParaExterno()', () => {
    expect(comentarioInterno.esVisibleParaExterno()).toBe(false);
    expect(comentarioExterno.esVisibleParaExterno()).toBe(true);
    expect(comentarioTodos.esVisibleParaExterno()).toBe(true);
  });

  it('el controlador debe solicitar solo comentarios públicos cuando el solicitante es EXTERNO', async () => {
    comentarioRepoMock.findByTramiteId.mockResolvedValue([comentarioExterno, comentarioTodos]);

    const externalUser: AuthenticatedUser = {
      id: 'ext-user-1',
      email: 'proveedor@test.com',
      nombre: 'Proveedor',
      tipo: TipoUsuario.EXTERNO,
    };

    const result = await controller.findByTramiteId('t-1', externalUser);

    expect(comentarioRepoMock.findByTramiteId).toHaveBeenCalledWith('t-1', true);
    expect(result).toHaveLength(2);
    expect(result.some((c) => c.visibilidad === VisibilidadComentario.INTERNA)).toBe(false);
  });

  it('el controlador debe devolver todos los comentarios (incluyendo internos) cuando el usuario es INTERNO', async () => {
    comentarioRepoMock.findByTramiteId.mockResolvedValue([
      comentarioInterno,
      comentarioExterno,
      comentarioTodos,
    ]);

    const internalUser: AuthenticatedUser = {
      id: 'int-user-1',
      email: 'operador@bpm.local',
      nombre: 'Operador',
      tipo: TipoUsuario.INTERNO,
    };

    const result = await controller.findByTramiteId('t-1', internalUser);

    expect(comentarioRepoMock.findByTramiteId).toHaveBeenCalledWith('t-1', false);
    expect(result).toHaveLength(3);
    expect(result.some((c) => c.visibilidad === VisibilidadComentario.INTERNA)).toBe(true);
  });
});
