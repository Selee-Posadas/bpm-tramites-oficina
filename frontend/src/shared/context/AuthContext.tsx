'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, RolInterno, TipoUsuario } from '../../features/auth/interfaces/auth.interface';
import { AuthActions } from '../../features/auth/actions/auth.actions';
import {
  setCookie,
  getCookie,
  removeCookie,
  COOKIE_INTERNAL_TOKEN,
  COOKIE_INTERNAL_USER,
  COOKIE_EXTERNAL_TOKEN,
  COOKIE_EXTERNAL_USER,
} from '../utils/cookies.util';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginInternal: (email: string, rol?: string, azureObjectId?: string) => Promise<void>;
  loginExternal: (email: string, password: string) => Promise<void>;
  registerExternal: (data: { email: string; password: string; nombre: string; documento: string; organizacion?: string }) => Promise<void>;
  logoutInternal: () => void;
  logoutExternal: () => void;
  hasRole: (roles: RolInterno[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

        if (pathname.startsWith('/interno')) {
          const storedToken = getCookie(COOKIE_INTERNAL_TOKEN);
          const storedUserStr = getCookie(COOKIE_INTERNAL_USER);

          if (storedToken && storedUserStr) {
            setToken(storedToken);
            try {
              const parsedUser: AuthUser = JSON.parse(storedUserStr);
              setUser(parsedUser);
              const me = await AuthActions.getInternalMe();
              setUser(me);
              setCookie(COOKIE_INTERNAL_USER, JSON.stringify(me));
            } catch {
              // Si falla me, mantener parsedUser si es offline o resetear
            }
          }
        } else if (pathname.startsWith('/externo')) {
          const storedToken = getCookie(COOKIE_EXTERNAL_TOKEN);
          const storedUserStr = getCookie(COOKIE_EXTERNAL_USER);

          if (storedToken && storedUserStr) {
            setToken(storedToken);
            try {
              const parsedUser: AuthUser = JSON.parse(storedUserStr);
              setUser(parsedUser);
              const me = await AuthActions.getExternalMe();
              setUser(me);
              setCookie(COOKIE_EXTERNAL_USER, JSON.stringify(me));
            } catch {
              // Si falla me
            }
          }
        }
      } catch (err) {
        console.error('Error inicializando autenticación desde cookies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const loginInternal = useCallback(async (email: string, rol?: string, azureObjectId?: string) => {
    setIsLoading(true);
    try {
      const result = await AuthActions.loginInternalMock({ email, rol, azureObjectId });
      setToken(result.token);
      setUser(result.user);
      setCookie(COOKIE_INTERNAL_TOKEN, result.token, { days: 7 });
      setCookie(COOKIE_INTERNAL_USER, JSON.stringify(result.user), { days: 7 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginExternal = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await AuthActions.loginExternal({ email, password });
      setToken(result.token);
      setUser(result.user);
      setCookie(COOKIE_EXTERNAL_TOKEN, result.token, { days: 7 });
      setCookie(COOKIE_EXTERNAL_USER, JSON.stringify(result.user), { days: 7 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerExternal = useCallback(async (data: { email: string; password: string; nombre: string; documento: string; organizacion?: string }) => {
    setIsLoading(true);
    try {
      const result = await AuthActions.registerExternal(data);
      setToken(result.token);
      setUser(result.user);
      setCookie(COOKIE_EXTERNAL_TOKEN, result.token, { days: 7 });
      setCookie(COOKIE_EXTERNAL_USER, JSON.stringify(result.user), { days: 7 });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutInternal = useCallback(() => {
    removeCookie(COOKIE_INTERNAL_TOKEN);
    removeCookie(COOKIE_INTERNAL_USER);
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/interno/login';
    }
  }, []);

  const logoutExternal = useCallback(() => {
    removeCookie(COOKIE_EXTERNAL_TOKEN);
    removeCookie(COOKIE_EXTERNAL_USER);
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/externo/login';
    }
  }, []);

  const hasRole = useCallback((roles: RolInterno[]): boolean => {
    if (!user || user.tipo !== TipoUsuario.INTERNO || !user.rolInterno) {
      return false;
    }
    return roles.includes(user.rolInterno);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginInternal,
        loginExternal,
        registerExternal,
        logoutInternal,
        logoutExternal,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
