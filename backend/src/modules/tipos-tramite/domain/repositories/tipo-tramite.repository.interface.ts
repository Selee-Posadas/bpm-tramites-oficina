import { TipoTramite } from '../entities/tipo-tramite.entity';

export interface ITipoTramiteRepository {
  findById(id: string): Promise<TipoTramite | null>;
  findByCodigo(codigo: string): Promise<TipoTramite | null>;
  findAll(soloActivos?: boolean): Promise<TipoTramite[]>;
  save(tipoTramite: TipoTramite): Promise<TipoTramite>;
  update(tipoTramite: TipoTramite): Promise<TipoTramite>;
}

export const TIPO_TRAMITE_REPOSITORY_TOKEN = Symbol('ITipoTramiteRepository');
