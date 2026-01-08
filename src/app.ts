import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import config from './config/env';
import { jsonSchemas } from './utils/validation';
import { authRoutes } from './modules/auth/auth.controller';
import { postsRoutes } from './modules/posts/posts.controller';
import { usersRoutes } from './modules/users/users.controller';

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'error',
      transport: config.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      } : undefined,
    },
  });

  // Register CORS
  await fastify.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is in allowed list
      if (config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // In development, allow localhost with any port
      if (config.nodeEnv === 'development' && origin.includes('localhost')) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Register JWT
  await fastify.register(jwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: '7d', // Token expires in 7 days
    },
  });

  // Register Swagger for API documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Role-Based Blog API',
        description: 'RESTful API with role-based access control, built with Fastify, Prisma, and JWT authentication',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });

  // Register JSON Schemas from Zod
  for (const schema of jsonSchemas) {
    fastify.addSchema(schema);
  }

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(postsRoutes, { prefix: '/api/posts' });
  fastify.register(usersRoutes, { prefix: '/api/users' });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404,
    });
  });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    // JWT errors
    if (error.name === 'UnauthorizedError') {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token',
      });
    }

    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      return reply.status(400).send({
        error: 'Database Error',
        message: 'An error occurred while processing your request',
      });
    }

    // Default error
    reply.status(error.statusCode || 500).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  });

  return fastify;
}

