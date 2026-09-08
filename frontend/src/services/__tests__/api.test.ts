import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, ApiRequestError } from '../api';

describe('apiRequest wrapper', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches successfully and returns parsed JSON', async () => {
    const mockData = { id: '1', title: 'Keys' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    });

    const result = await apiRequest<{ id: string; title: string }>('/api/posts/1');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws ApiRequestError when response is not ok', async () => {
    const errorBody = { timestamp: '2026-09-08', status: 404, error: 'Not Found', message: 'Item missing' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorBody,
    });

    await expect(apiRequest('/api/posts/invalid')).rejects.toThrow(ApiRequestError);
  });
});
