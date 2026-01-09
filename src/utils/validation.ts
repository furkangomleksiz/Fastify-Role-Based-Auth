import { z } from 'zod';
import { Role } from '../types';
import { buildJsonSchemas } from 'fastify-zod';

// ===== Request Schemas =====
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean().optional().default(false),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const uuidParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// ===== Response Schemas =====
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(Role),
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({
    posts: z.number(),
  }).optional(),
});

const postAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
}).optional();

export const postResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  published: z.boolean(),
  authorId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  author: postAuthorSchema,
});

export const authResponseSchema = z.object({
  message: z.string(),
  user: userResponseSchema,
  token: z.string(),
});

export const postListResponseSchema = z.object({
  posts: z.array(postResponseSchema),
});

export const postSingleResponseSchema = z.object({
  post: postResponseSchema,
});

export const postCreateResponseSchema = z.object({
  message: z.string(),
  post: postResponseSchema,
});

export const postUpdateResponseSchema = z.object({
  message: z.string(),
  post: postResponseSchema,
});

export const postDeleteResponseSchema = z.object({
  message: z.string(),
});

export const userListResponseSchema = z.object({
  users: z.array(userResponseSchema),
});

export const userSingleResponseSchema = z.object({
  user: userResponseSchema,
});

export const userUpdateRoleResponseSchema = z.object({
  message: z.string(),
  user: userResponseSchema,
});

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.array(z.any()).optional(),
});

// ===== Build JSON Schemas for Fastify =====
export const { schemas: jsonSchemas, $ref } = buildJsonSchemas(
  {
    // Request schemas
    registerSchema,
    loginSchema,
    createPostSchema,
    updatePostSchema,
    updateRoleSchema,
    uuidParamSchema,
    // Response schemas
    userResponseSchema,
    postResponseSchema,
    authResponseSchema,
    postListResponseSchema,
    postSingleResponseSchema,
    postCreateResponseSchema,
    postUpdateResponseSchema,
    postDeleteResponseSchema,
    userListResponseSchema,
    userSingleResponseSchema,
    userUpdateRoleResponseSchema,
    errorResponseSchema,
  },
  { $id: 'BlogAPISchemas' }
);

// ===== Infer TypeScript types from Zod schemas =====
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateRoleSchema>;

