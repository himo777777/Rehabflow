/**
 * Authentication Service for RehabFlow
 * Handles user authentication, registration, and role management
 */

import { supabase } from './supabaseClient';
import { logger } from '../lib/logger';

export type UserRole = 'patient' | 'provider' | 'admin';

// ============================================
// SECURE PASSWORD HASHING (Web Crypto API)
// ============================================

/**
 * Hash a password using PBKDF2 with a random salt
 * Returns base64 encoded: salt:hash
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Combine salt and hash, encode as base64
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const hashBase64 = btoa(String.fromCharCode(...new Uint8Array(hash)));

  return `${saltBase64}:${hashBase64}`;
}

/**
 * Verify a password against a stored hash
 * Uses timing-safe comparison to prevent timing attacks
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltBase64, hashBase64] = storedHash.split(':');
    if (!saltBase64 || !hashBase64) return false;

    const encoder = new TextEncoder();
    const salt = new Uint8Array(atob(saltBase64).split('').map(c => c.charCodeAt(0)));
    const expectedHash = new Uint8Array(atob(hashBase64).split('').map(c => c.charCodeAt(0)));

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const actualHash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    const actualHashArray = new Uint8Array(actualHash);

    // Timing-safe comparison
    if (actualHashArray.length !== expectedHash.length) return false;

    let result = 0;
    for (let i = 0; i < actualHashArray.length; i++) {
      result |= actualHashArray[i] ^ expectedHash[i];
    }

    return result === 0;
  } catch {
    return false;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  clinicId?: string;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  clinicId?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Storage key for demo mode (when Supabase is not configured)
const DEMO_USER_KEY = 'rehabflow_demo_user';
const DEMO_USERS_KEY = 'rehabflow_demo_users';

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

/**
 * Sign up a new user
 */
