import { apiRequest } from './api';
import { User, Post, CreatePostDTO, UpdatePostDTO, PostType, PostStatus } from '../models';

export const userService = {
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<string> {
    const result = await apiRequest<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return result.id;
  },

  getById: async (_id: string): Promise<User | null> => apiRequest<User>('/api/auth/me'),
  getByUsername: async (_username: string): Promise<User | null> => apiRequest<User>('/api/auth/me'),
};

export const postService = {
  create: async (post: CreatePostDTO): Promise<string> => {
    const result = await apiRequest<Post>('/api/posts', { method: 'POST', body: JSON.stringify(post) });
    return result.id;
  },

  getById: async (id: string): Promise<Post | null> => apiRequest<Post>(`/api/posts/${id}`),
  getByUserId: async (_userId: string): Promise<Post[]> => apiRequest<Post[]>('/api/posts/mine'),
  getByType: async (type: PostType): Promise<Post[]> => apiRequest<Post[]>(`/api/posts?type=${type}`),
  getByStatus: async (status: PostStatus): Promise<Post[]> =>
    status === PostStatus.ACTIVE ? apiRequest<Post[]>('/api/posts') : Promise.resolve([]),
  getAllActive: async (): Promise<Post[]> => apiRequest<Post[]>('/api/posts'),

  update: async (_id: string, _updates: UpdatePostDTO): Promise<void> => {
    throw new Error('Post updates are not supported by the API yet');
  },
  updateStatus: async (id: string, status: PostStatus): Promise<void> => {
    if (status !== PostStatus.RESOLVED) throw new Error('Only resolving posts is supported');
    await apiRequest<void>(`/api/posts/${id}/resolve`, { method: 'PATCH' });
  },
  delete: async (_id: string): Promise<void> => {
    throw new Error('Post deletion is not supported by the API yet');
  },
};
