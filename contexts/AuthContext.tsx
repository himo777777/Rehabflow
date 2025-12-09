/**
 * Authentication Context for RehabFlow
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import {
  AuthUser,
  AuthState,
  SignUpData,
  SignInData,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  hasRole,
  UserRole
} from '../services/authService';

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<{ error: string | null }>;
  signIn: (data: SignInData) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignUp = useCallback(async (data: SignUpData): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const result = await signUp(data);
      if (result.user) {
        setUser(result.user);
      }
      return { error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async (data: SignInData): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const result = await signIn(data);
      if (result.user) {
        setUser(result.user);
      }
      return { error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async (): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const result = await signOut();
      if (!result.error) {
        setUser(null);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkRole = useCallback((role: UserRole | UserRole[]): boolean => {
    return hasRole(user, role);
  }, [user]);

  const refreshUser = useCallback(async (): Promise<void> => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    hasRole: checkRole,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * HOC for protecting routes that require authentication
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole | UserRole[]
): React.FC<P> => {
  return (props: P) => {
    const { isAuthenticated, isLoading, hasRole, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Laddar...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to home (which shows login modal if needed)
      return <Navigate to="/" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Åtkomst nekad</h2>
            <p className="text-slate-600 mb-4">
              Du har inte behörighet att se denna sida.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Gå till startsidan
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;
