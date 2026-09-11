import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { authAdapter } from '../services/auth';
import { auth } from '../services/firebase';
import { getCurrentUser, registerUser } from '../services/users';
import { User } from '../models';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  loginAsLocalUser: (id: string, name: string) => Promise<void>;
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
            const defaultName = auth?.currentUser?.displayName || auth?.currentUser?.email?.split('@')[0] || 'User';
            const profile = await registerUser(defaultName);
            setUser(profile);
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
    if (!auth) {
      throw new Error('Firebase Auth is not configured. Use Local Dev Mode instead.');
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await refreshUser();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured. Use Local Dev Mode instead.');
    }
    setIsLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const profile = await registerUser(username);
      setUser(profile);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Failed to register account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsLocalUser = async (id: string, name: string) => {
    if (authAdapter.setLocalUser) {
      authAdapter.setLocalUser(id, name);
    }
    await refreshUser();
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (auth?.currentUser) {
        await firebaseSignOut(auth);
      }
      if (authAdapter.clearLocalUser) {
        authAdapter.clearLocalUser();
      }
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
    return auth?.onAuthStateChanged(() => refreshUser());
  }, [refreshUser]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
    refreshUser,
    signIn,
    signUp,
    loginAsLocalUser,
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
