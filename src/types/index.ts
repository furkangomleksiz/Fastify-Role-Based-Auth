// Re-export Zod-inferred types (single source of truth from validation schemas)
export type {
  RegisterInput,
  LoginInput,
  CreatePostInput,
  UpdatePostInput,
  UpdateUserRoleInput,
} from '../utils/validation';

// Role enum (matching PocketBase schema)
export enum Role {
  READER = 'READER',
  WRITER = 'WRITER',
  ADMIN = 'ADMIN',
}

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

// PocketBase collection types
export interface PBUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  created: string;
  updated: string;
}

export interface PBPost {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author: string; // User ID
  created: string;
  updated: string;
}

export interface PBPostExpanded extends PBPost {
  expand?: {
    author: PBUser;
  };
}

export { Role as default };

