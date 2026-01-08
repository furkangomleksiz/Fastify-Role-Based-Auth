import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PostsService } from './posts.service';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/roles.middleware';
import { $ref } from '../../utils/validation';
import { CreatePostInput, UpdatePostInput } from '../../types';

const postsService = new PostsService();

export async function postsRoutes(fastify: FastifyInstance) {
  // Get all posts (public, but behavior differs based on role)
  fastify.get('/', {
    schema: {
      description: 'Get all posts (published posts for public, all posts for admin)',
      tags: ['Posts'],
      response: {
        200: $ref('postListResponseSchema'),
        500: $ref('errorResponseSchema'),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Try to get user from token if provided, but don't require it
      try {
        await request.jwtVerify();
      } catch {
        // No token or invalid token - treat as public access
      }

      const posts = await postsService.getAllPosts(request.user?.role);
      const formattedPosts = posts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }));
      
      return reply.send({ posts: formattedPosts });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to fetch posts' 
      });
    }
  });

  // Get single post
  fastify.get('/:id', {
    schema: {
      description: 'Get a single post by ID',
      tags: ['Posts'],
      params: $ref('uuidParamSchema'),
      response: {
        200: $ref('postSingleResponseSchema'),
        400: $ref('errorResponseSchema'),
        404: $ref('errorResponseSchema'),
        500: $ref('errorResponseSchema'),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Try to get user from token if provided
      try {
        await request.jwtVerify();
      } catch {
        // No token or invalid token - treat as public access
      }

      const { id } = request.params as { id: string };
      const post = await postsService.getPostById(id, request.user?.role);
      
      return reply.send({ 
        post: {
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Post not found') {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: error.message 
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to fetch post' 
      });
    }
  });

  // Create post (WRITER, ADMIN)
  fastify.post('/', {
    onRequest: [authenticate, requireRole('WRITER', 'ADMIN')],
    schema: {
      description: 'Create a new post (requires WRITER or ADMIN role)',
      tags: ['Posts'],
      security: [{ bearerAuth: [] }],
      body: $ref('createPostSchema'),
      response: {
        201: $ref('postCreateResponseSchema'),
        400: $ref('errorResponseSchema'),
        401: $ref('errorResponseSchema'),
        403: $ref('errorResponseSchema'),
        500: $ref('errorResponseSchema'),
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const post = await postsService.createPost(request.body as CreatePostInput, request.user!.userId);

      return reply.status(201).send({
        message: 'Post created successfully',
        post: {
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to create post' 
      });
    }
  });

  // Update post (ADMIN only)
  fastify.patch('/:id', {
    onRequest: [authenticate, requireRole('ADMIN')],
    schema: {
      description: 'Update a post (requires ADMIN role)',
      tags: ['Posts'],
      security: [{ bearerAuth: [] }],
      params: $ref('uuidParamSchema'),
      body: $ref('updatePostSchema'),
      response: {
        200: $ref('postUpdateResponseSchema'),
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
      const post = await postsService.updatePost(id, request.body as UpdatePostInput);

      return reply.send({
        message: 'Post updated successfully',
        post: {
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Post not found') {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: error.message 
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to update post' 
      });
    }
  });

  // Delete post (ADMIN only)
  fastify.delete('/:id', {
    onRequest: [authenticate, requireRole('ADMIN')],
    schema: {
      description: 'Delete a post (requires ADMIN role)',
      tags: ['Posts'],
      security: [{ bearerAuth: [] }],
      params: $ref('uuidParamSchema'),
      response: {
        200: $ref('postDeleteResponseSchema'),
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
      const result = await postsService.deletePost(id);
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Post not found') {
        return reply.status(404).send({ 
          error: 'Not Found', 
          message: error.message 
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({ 
        error: 'Internal Server Error', 
        message: 'Failed to delete post' 
      });
    }
  });
}

