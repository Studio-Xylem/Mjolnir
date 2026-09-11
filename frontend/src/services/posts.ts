import { apiRequest } from './api';
import { Post, CreatePostDTO, UpdatePostDTO, PostType } from '../models';

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

export async function updatePost(id: string, data: UpdatePostDTO): Promise<Post> {
  return apiRequest<Post>(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
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
  title: string;
  category: string;
  location: string;
  description?: string;
  lostOrFoundAt?: string;
}): Promise<Post[]> {
  // 1. Attempt to hit the backend matching endpoint if available
  try {
    const backendMatches = await apiRequest<Post[]>(`/api/posts/matches`, {
      method: 'POST',
      body: JSON.stringify(lostPost),
    });
    if (Array.isArray(backendMatches) && backendMatches.length > 0) {
      return backendMatches.slice(0, 5);
    }
  } catch {
    // Backend matching endpoint might still be in development
  }

  // 2. Query active FOUND items and score for top 5 matches
  try {
    const foundPosts = await getPosts(PostType.FOUND);
    if (!foundPosts || foundPosts.length === 0) return [];

    const queryWords = `${lostPost.title} ${lostPost.description || ''}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const locationWords = lostPost.location
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = foundPosts.map((post) => {
      let score = 0;

      // Category matching (highest priority)
      if (post.category && post.category.toLowerCase() === lostPost.category.toLowerCase()) {
        score += 50;
      } else if (
        post.category &&
        lostPost.category &&
        (post.category.toLowerCase().includes(lostPost.category.toLowerCase()) ||
          lostPost.category.toLowerCase().includes(post.category.toLowerCase()))
      ) {
        score += 25;
      }

      // Title & description keyword matching
      const targetText = `${post.title} ${post.description}`.toLowerCase();
      queryWords.forEach((word) => {
        if (targetText.includes(word)) score += 15;
      });

      // Location keyword matching
      const targetLoc = post.location.toLowerCase();
      locationWords.forEach((loc) => {
        if (targetLoc.includes(loc)) score += 20;
      });

      return { post, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.post);
  } catch {
    return [];
  }
}
