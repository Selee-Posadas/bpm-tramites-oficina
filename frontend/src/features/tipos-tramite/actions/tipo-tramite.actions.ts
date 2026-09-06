import { httpClient } from '../../../shared/api/httpClient';
import {
  CreateTipoTramiteRequestDto,
  TipoTramiteResponseDto,
  UpdateTipoTramiteRequestDto,
} from '../interfaces/tipo-tramite.api.interface';
import { TipoTramiteAdapter } from '../adapters/tipo-tramite.adapter';
import { TipoTramite } from '../interfaces/tipo-tramite.interface';

export class TipoTramiteActions {
  static async listar(soloActivos: boolean = false): Promise<TipoTramite[]> {
    const response = await httpClient.get<TipoTramiteResponseDto[]>('/tipos-tramite', {
      params: { soloActivos: soloActivos.toString() },
    });
    return TipoTramiteAdapter.toDomainList(response.data);
  }

  static async obtenerPorId(id: string): Promise<TipoTramite> {
    const response = await httpClient.get<TipoTramiteResponseDto>(`/tipos-tramite/${id}`);
    return TipoTramiteAdapter.toDomain(response.data);
  }

  static async crear(dto: CreateTipoTramiteRequestDto): Promise<TipoTramite> {
    const response = await httpClient.post<TipoTramiteResponseDto>('/tipos-tramite', dto);
    return TipoTramiteAdapter.toDomain(response.data);
  }

  static async actualizar(id: string, dto: UpdateTipoTramiteRequestDto): Promise<TipoTramite> {
    const response = await httpClient.put<TipoTramiteResponseDto>(`/tipos-tramite/${id}`, dto);
    return TipoTramiteAdapter.toDomain(response.data);
  }
}
