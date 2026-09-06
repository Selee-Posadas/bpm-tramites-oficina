import { EstadoTramite } from '../enums/estado-tramite.enum';
import { OrigenTramite } from '../enums/origen-tramite.enum';
import { PrioridadTramite } from '../enums/prioridad-tramite.enum';
import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { AccionWorkflow } from '../enums/accion-workflow.enum';
import { MovimientoTramite } from './movimiento-tramite.entity';
import { DocumentoTramite } from './documento-tramite.entity';
import { ComentarioTramite } from './comentario-tramite.entity';
import { WorkflowFactory } from '../workflow/workflow.factory';
import { WorkflowContext } from '../workflow/workflow.interface';
import { BusinessRuleValidationException } from '../../../../shared/domain/exceptions/domain.exception';
import { TramiteProps } from './tramite.interface';

export class Tramite {
  private props: TramiteProps;

  constructor(props: TramiteProps) {
    if (!props.titulo || props.titulo.trim().length === 0) {
      throw new BusinessRuleValidationException('El título del trámite es obligatorio');
    }
    if (!props.descripcion || props.descripcion.trim().length === 0) {
      throw new BusinessRuleValidationException('La descripción del trámite es obligatoria');
    }

    this.props = {
      ...props,
      estado: props.estado ?? EstadoTramite.BORRADOR,
      prioridad: props.prioridad ?? PrioridadTramite.MEDIA,
      fechaCreacion: props.fechaCreacion ?? new Date(),
      fechaActualizacion: props.fechaActualizacion ?? new Date(),
      fechaCierre: props.fechaCierre ?? null,
      movimientos: props.movimientos ? [...props.movimientos] : [],
      documentos: props.documentos ? [...props.documentos] : [],
      comentarios: props.comentarios ? [...props.comentarios] : [],
    };
  }

  get id(): string {
    return this.props.id;
  }

  get numero(): string {
    return this.props.numero;
  }

  get tipoTramiteId(): string {
    return this.props.tipoTramiteId;
  }

  get titulo(): string {
    return this.props.titulo;
  }

  get descripcion(): string {
    return this.props.descripcion;
  }

  get origen(): OrigenTramite {
    return this.props.origen;
  }

  get estado(): EstadoTramite {
    return this.props.estado;
  }

  get prioridad(): PrioridadTramite {
    return this.props.prioridad;
  }

  get areaActualId(): string | null | undefined {
    return this.props.areaActualId;
  }

  get usuarioAsignadoId(): string | null | undefined {
    return this.props.usuarioAsignadoId;
  }

  get usuarioExternoId(): string | null | undefined {
    return this.props.usuarioExternoId;
  }

  get creadoPorTipo(): TipoUsuario {
    return this.props.creadoPorTipo;
  }

  get creadoPorId(): string {
    return this.props.creadoPorId;
  }

  get fechaCreacion(): Date {
    return this.props.fechaCreacion || new Date();
  }

  get fechaActualizacion(): Date {
    return this.props.fechaActualizacion || new Date();
  }

  get fechaCierre(): Date | null | undefined {
    return this.props.fechaCierre;
  }

  get movimientos(): ReadonlyArray<MovimientoTramite> {
    return this.props.movimientos || [];
  }

  get documentos(): ReadonlyArray<DocumentoTramite> {
    return this.props.documentos || [];
  }

  get comentarios(): ReadonlyArray<ComentarioTramite> {
    return this.props.comentarios || [];
  }

  modificarBorrador(titulo: string, descripcion: string, prioridad: PrioridadTramite): void {
    if (this.props.estado !== EstadoTramite.BORRADOR) {
      throw new BusinessRuleValidationException('Solo se pueden modificar los datos básicos en estado BORRADOR');
    }
    this.props.titulo = titulo;
    this.props.descripcion = descripcion;
    this.props.prioridad = prioridad;
    this.props.fechaActualizacion = new Date();
  }

  ejecutarTransicion(
    accion: AccionWorkflow,
    contexto: WorkflowContext,
    movimientoId: string,
  ): MovimientoTramite {
    const workflow = WorkflowFactory.getWorkflow(this.props.origen);
    const estadoAnterior = this.props.estado;
    const areaAnteriorId = this.props.areaActualId;

    const estadoNuevo = workflow.determinarProximoEstado(estadoAnterior, accion, contexto);

    if (accion === AccionWorkflow.TOMAR) {
      this.props.usuarioAsignadoId = contexto.usuarioId;
    } else if (accion === AccionWorkflow.ASIGNAR) {
      this.props.usuarioAsignadoId = contexto.usuarioId;
    } else if (accion === AccionWorkflow.DERIVAR) {
      if (contexto.areaDestinoId) {
        this.props.areaActualId = contexto.areaDestinoId;
        this.props.usuarioAsignadoId = null;
      }
    }

    this.props.estado = estadoNuevo;
    this.props.fechaActualizacion = new Date();

    if (estadoNuevo === EstadoTramite.CERRADO) {
      this.props.fechaCierre = new Date();
    }

    const nuevoMovimiento = new MovimientoTramite({
      id: movimientoId,
      tramiteId: this.id,
      estadoAnterior,
      estadoNuevo,
      areaAnteriorId,
      areaNuevaId: this.props.areaActualId,
      usuarioTipo: contexto.usuarioTipo,
      usuarioId: contexto.usuarioId,
      accion,
      comentario: contexto.motivo || null,
      metadata: {
        rolInterno: contexto.rolInterno,
        areaDestinoId: contexto.areaDestinoId,
      },
      fecha: new Date(),
    });

    if (!this.props.movimientos) {
      this.props.movimientos = [];
    }
    this.props.movimientos.push(nuevoMovimiento);

    return nuevoMovimiento;
  }

  asignarOperador(supervisorId: string, nuevoOperadorId: string): void {
    if (this.props.estado !== EstadoTramite.INGRESADO && this.props.estado !== EstadoTramite.EN_REVISION && this.props.estado !== EstadoTramite.DERIVADO) {
      throw new BusinessRuleValidationException('El trámite no se encuentra en un estado asignable');
    }
    this.props.usuarioAsignadoId = nuevoOperadorId;
    this.props.fechaActualizacion = new Date();
  }

  agregarDocumento(documento: DocumentoTramite): void {
    if (!this.props.documentos) {
      this.props.documentos = [];
    }
    this.props.documentos.push(documento);
    this.props.fechaActualizacion = new Date();
  }

  agregarComentario(comentario: ComentarioTramite): void {
    if (!this.props.comentarios) {
      this.props.comentarios = [];
    }
    this.props.comentarios.push(comentario);
    this.props.fechaActualizacion = new Date();
  }

  estaVencido(slaHoras: number, fechaReferencia: Date = new Date()): boolean {
    if (
      this.props.estado === EstadoTramite.APROBADO ||
      this.props.estado === EstadoTramite.RECHAZADO ||
      this.props.estado === EstadoTramite.CANCELADO ||
      this.props.estado === EstadoTramite.CERRADO
    ) {
      return false;
    }
    const tiempoLimite = this.fechaCreacion.getTime() + slaHoras * 3600 * 1000;
    return fechaReferencia.getTime() > tiempoLimite;
  }

  calcularTiempoRestanteMinutos(slaHoras: number, fechaReferencia: Date = new Date()): number {
    const tiempoLimite = this.fechaCreacion.getTime() + slaHoras * 3600 * 1000;
    const diffMs = tiempoLimite - fechaReferencia.getTime();
    return Math.floor(diffMs / 60000);
  }
}
