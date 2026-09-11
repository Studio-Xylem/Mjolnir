import { authAdapter } from './auth';
import { ApiError } from '../models';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export class ApiRequestError extends Error {
  status: number;
  apiError: ApiError | null;
  isNetworkError: boolean;

  constructor(message: string, status: number, apiError: ApiError | null, isNetworkError: boolean) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.apiError = apiError;
    this.isNetworkError = isNetworkError;
  }
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options?.headers);

  const authHeaders = await authAdapter.getHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (options?.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    throw new ApiRequestError('Network error', 0, null, true);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  if (!response.ok) {
    let apiError: ApiError | null = null;
    try {
      apiError = await response.json();
    } catch (e) {
      // Ignored
    }
    throw new ApiRequestError(
      apiError?.message || response.statusText || 'API Error',
      response.status,
      apiError,
      false
    );
  }

  const contentType = response.headers?.get('content-type');
  if (!contentType || contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}
