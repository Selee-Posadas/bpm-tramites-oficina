import { FastifyRequest } from 'fastify';

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
