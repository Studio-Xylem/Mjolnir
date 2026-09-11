import { describe, it, expect, beforeEach } from 'vitest';
import { authAdapter } from '../auth';

describe('HybridAuthAdapter', () => {
  beforeEach(() => {
    authAdapter.clearLocalUser?.();
  });

  it('provides default headers or local headers', async () => {
    authAdapter.setLocalUser?.('test-user-123', 'Test User');
    const headers = await authAdapter.getHeaders();
    
    expect(headers['X-User-Id']).toBe('test-user-123');
    expect(headers['X-User-Name']).toBe('Test User');
  });

  it('reports authenticated when local user is set', () => {
    authAdapter.setLocalUser?.('test-user-123', 'Test User');
    expect(authAdapter.isAuthenticated()).toBe(true);
    expect(authAdapter.getUserId()).toBe('test-user-123');
  });
});
