export interface TipoTramiteProps {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereExterno: boolean;
  permiteInicioExterno: boolean;
  slaHoras: number;
  areaInicialId: string;
  fechaCreacion?: Date;
}

export class TipoTramite {
  private props: TipoTramiteProps;

  constructor(props: TipoTramiteProps) {
    if (props.slaHoras <= 0) {
      throw new Error('El SLA en horas debe ser un valor positivo mayor a cero');
    }
    this.props = {
      ...props,
      activo: props.activo ?? true,
      requiereExterno: props.requiereExterno ?? false,
      permiteInicioExterno: props.permiteInicioExterno ?? false,
      fechaCreacion: props.fechaCreacion ?? new Date(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get descripcion(): string {
    return this.props.descripcion;
  }

  get activo(): boolean {
    return this.props.activo;
  }

  get requiereExterno(): boolean {
    return this.props.requiereExterno;
  }

  get permiteInicioExterno(): boolean {
    return this.props.permiteInicioExterno;
  }

  get slaHoras(): number {
    return this.props.slaHoras;
  }

  get areaInicialId(): string {
    return this.props.areaInicialId;
  }

  get fechaCreacion(): Date | undefined {
    return this.props.fechaCreacion;
  }

  desactivar(): void {
    this.props.activo = false;
  }

  activar(): void {
    this.props.activo = true;
  }

  actualizarSla(nuevasHoras: number): void {
    if (nuevasHoras <= 0) {
      throw new Error('El SLA en horas debe ser un valor positivo mayor a cero');
    }
    this.props.slaHoras = nuevasHoras;
  }
}
