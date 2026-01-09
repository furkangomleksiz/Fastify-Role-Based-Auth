import pb from '../../lib/pocketbase';
import { CreatePostInput, UpdatePostInput, PBPostExpanded, Role } from '../../types';

export class PostsService {
  async getAllPosts(userRole?: Role) {
    try {
      // If no user or READER role, only show published posts
      // WRITER and ADMIN can see all posts
      const filter = !userRole || userRole === Role.READER 
        ? 'published = true'
        : '';

      const posts = await pb.collection('posts').getFullList<PBPostExpanded>({
        filter,
        sort: '-created',
        expand: 'author',
      });

      // Transform to match expected format
      return posts.map((post: PBPostExpanded) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        authorId: post.author,
        createdAt: post.created,
        updatedAt: post.updated,
        author: post.expand?.author ? {
          id: post.expand.author.id,
          name: post.expand.author.name,
          email: post.expand.author.email,
        } : undefined,
      }));
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to fetch posts');
    }
  }

  async getPostById(id: string, userRole?: Role) {
    try {
      const post = await pb.collection('posts').getOne<PBPostExpanded>(id, {
        expand: 'author',
      });

      // If post is not published, only WRITER and ADMIN can view it
      if (!post.published && (!userRole || userRole === Role.READER)) {
        throw new Error('Post not found');
      }

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        authorId: post.author,
        createdAt: post.created,
        updatedAt: post.updated,
        author: post.expand?.author ? {
          id: post.expand.author.id,
          name: post.expand.author.name,
          email: post.expand.author.email,
        } : undefined,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(error?.message || 'Failed to fetch post');
    }
  }

  async createPost(data: CreatePostInput, authorId: string) {
    try {
      const post = await pb.collection('posts').create<PBPostExpanded>({
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        author: authorId,
      }, {
        expand: 'author',
      });

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        authorId: post.author,
        createdAt: post.created,
        updatedAt: post.updated,
        author: post.expand?.author ? {
          id: post.expand.author.id,
          name: post.expand.author.name,
          email: post.expand.author.email,
        } : undefined,
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create post');
    }
  }

  async updatePost(id: string, data: UpdatePostInput) {
    try {
      // Check if post exists
      await pb.collection('posts').getOne(id);

      const post = await pb.collection('posts').update<PBPostExpanded>(id, data, {
        expand: 'author',
      });

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
        authorId: post.author,
        createdAt: post.created,
        updatedAt: post.updated,
        author: post.expand?.author ? {
          id: post.expand.author.id,
          name: post.expand.author.name,
          email: post.expand.author.email,
        } : undefined,
      };
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(error?.message || 'Failed to update post');
    }
  }

  async deletePost(id: string) {
    try {
      // Check if post exists
      await pb.collection('posts').getOne(id);

      await pb.collection('posts').delete(id);

      return { message: 'Post deleted successfully' };
    } catch (error: any) {
      if (error?.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error(error?.message || 'Failed to delete post');
    }
  }
}

