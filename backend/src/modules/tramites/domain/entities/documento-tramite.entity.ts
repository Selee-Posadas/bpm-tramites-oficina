import { TipoUsuario } from '../enums/tipo-usuario.enum';
import { DocumentoTramiteProps } from './documento-tramite.interface';

export class DocumentoTramite {
  private props: DocumentoTramiteProps;

  constructor(props: DocumentoTramiteProps) {
    if (props.size <= 0) {
      throw new Error('El tamaño del documento debe ser mayor a cero bytes');
    }
    this.props = {
      ...props,
      fechaCarga: props.fechaCarga ?? new Date(),
    };
  }

  get id(): string {
    return this.props.id;
  }

  get tramiteId(): string {
    return this.props.tramiteId;
  }

  get nombreArchivo(): string {
    return this.props.nombreArchivo;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  get size(): number {
    return this.props.size;
  }

  get storageKey(): string {
    return this.props.storageKey;
  }

  get subidoPorTipo(): TipoUsuario {
    return this.props.subidoPorTipo;
  }

  get subidoPorId(): string {
    return this.props.subidoPorId;
  }

  get fechaCarga(): Date {
    return this.props.fechaCarga || new Date();
  }
}
