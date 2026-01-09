import pb from '../../lib/pocketbase';
import { UpdateUserRoleInput, PBUser } from '../../types';

export class UsersService {
  async getAllUsers() {
    try {
      const users = await pb.collection('users').getFullList<PBUser>({
        sort: '-created',
      });

      // Get post counts for each user
      const usersWithCounts = await Promise.all(
        users.map(async (user) => {
          const posts = await pb.collection('posts').getFullList({
            filter: `author = "${user.id}"`,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.created,
            updatedAt: user.updated,
            _count: {
              posts: posts.length,
            },
          };
        })
      );

      return usersWithCounts;
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch users');
    }
  }

  async updateUserRole(userId: string, data: UpdateUserRoleInput) {
    try {
      // Check if user exists
      await pb.collection('users').getOne(userId);

      // Update user role
      const user = await pb.collection('users').update<PBUser>(userId, {
        role: data.role,
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created,
        updatedAt: user.updated,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error?.message || 'Failed to update user role');
    }
  }
}

