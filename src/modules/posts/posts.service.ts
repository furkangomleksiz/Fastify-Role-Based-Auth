import prisma from '../../lib/prisma';
import { CreatePostInput, UpdatePostInput } from '../../types';
import { Role } from '@prisma/client';

export class PostsService {
  async getAllPosts(userRole?: Role) {
    // If no user or READER role, only show published posts
    // WRITER and ADMIN can see all posts
    const where = !userRole || userRole === 'READER' 
      ? { published: true }
      : {};

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return posts;
  }

  async getPostById(id: string, userRole?: Role) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // If post is not published, only WRITER and ADMIN can view it
    if (!post.published && (!userRole || userRole === 'READER')) {
      throw new Error('Post not found');
    }

    return post;
  }

  async createPost(data: CreatePostInput, authorId: string) {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  async updatePost(id: string, data: UpdatePostInput) {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  async deletePost(id: string) {
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      throw new Error('Post not found');
    }

    await prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }
}

