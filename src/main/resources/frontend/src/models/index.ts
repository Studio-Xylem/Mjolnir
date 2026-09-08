export enum PostType {
  LOST = 'LOST',
  FOUND = 'FOUND'
}

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED'
}

export interface User {
  id: string;
  username: string;
  createdAt: Timestamp;
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
  createdAt: Timestamp;
}

export interface CreatePostDTO {
  userId: string;
  title: string;
  description: string;
  category: string;
  type: PostType;
  location: string;
  pictureUrl?: string;
}

export interface UpdatePostDTO {
  title?: string;
  description?: string;
  pictureUrl?: string;
  category?: string;
  type?: PostType;
  status?: PostStatus;
  location?: string;
  currentCustody?: string;
}
import type { Timestamp } from 'firebase/firestore';
