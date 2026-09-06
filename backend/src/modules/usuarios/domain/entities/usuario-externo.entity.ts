import { EstadoUsuarioExterno } from '../enums/estado-usuario-externo.enum';
import { UsuarioExternoProps } from './usuario-externo.interface';

export class UsuarioExterno {
  private props: UsuarioExternoProps;

  constructor(props: UsuarioExternoProps) {
    this.props = {
      ...props,
      estado: props.estado ?? EstadoUsuarioExterno.ACTIVO,
      fechaAlta: props.fechaAlta ?? new Date(),
      fechaActualizacion: props.fechaActualizacion ?? new Date(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get email(): string {
    return this.props.email;
  }

  get documento(): string {
    return this.props.documento;
  }

  get organizacion(): string {
    return this.props.organizacion;
  }

  get estado(): EstadoUsuarioExterno {
    return this.props.estado;
  }

  get fechaAlta(): Date | undefined {
    return this.props.fechaAlta;
  }

  get fechaActualizacion(): Date | undefined {
    return this.props.fechaActualizacion;
  }

  estaActivo(): boolean {
    return this.props.estado === EstadoUsuarioExterno.ACTIVO;
  }

  bloquear(): void {
    this.props.estado = EstadoUsuarioExterno.BLOQUEADO;
    this.props.fechaActualizacion = new Date();
  }

  activar(): void {
    this.props.estado = EstadoUsuarioExterno.ACTIVO;
    this.props.fechaActualizacion = new Date();
  }
}
