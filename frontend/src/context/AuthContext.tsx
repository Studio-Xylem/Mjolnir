import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authAdapter, authStorage } from '../services/auth';
import { getCurrentUser, loginUser, registerUser } from '../services/users';
import { User } from '../models';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authAdapter.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isAuth = authAdapter.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
        } catch (err: any) {
          if (err.status === 404 || err.message?.includes('404')) {
            setUser(null);
          } else {
            setError(err.message || 'Failed to fetch user profile');
          }
        }
      } else {
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser(email, password);
      localStorage.setItem(authStorage.TOKEN_KEY, result.token);
      localStorage.setItem(authStorage.USER_KEY, JSON.stringify(result.user));
      await refreshUser();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerUser(username, email, password);
      localStorage.setItem(authStorage.TOKEN_KEY, result.token);
      localStorage.setItem(authStorage.USER_KEY, JSON.stringify(result.user));
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(authStorage.TOKEN_KEY);
      localStorage.removeItem(authStorage.USER_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    return undefined;
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    refreshUser,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
