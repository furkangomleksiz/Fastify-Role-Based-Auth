import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { $ref } from '../../utils/validation';
import { JWTPayload, RegisterInput, LoginInput } from '../../types';

const authService = new AuthService();

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['Authentication'],
      body: $ref('registerSchema'),
      response: {
        201: $ref('authResponseSchema'),
        400: $ref('errorResponseSchema'),
        409: $ref('errorResponseSchema'),
      },
    },
  }, async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
    try {
      const user = await authService.register(request.body);

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = fastify.jwt.sign(payload);

      return reply.status(201).send({
        message: 'User registered successfully',
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User with this email already exists') {
        return reply.status(409).send({ 
          error: 'Conflict', 
          message: error.message 
        });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to register user' 
      });
    }
  });

  // Login
  fastify.post('/login', {
    schema: {
      description: 'Login with email and password',
      tags: ['Authentication'],
      body: $ref('loginSchema'),
      response: {
        200: $ref('authResponseSchema'),
        400: $ref('errorResponseSchema'),
        401: $ref('errorResponseSchema'),
      },
    },
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    try {
      const user = await authService.login(request.body);

      // Generate JWT token
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = fastify.jwt.sign(payload);

      return reply.send({
        message: 'Login successful',
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        token,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return reply.status(401).send({ 
          error: 'Unauthorized', 
          message: error.message 
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to login' 
      });
    }
  });
}

