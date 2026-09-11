import { auth } from './firebase';

export interface AuthAdapter {
  getHeaders(): Promise<Record<string, string>>;
  isAuthenticated(): boolean;
  getUserId(): string | null;
  setLocalUser?(id: string, name: string): void;
  clearLocalUser?(): void;
}

let localUserOverride: { id: string; name: string } | null = (() => {
  const saved = localStorage.getItem('mjolnir_local_user');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return null;
})();

export class HybridAuthAdapter implements AuthAdapter {
  setLocalUser(id: string, name: string) {
    localUserOverride = { id, name };
    localStorage.setItem('mjolnir_local_user', JSON.stringify(localUserOverride));
  }

  clearLocalUser() {
    localUserOverride = null;
    localStorage.removeItem('mjolnir_local_user');
  }

  async getHeaders(): Promise<Record<string, string>> {
    try {
      const user = auth?.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return {
          Authorization: `Bearer ${token}`,
        };
      }

      if (localUserOverride) {
        return {
          'X-User-Id': localUserOverride.id,
          'X-User-Name': localUserOverride.name,
          'X-User-Email': `${localUserOverride.id}@example.test`,
        };
      }

      const defaultLocalId = import.meta.env.VITE_LOCAL_USER_ID;
      if (defaultLocalId) {
        return {
          'X-User-Id': defaultLocalId,
          'X-User-Name': 'Local User',
          'X-User-Email': 'local@example.test',
        };
      }

      return {};
    } catch (error) {
      console.error('Auth header generation error', error);
      return {};
    }
  }

  isAuthenticated(): boolean {
    if (auth?.currentUser) return true;
    if (localUserOverride) return true;
    return Boolean(import.meta.env.VITE_LOCAL_USER_ID);
  }

  getUserId(): string | null {
    if (auth?.currentUser?.uid) return auth.currentUser.uid;
    if (localUserOverride) return localUserOverride.id;
    return import.meta.env.VITE_LOCAL_USER_ID || null;
  }
}

export const authAdapter = new HybridAuthAdapter();
