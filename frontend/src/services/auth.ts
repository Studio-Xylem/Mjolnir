import { auth } from './firebase';

export interface AuthAdapter {
  getHeaders(): Promise<Record<string, string>>;
  isAuthenticated(): boolean;
  getUserId(): string | null;
}

export class FirebaseAuthAdapter implements AuthAdapter {
  async getHeaders(): Promise<Record<string, string>> {
    try {
      const user = auth?.currentUser;

      if (user) {
        const token = await user.getIdToken();
        return {
          Authorization: `Bearer ${token}`,
        };
      }
      return {};
    } catch (error) {
      console.error('Firebase Auth error', error);
      return {};
    }
  }

  isAuthenticated(): boolean {
    return auth?.currentUser !== null && auth?.currentUser !== undefined;
  }

  getUserId(): string | null {
    return auth?.currentUser?.uid ?? null;
  }
}

export function createAuthAdapter(): AuthAdapter {
  return new FirebaseAuthAdapter();
}

export const authAdapter = createAuthAdapter();
