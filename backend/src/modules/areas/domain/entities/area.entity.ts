import { AreaProps } from './area.interface';

export class Area {
  private props: AreaProps;

  constructor(props: AreaProps) {
    this.props = {
      ...props,
      activa: props.activa ?? true,
      fechaCreacion: props.fechaCreacion ?? new Date(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get activa(): boolean {
    return this.props.activa;
  }

  get fechaCreacion(): Date | undefined {
    return this.props.fechaCreacion;
  }

  desactivar(): void {
    this.props.activa = false;
  }

  activar(): void {
    this.props.activa = true;
  }

  actualizar(nombre: string, codigo: string): void {
    this.props.nombre = nombre;
    this.props.codigo = codigo;
  }
}
