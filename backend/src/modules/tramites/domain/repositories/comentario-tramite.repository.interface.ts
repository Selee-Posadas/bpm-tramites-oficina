import { ComentarioTramite } from '../entities/comentario-tramite.entity';

export interface IComentarioTramiteRepository {
  save(comentario: ComentarioTramite): Promise<ComentarioTramite>;
  findByTramiteId(tramiteId: string, soloVisiblesParaExterno?: boolean): Promise<ComentarioTramite[]>;
}

export const COMENTARIO_TRAMITE_REPOSITORY_TOKEN = Symbol('IComentarioTramiteRepository');
