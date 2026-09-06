export interface RegisterExternalRequestDto {
  email: string;
  password: string;
  nombre: string;
  documento: string;
  organizacion?: string;
}

export interface LoginExternalRequestDto {
  email: string;
  password: string;
}

export interface LoginInternalMockRequestDto {
  email: string;
  nombre?: string;
  rol?: string;
  azureObjectId?: string;
}

export interface AuthTokenResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    tipo: 'INTERNO' | 'EXTERNO';
    rolInterno?: string;
    areaId?: string;
  };
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  nombre: string;
  tipo: 'INTERNO' | 'EXTERNO';
  rolInterno?: string;
  areaId?: string;
}
