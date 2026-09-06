import { Area } from '../entities/area.entity';

export interface IAreaRepository {
  findById(id: string): Promise<Area | null>;
  findByCodigo(codigo: string): Promise<Area | null>;
  findAll(soloActivas?: boolean): Promise<Area[]>;
  save(area: Area): Promise<Area>;
  update(area: Area): Promise<Area>;
}

export const AREA_REPOSITORY_TOKEN = Symbol('IAreaRepository');
