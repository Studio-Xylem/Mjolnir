export enum PostType {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

export enum CurrentCustody {
  SELF = 'SELF',
  CUSTODY = 'CUSTODY',
}

export enum ContactType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
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
  currentCustody: CurrentCustody | null;
  custodyLocation?: string;
  contactType?: ContactType;
  contactValue?: string;
  lostAt?: string;
  foundAt?: string;
  createdAt: string;
}

export interface CreatePostDTO {
  title: string;
  description: string;
  category: string;
  type: PostType;
  location: string;
  pictureUrl?: string;
  currentCustody?: CurrentCustody;
  custodyLocation?: string;
  contactType?: ContactType;
  contactValue?: string;
  lostAt?: string;
  foundAt?: string;
}

export interface UpdatePostDTO {
  title: string;
  description: string;
  pictureUrl?: string;
  category: string;
  type: PostType;
  location: string;
  currentCustody?: CurrentCustody;
  custodyLocation?: string;
  contactType?: ContactType;
  contactValue?: string;
  lostAt?: string;
  foundAt?: string;
}

export interface LostPostCreationResponse {
  post: Post;
  matches: Post[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
