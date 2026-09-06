import { FastifyRequest } from 'fastify';

/**
 * Normaliza y extrae el token Bearer del header Authorization de Fastify,
 * soportando variaciones de mayúsculas/minúsculas ('bearer', 'Bearer', 'BEARER')
 * y espacios múltiples o tabulaciones.
 */
export function extractBearerToken(request: FastifyRequest): string | null {
  const headers = request.headers as Record<string, unknown>;
  const authHeader = headers['authorization'] ?? headers['Authorization'];

  if (typeof authHeader !== 'string') {
    return null;
  }

  const trimmed = authHeader.trim();
  const match = trimmed.match(/^bearer\s+(\S+)$/i);
  if (!match || !match[1]) {
    return null;
  }

  return match[1];
}
