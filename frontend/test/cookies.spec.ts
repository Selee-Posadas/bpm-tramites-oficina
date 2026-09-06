import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCookie,
  getCookie,
  removeCookie,
  COOKIE_INTERNAL_TOKEN,
  COOKIE_INTERNAL_USER,
  COOKIE_EXTERNAL_TOKEN,
  COOKIE_EXTERNAL_USER,
} from '@/shared/utils/cookies.util';

describe('Cookies Utilities (Seguridad sin localStorage)', () => {
  beforeEach(() => {
    removeCookie(COOKIE_INTERNAL_TOKEN);
    removeCookie(COOKIE_INTERNAL_USER);
    removeCookie(COOKIE_EXTERNAL_TOKEN);
    removeCookie(COOKIE_EXTERNAL_USER);
  });

  it('debe almacenar y recuperar un token en cookies de forma segura', () => {
    setCookie(COOKIE_INTERNAL_TOKEN, 'test-jwt-token-internal', { days: 7 });
    const token = getCookie(COOKIE_INTERNAL_TOKEN);
    expect(token).toBe('test-jwt-token-internal');
  });

  it('debe almacenar y recuperar objetos serializados de usuario', () => {
    const user = { id: 'usr-1', email: 'admin@bpm.local', rolInterno: 'ADMIN' };
    setCookie(COOKIE_INTERNAL_USER, JSON.stringify(user));
    const raw = getCookie(COOKIE_INTERNAL_USER);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.id).toBe('usr-1');
    expect(parsed.rolInterno).toBe('ADMIN');
  });

  it('debe eliminar la cookie correctamente al cerrar sesión', () => {
    setCookie(COOKIE_EXTERNAL_TOKEN, 'ext-jwt-token');
    expect(getCookie(COOKIE_EXTERNAL_TOKEN)).toBe('ext-jwt-token');

    removeCookie(COOKIE_EXTERNAL_TOKEN);
    expect(getCookie(COOKIE_EXTERNAL_TOKEN)).toBeNull();
  });
});