export const signUp = async (data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (!supabase) {
    // Demo mode - store in localStorage
    return signUpDemo(data);
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
          role: data.role,
          clinic_id: data.clinicId
        }
      }
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Registrering misslyckades' };
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: data.email,
        role: data.role,
        display_name: data.displayName,
        clinic_id: data.clinicId,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      logger.error('Profile creation error', profileError);
    }

    const user: AuthUser = {
      id: authData.user.id,
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      clinicId: data.clinicId,
      createdAt: new Date().toISOString()
    };

    return { user, error: null };
  } catch (e) {
    logger.error('SignUp error', e);
    return { user: null, error: 'Ett fel uppstod vid registrering' };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> => {
  if (!supabase) {
    // Demo mode
    return signInDemo(data);
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (authError) {
      if (authError.message.includes('Invalid login')) {
        return { user: null, error: 'Fel email eller lösenord' };
      }
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Inloggning misslyckades' };
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const user: AuthUser = {
      id: authData.user.id,
      email: authData.user.email || data.email,
      role: profile?.role || 'patient',
      displayName: profile?.display_name || authData.user.user_metadata?.display_name || 'Användare',
      clinicId: profile?.clinic_id,
      createdAt: profile?.created_at || authData.user.created_at
    };

    return { user, error: null };
  } catch (e) {
    logger.error('SignIn error', e);
    return { user: null, error: 'Ett fel uppstod vid inloggning' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: string | null }> => {
  if (!supabase) {
    localStorage.removeItem(DEMO_USER_KEY);
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (e) {
    logger.error('SignOut error', e);
    return { error: 'Ett fel uppstod vid utloggning' };
  }
};

/**
 * Get the currently authenticated user
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!supabase) {
    // Demo mode
    const stored = localStorage.getItem(DEMO_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: profile?.role || user.user_metadata?.role || 'patient',
      displayName: profile?.display_name || user.user_metadata?.display_name || 'Användare',
      clinicId: profile?.clinic_id,
      createdAt: profile?.created_at || user.created_at
    };
  } catch (e) {
    logger.error('GetCurrentUser error', e);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<AuthUser, 'displayName' | 'clinicId'>>
): Promise<{ error: string | null }> => {
  if (!supabase) {
    // Demo mode
    const stored = localStorage.getItem(DEMO_USER_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        const updated = { ...user, ...updates };
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
        return { error: null };
      } catch {
        return { error: 'Kunde inte uppdatera profil' };
      }
    }
    return { error: 'Ingen användare inloggad' };
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({
        display_name: updates.displayName,
        clinic_id: updates.clinicId
      })
      .eq('id', userId);

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (e) {
    logger.error('UpdateProfile error', e);
    return { error: 'Ett fel uppstod vid uppdatering' };
  }
};

/**
 * Check if user has required role
 */
export const hasRole = (user: AuthUser | null, requiredRole: UserRole | UserRole[]): boolean => {
  if (!user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  // Admin has access to everything
  if (user.role === 'admin') return true;

  return roles.includes(user.role);
};

/**
 * Demo mode sign up (localStorage-based)
 * SECURITY: Now uses PBKDF2 password hashing
 */
const signUpDemo = async (data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    // Get existing demo users
    const existingUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');

    // Check if email already exists
    if (existingUsers.some((u: DemoUser) => u.email === data.email)) {
      return { user: null, error: 'Email redan registrerad' };
    }

    // Hash password using PBKDF2 before storing
    const passwordHash = await hashPassword(data.password);

    const user: AuthUser = {
      id: crypto.randomUUID(),
      email: data.email,
      role: data.role,
      displayName: data.displayName,
      clinicId: data.clinicId,
      createdAt: new Date().toISOString()
    };

    // Store user with hashed password (NEVER plaintext)
    existingUsers.push({ ...user, passwordHash });
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(existingUsers));

    // Set as current user (without password)
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));

    logger.info('Demo user registered successfully', { email: data.email });
    return { user, error: null };
  } catch (e) {
    logger.error('Demo signup failed', e);
    return { user: null, error: 'Registrering misslyckades' };
  }
};

// Rate limiting for demo login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if lockout time has passed
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if locked out
  if (attempts.count >= MAX_ATTEMPTS) {
    return false;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}

function resetRateLimit(email: string): void {
  loginAttempts.delete(email);
}

// Type for stored demo users
interface DemoUser extends AuthUser {
  passwordHash: string;
}

/**
 * Demo mode sign in (localStorage-based)
 * SECURITY: Uses secure password verification with rate limiting
 */
const signInDemo = async (data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    // Check rate limiting
    if (!checkRateLimit(data.email)) {
      logger.warn('Login rate limit exceeded', { email: data.email });
      return { user: null, error: 'För många inloggningsförsök. Försök igen om 15 minuter.' };
    }

    const existingUsers: DemoUser[] = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');

    const foundUser = existingUsers.find((u) => u.email === data.email);

    if (!foundUser) {
      return { user: null, error: 'Fel email eller lösenord' };
    }

    // Verify password using timing-safe comparison
    const isValid = await verifyPassword(data.password, foundUser.passwordHash);

    if (!isValid) {
      logger.warn('Invalid password attempt', { email: data.email });
      return { user: null, error: 'Fel email eller lösenord' };
    }

    // Reset rate limit on successful login
    resetRateLimit(data.email);

    // Extract user without password hash
    const { passwordHash: _hash, ...user } = foundUser;
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));

    logger.info('Demo user signed in', { email: data.email });
    return { user, error: null };
  } catch (e) {
    logger.error('Demo signin failed', e);
    return { user: null, error: 'Inloggning misslyckades' };
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void): (() => void) => {
  if (!supabase) {
    // Demo mode - no real-time updates, just return current state
    getCurrentUser().then(callback);
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      callback(null);
      return;
    }

    const user = await getCurrentUser();
    callback(user);
  });

  return () => {
    subscription.unsubscribe();
  };
};
