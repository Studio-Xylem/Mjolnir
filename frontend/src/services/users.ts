import { apiRequest } from './api';
import { AuthResponse, User } from '../models';

export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/api/auth/me');
}
