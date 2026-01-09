import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/roles.middleware';
import { $ref } from '../../utils/validation';
import { UpdateUserRoleInput, Role } from '../../types';

const usersService = new UsersService();

export async function usersRoutes(fastify: FastifyInstance) {
  // Get all users (ADMIN only)
  fastify.get('/', {
    onRequest: [authenticate, requireRole(Role.ADMIN)],
    schema: {
      description: 'Get all users (requires ADMIN role)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: $ref('userListResponseSchema'),
        401: $ref('errorResponseSchema'),
        403: $ref('errorResponseSchema'),
        500: $ref('errorResponseSchema'),
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await usersService.getAllUsers();
      return reply.send({ users });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to fetch users' 
      });
    }
  });

  // Update user role (ADMIN only)
  fastify.patch('/:id/role', {
    onRequest: [authenticate, requireRole(Role.ADMIN)],
    schema: {
      description: 'Update user role (requires ADMIN role)',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      params: $ref('uuidParamSchema'),
      body: $ref('updateRoleSchema'),
      response: {
        200: $ref('userUpdateRoleResponseSchema'),
        400: $ref('errorResponseSchema'),
        401: $ref('errorResponseSchema'),
        403: $ref('errorResponseSchema'),
        404: $ref('errorResponseSchema'),
        500: $ref('errorResponseSchema'),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await usersService.updateUserRole(id, request.body as UpdateUserRoleInput);

      return reply.send({
        message: 'User role updated successfully',
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: error.message 
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to update user role' 
      });
    }
  });
}

