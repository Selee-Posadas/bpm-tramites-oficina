import { TipoUsuario } from '../enums/tipo-usuario.enum';

export interface DocumentoTramiteProps {
  id: string;
  tramiteId: string;
  nombreArchivo: string;
  mimeType: string;
  size: number;
  storageKey: string;
  subidoPorTipo: TipoUsuario;
  subidoPorId: string;
  fechaCarga?: Date;
}

export type IDocumentoTramite = DocumentoTramiteProps;
