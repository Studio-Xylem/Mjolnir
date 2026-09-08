export interface AuthAdapter {
  getHeaders(): Promise<Record<string, string>>;
  isAuthenticated(): boolean;
  getUserId(): string | null;
}

export class LocalAuthAdapter implements AuthAdapter {
  async getHeaders(): Promise<Record<string, string>> {
    return {
      'X-User-Id': import.meta.env.VITE_LOCAL_USER_ID || 'local-user',
      'X-User-Email': 'local@example.test',
      'X-User-Name': 'Local User',
    };
  }

  isAuthenticated(): boolean {
    return true;
  }

  getUserId(): string | null {
    return import.meta.env.VITE_LOCAL_USER_ID || 'local-user';
  }
}

export class FirebaseAuthAdapter implements AuthAdapter {
  async getHeaders(): Promise<Record<string, string>> {
    try {
      const firebaseAuthModule = 'firebase/auth';
      const { getAuth } = await import(/* @vite-ignore */ firebaseAuthModule);
      const auth = getAuth();
      const user = auth.currentUser;

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
    // In a real app, this might check a synchronous auth state store
    return true; 
  }

  getUserId(): string | null {
    return null;
  }
}

export function createAuthAdapter(): AuthAdapter {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return new FirebaseAuthAdapter();
  }
  return new LocalAuthAdapter();
}

export const authAdapter = createAuthAdapter();
