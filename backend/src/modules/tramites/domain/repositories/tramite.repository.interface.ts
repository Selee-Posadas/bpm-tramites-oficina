import { Tramite } from '../entities/tramite.entity';
import { EstadoTramite } from '../enums/estado-tramite.enum';
import { OrigenTramite } from '../enums/origen-tramite.enum';
import { PrioridadTramite } from '../enums/prioridad-tramite.enum';

export interface TramiteFiltros {
  estado?: EstadoTramite;
  origen?: OrigenTramite;
  prioridad?: PrioridadTramite;
  areaActualId?: string;
  areaId?: string;
  tipoTramiteId?: string;
  usuarioAsignadoId?: string;
  usuarioExternoId?: string;
  creadoPorId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  soloVencidos?: boolean;
  busqueda?: string;
  skip?: number;
  take?: number;
}

export interface ITramiteRepository {
  findById(id: string): Promise<Tramite | null>;
  findByNumero(numero: string): Promise<Tramite | null>;
  findAll(filtros?: TramiteFiltros): Promise<{ tramites: Tramite[]; total: number }>;
  save(tramite: Tramite): Promise<Tramite>;
  update(tramite: Tramite): Promise<Tramite>;
  updateIfUnassigned?(tramite: Tramite): Promise<Tramite>;
  delete(id: string): Promise<void>;
  countByEstado(): Promise<Record<EstadoTramite, number>>;
  countByOrigen(): Promise<Record<OrigenTramite, number>>;
  countByArea(): Promise<Array<{ areaId: string; cantidad: number }>>;
}

export const TRAMITE_REPOSITORY_TOKEN = Symbol('ITramiteRepository');
