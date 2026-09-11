import { apiRequest } from './api';
import { Post, CreatePostDTO, UpdatePostDTO, PostType, LostPostCreationResponse } from '../models';

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

export async function createLostPost(data: CreatePostDTO): Promise<LostPostCreationResponse> {
  return apiRequest<LostPostCreationResponse>('/api/posts/lost', {
    method: 'POST',
    body: JSON.stringify({ ...data, type: PostType.LOST }),
  });
}

export async function updatePost(id: string, data: UpdatePostDTO): Promise<Post> {
  return apiRequest<Post>(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: string): Promise<void> {
  return apiRequest<void>(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function resolvePost(id: string): Promise<void> {
  return apiRequest<void>(`/api/posts/${encodeURIComponent(id)}/resolve`, {
    method: 'PATCH',
  });
}

export async function getMatchingFoundPosts(lostPost: {
  id: string;
  title: string;
  category: string;
  location: string;
  description?: string;
  lostAt?: string;
}): Promise<Post[]> {
  return apiRequest<Post[]>(`/api/posts/${encodeURIComponent(lostPost.id)}/matches`);
}
