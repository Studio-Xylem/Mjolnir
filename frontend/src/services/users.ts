import { apiRequest } from './api';
import { User } from '../models';

export async function registerUser(username: string): Promise<User> {
  return apiRequest<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/api/auth/me');
}
