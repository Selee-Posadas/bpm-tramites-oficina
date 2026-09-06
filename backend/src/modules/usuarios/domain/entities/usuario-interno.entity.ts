import { RolInterno } from '../enums/rol-interno.enum';

export interface UsuarioInternoProps {
  id: string;
  nombre: string;
  email: string;
  areaId: string;
  rol: RolInterno;
  azureObjectId?: string | null;
  activo: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export class UsuarioInterno {
  private props: UsuarioInternoProps;

  constructor(props: UsuarioInternoProps) {
    this.props = {
      ...props,
      activo: props.activo ?? true,
      fechaCreacion: props.fechaCreacion ?? new Date(),
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

  get areaId(): string {
    return this.props.areaId;
  }

  get rol(): RolInterno {
    return this.props.rol;
  }

  get azureObjectId(): string | null | undefined {
    return this.props.azureObjectId;
  }

  get activo(): boolean {
    return this.props.activo;
  }

  get fechaCreacion(): Date | undefined {
    return this.props.fechaCreacion;
  }

  get fechaActualizacion(): Date | undefined {
    return this.props.fechaActualizacion;
  }

  cambiarArea(nuevaAreaId: string): void {
    this.props.areaId = nuevaAreaId;
    this.props.fechaActualizacion = new Date();
  }

  cambiarRol(nuevoRol: RolInterno): void {
    this.props.rol = nuevoRol;
    this.props.fechaActualizacion = new Date();
  }

  desactivar(): void {
    this.props.activo = false;
    this.props.fechaActualizacion = new Date();
  }

  activar(): void {
    this.props.activo = true;
    this.props.fechaActualizacion = new Date();
  }
}
