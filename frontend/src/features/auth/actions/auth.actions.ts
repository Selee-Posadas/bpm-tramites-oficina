import { httpClient } from '../../../shared/api/httpClient';
import {
  AuthTokenResponseDto,
  AuthenticatedUserDto,
  LoginExternalRequestDto,
  LoginInternalMockRequestDto,
  RegisterExternalRequestDto,
} from '../interfaces/auth.api.interface';
import { AuthAdapter } from '../adapters/auth.adapter';
import { AuthUser } from '../interfaces/auth.interface';

export class AuthActions {
  static async loginInternalMock(dto: LoginInternalMockRequestDto): Promise<{ token: string; user: AuthUser }> {
    const response = await httpClient.post<AuthTokenResponseDto>('/auth/internal/login', dto);
    return AuthAdapter.fromTokenResponse(response.data);
  }

  static async getInternalMe(): Promise<AuthUser> {
    const response = await httpClient.get<AuthenticatedUserDto>('/auth/internal/me');
    return AuthAdapter.toUser(response.data);
  }

  static async loginExternal(dto: LoginExternalRequestDto): Promise<{ token: string; user: AuthUser }> {
    const response = await httpClient.post<AuthTokenResponseDto>('/auth/external/login', dto);
    return AuthAdapter.fromTokenResponse(response.data);
  }

  static async registerExternal(dto: RegisterExternalRequestDto): Promise<{ token: string; user: AuthUser }> {
    const response = await httpClient.post<AuthTokenResponseDto>('/auth/external/register', dto);
    return AuthAdapter.fromTokenResponse(response.data);
  }

  static async getExternalMe(): Promise<AuthUser> {
    const response = await httpClient.get<AuthenticatedUserDto>('/auth/external/me');
    return AuthAdapter.toUser(response.data);
  }
}
