import { FastifyReply, FastifyRequest } from 'fastify';
import { Role } from '../types';

export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user;

    if (!user) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      reply.status(403).send({ 
        error: 'Forbidden', 
        message: 'You do not have permission to access this resource' 
      });
      return;
    }
  };
}

