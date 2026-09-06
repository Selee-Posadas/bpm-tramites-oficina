import { FastifyRequest, RouteGenericInterface } from 'fastify';
import { AuthenticatedUser } from '../../domain/auth-user.interface';

export interface FastifyAuthRequest<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
> extends FastifyRequest<RouteGeneric> {
  user?: AuthenticatedUser;
}
