export interface AreaResponseDto {
  id: string;
  nombre: string;
  codigo: string;
  activa: boolean;
}

export interface CreateAreaRequestDto {
  nombre: string;
  codigo: string;
  activa?: boolean;
}

export interface UpdateAreaRequestDto {
  nombre?: string;
  codigo?: string;
  activa?: boolean;
}
