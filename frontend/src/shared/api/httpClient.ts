import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getCookie,
  removeCookie,
  COOKIE_INTERNAL_TOKEN,
  COOKIE_INTERNAL_USER,
  COOKIE_EXTERNAL_TOKEN,
  COOKIE_EXTERNAL_USER,
} from '../utils/cookies.util';
import { emitGlobalNotification, emitGlobalDialog } from '../context/NotificationContext';

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const httpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      let token: string | null = null;

      if (pathname.startsWith('/interno')) {
        token = getCookie(COOKIE_INTERNAL_TOKEN);
      } else if (pathname.startsWith('/externo')) {
        token = getCookie(COOKIE_EXTERNAL_TOKEN);
      } else {
        token = getCookie(COOKIE_INTERNAL_TOKEN) || getCookie(COOKIE_EXTERNAL_TOKEN);
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      let mensaje = 'Ha ocurrido un error inesperado';

      if (data && data.message) {
        mensaje = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }

      switch (status) {
        case 401:
          emitGlobalNotification('Sesión inválida o expirada. Por favor inicie sesión nuevamente.', 'error');
          if (typeof window !== 'undefined') {
            const pathname = window.location.pathname;
            if (pathname.startsWith('/interno')) {
              removeCookie(COOKIE_INTERNAL_TOKEN);
              removeCookie(COOKIE_INTERNAL_USER);
              if (pathname !== '/interno/login') {
                window.location.href = '/interno/login';
              }
            } else if (pathname.startsWith('/externo')) {
              removeCookie(COOKIE_EXTERNAL_TOKEN);
              removeCookie(COOKIE_EXTERNAL_USER);
              if (pathname !== '/externo/login' && pathname !== '/externo/registro') {
                window.location.href = '/externo/login';
              }
            }
          }
          break;

        case 403:
          emitGlobalDialog('Acceso no Autorizado', mensaje || 'No tiene permisos para acceder o realizar esta acción.', 'error');
          break;

        case 404:
          emitGlobalNotification(mensaje || 'El recurso solicitado no fue encontrado.', 'info');
          break;

        case 422:
          emitGlobalDialog('Regla de Trámite', mensaje || 'La operación no cumple con las reglas de negocio del trámite.', 'warning');
          break;

        case 500:
          emitGlobalNotification('Error interno del servidor. Por favor, intente nuevamente más tarde.', 'error');
          break;

        default:
          emitGlobalNotification(mensaje, 'error');
          break;
      }
    } else if (error.request) {
      emitGlobalNotification('No se pudo establecer conexión con el servidor. Verifique su red.', 'error');
    }

    return Promise.reject(error);
  },
);
