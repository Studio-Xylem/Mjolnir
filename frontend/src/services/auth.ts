export interface AuthAdapter {
  getHeaders(): Promise<Record<string, string>>;
  isAuthenticated(): boolean;
  getUserId(): string | null;
}

const TOKEN_KEY = 'mjolnir_access_token';
const USER_KEY = 'mjolnir_user';

export class JwtAuthAdapter implements AuthAdapter {
  async getHeaders(): Promise<Record<string, string>> {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }

  getUserId(): string | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user).id : null;
  }
}

export const authAdapter = new JwtAuthAdapter();
export const authStorage = { TOKEN_KEY, USER_KEY };
