import { httpClient } from '../../../shared/api/httpClient';
import { AreaResponseDto, CreateAreaRequestDto, UpdateAreaRequestDto } from '../interfaces/area.api.interface';
import { AreaAdapter } from '../adapters/area.adapter';
import { Area } from '../interfaces/area.interface';

export class AreaActions {
  static async listarAreas(soloActivas: boolean = false): Promise<Area[]> {
    const response = await httpClient.get<AreaResponseDto[]>('/areas', {
      params: { soloActivas: soloActivas.toString() },
    });
    return AreaAdapter.toDomainList(response.data);
  }

  static async obtenerArea(id: string): Promise<Area> {
    const response = await httpClient.get<AreaResponseDto>(`/areas/${id}`);
    return AreaAdapter.toDomain(response.data);
  }

  static async crearArea(dto: CreateAreaRequestDto): Promise<Area> {
    const response = await httpClient.post<AreaResponseDto>('/areas', dto);
    return AreaAdapter.toDomain(response.data);
  }

  static async actualizarArea(id: string, dto: UpdateAreaRequestDto): Promise<Area> {
    const response = await httpClient.put<AreaResponseDto>(`/areas/${id}`, dto);
    return AreaAdapter.toDomain(response.data);
  }
}
