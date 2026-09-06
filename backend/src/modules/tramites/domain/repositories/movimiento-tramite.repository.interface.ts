import { MovimientoTramite } from '../entities/movimiento-tramite.entity';

export interface IMovimientoTramiteRepository {
  findById(id: string): Promise<MovimientoTramite | null>;
  findByTramiteId(tramiteId: string): Promise<MovimientoTramite[]>;
  save(movimiento: MovimientoTramite): Promise<MovimientoTramite>;
  findUltimosMovimientos(limit?: number): Promise<MovimientoTramite[]>;
}

export const MOVIMIENTO_TRAMITE_REPOSITORY_TOKEN = Symbol('IMovimientoTramiteRepository');
