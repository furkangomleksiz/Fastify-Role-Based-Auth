import { Role } from '@prisma/client';

// Re-export Zod-inferred types (single source of truth from validation schemas)
export type {
  RegisterInput,
  LoginInput,
  CreatePostInput,
  UpdatePostInput,
  UpdateUserRoleInput,
} from '../utils/validation';

// Application-specific types (not DTOs)
export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

export { Role };

