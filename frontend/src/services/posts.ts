import { apiRequest } from './api';
import { Post, CreatePostDTO, PostType } from '../models';

export async function getPosts(type?: PostType): Promise<Post[]> {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiRequest<Post[]>(`/api/posts${query}`);
}

export async function getPost(id: string): Promise<Post> {
  return apiRequest<Post>(`/api/posts/${encodeURIComponent(id)}`);
}

export async function getMyPosts(): Promise<Post[]> {
  return apiRequest<Post[]>('/api/posts/mine');
}

export async function createPost(data: CreatePostDTO): Promise<Post> {
  return apiRequest<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolvePost(id: string): Promise<void> {
  return apiRequest<void>(`/api/posts/${encodeURIComponent(id)}/resolve`, {
    method: 'PATCH',
  });
}
