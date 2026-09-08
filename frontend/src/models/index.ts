export enum PostType {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  description: string;
  pictureUrl: string;
  category: string;
  type: PostType;
  status: PostStatus;
  location: string;
  currentCustody: string;
  createdAt: string;
}

export interface CreatePostDTO {
  title: string;
  description: string;
  category: string;
  type: PostType;
  location: string;
  pictureUrl?: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
