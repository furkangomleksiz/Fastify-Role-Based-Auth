import { FastifyReply, FastifyRequest } from 'fastify';
import { JWTPayload } from '../types';

// Extend @fastify/jwt to specify the JWT payload type
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JWTPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing token' });
  }
}

