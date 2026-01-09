import pb from '../../lib/pocketbase';
import { RegisterInput, LoginInput, PBUser, Role } from '../../types';

export class AuthService {
  async register(data: RegisterInput) {
    try {
      // Create user in PocketBase
      // PocketBase automatically handles password hashing
      const user = await pb.collection('users').create<PBUser>({
        email: data.email,
        password: data.password,
        passwordConfirm: data.password,
        name: data.name,
        role: Role.READER, // Default role
      });

      // Debug log to see what PocketBase is returning
      console.log('PocketBase user created:', JSON.stringify(user, null, 2));

      // PocketBase auth collections should return all fields including email
      // If email is missing, fetch the user record to get all fields
      if (!user.email) {
        console.warn('Email not in create response, fetching user record...');
        const fetchedUser = await pb.collection('users').getOne<PBUser>(user.id);
        console.log('Fetched user:', JSON.stringify(fetchedUser, null, 2));
        
        return {
          id: fetchedUser.id,
          email: fetchedUser.email,
          name: fetchedUser.name,
          role: fetchedUser.role,
          createdAt: fetchedUser.created,
          updatedAt: fetchedUser.updated,
        };
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created,
        updatedAt: user.updated,
      };
    } catch (error: any) {
      // Handle PocketBase validation errors
      if (error?.data?.data?.email) {
        throw new Error('User with this email already exists');
      }
      console.error('Registration error:', error);
      throw new Error(error?.message || 'Registration failed');
    }
  }

  async login(data: LoginInput) {
    try {
      // Authenticate with PocketBase
      const authData = await pb.collection('users').authWithPassword<PBUser>(
        data.email,
        data.password
      );

      if (!authData.record) {
        throw new Error('Invalid credentials');
      }

      const user = authData.record;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created,
        updatedAt: user.updated,
      };
    } catch (error: any) {
      // PocketBase throws 400 for invalid credentials
      if (error?.status === 400) {
        throw new Error('Invalid credentials');
      }
      throw new Error(error?.message || 'Login failed');
    }
  }
}

