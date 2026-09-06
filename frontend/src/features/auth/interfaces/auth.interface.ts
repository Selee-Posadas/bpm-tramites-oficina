export enum RolInterno {
  ADMIN = 'ADMIN',
  MESA_ENTRADA = 'MESA_ENTRADA',
  OPERADOR = 'OPERADOR',
  SUPERVISOR = 'SUPERVISOR',
  AUDITOR = 'AUDITOR',
}

export enum TipoUsuario {
  INTERNO = 'INTERNO',
  EXTERNO = 'EXTERNO',
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  tipo: TipoUsuario;
  rolInterno?: RolInterno;
  areaId?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
