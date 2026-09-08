import { describe, it, expect } from 'vitest';
import { LocalAuthAdapter, createAuthAdapter } from '../auth';

describe('LocalAuthAdapter', () => {
  it('returns default headers', async () => {
    const adapter = new LocalAuthAdapter();
    const headers = await adapter.getHeaders();
    
    expect(headers['X-User-Id']).toBeDefined();
    expect(headers['X-User-Email']).toBe('local@example.test');
    expect(headers['X-User-Name']).toBe('Local User');
  });

  it('reports authenticated as true', () => {
    const adapter = new LocalAuthAdapter();
    expect(adapter.isAuthenticated()).toBe(true);
  });

  it('returns non-null user id', () => {
    const adapter = new LocalAuthAdapter();
    expect(adapter.getUserId()).toBeTruthy();
  });
});

describe('createAuthAdapter', () => {
  it('instantiates LocalAuthAdapter when firebase key is absent', () => {
    const adapter = createAuthAdapter();
    expect(adapter.getUserId()).toBeTruthy();
  });
});
