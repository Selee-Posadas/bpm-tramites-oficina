export interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  const {
    days = 7,
    path = '/',
    sameSite = 'Lax',
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; SameSite=${sameSite}`;

  if (days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    cookieString += `; expires=${expires}`;
  }

  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim();
    if (c.indexOf(prefix) === 0) {
      return decodeURIComponent(c.substring(prefix.length));
    }
  }

  return null;
}

export function removeCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export const COOKIE_INTERNAL_TOKEN = 'bpm_internal_token';
export const COOKIE_INTERNAL_USER = 'bpm_internal_user';
export const COOKIE_EXTERNAL_TOKEN = 'bpm_external_token';
export const COOKIE_EXTERNAL_USER = 'bpm_external_user';
