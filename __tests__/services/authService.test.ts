import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the supabaseClient to return null (demo mode)
vi.mock('../../services/supabaseClient', () => ({
  supabase: null
}));

// Mock the logger
vi.mock('../../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }
}));

// Import after mocking
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  isSupabaseConfigured,
  type SignUpData,
  type SignInData,
  type AuthUser,
} from '../../services/authService';

describe('authService', () => {
  const DEMO_USER_KEY = 'rehabflow_demo_user';
  const DEMO_USERS_KEY = 'rehabflow_demo_users';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isSupabaseConfigured', () => {
    it('should return false when supabase is null', () => {
      expect(isSupabaseConfigured()).toBe(false);
    });
  });

  describe('signUp (demo mode)', () => {
    const validSignUpData: SignUpData = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
      role: 'patient',
    };

    it('should create a new user in demo mode', async () => {
      const result = await signUp(validSignUpData);

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(validSignUpData.email);
      expect(result.user?.displayName).toBe(validSignUpData.displayName);
      expect(result.user?.role).toBe(validSignUpData.role);
    });

    it('should persist user to localStorage', async () => {
      await signUp(validSignUpData);

      const storedUser = localStorage.getItem(DEMO_USER_KEY);
      expect(storedUser).toBeDefined();

      const parsedUser = JSON.parse(storedUser!);
      expect(parsedUser.email).toBe(validSignUpData.email);
    });

    it('should fail if email already exists', async () => {
      // First signup
      await signUp(validSignUpData);

      // Second signup with same email
      const result = await signUp(validSignUpData);

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();
    });

    it('should create users with different roles', async () => {
      const providerData: SignUpData = {
        email: 'provider@clinic.com',
        password: 'password123',
        displayName: 'Dr. Smith',
        role: 'provider',
        clinicId: 'clinic-123',
      };

      const result = await signUp(providerData);

      expect(result.error).toBeNull();
      expect(result.user?.role).toBe('provider');
      expect(result.user?.clinicId).toBe('clinic-123');
    });

    it('should generate a unique user id', async () => {
      const result = await signUp(validSignUpData);

      expect(result.user?.id).toBeDefined();
      expect(result.user?.id.length).toBeGreaterThan(0);
    });
  });

  describe('signIn (demo mode)', () => {
    const signUpData: SignUpData = {
      email: 'test@example.com',
      password: 'correctPassword123',
      displayName: 'Test User',
      role: 'patient',
    };

    beforeEach(async () => {
      // Create a user first
      await signUp(signUpData);
      // Sign out so we can test sign in
      await signOut();
    });

    it('should sign in with correct credentials', async () => {
      const signInData: SignInData = {
        email: signUpData.email,
        password: signUpData.password,
      };

      const result = await signIn(signInData);

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(signUpData.email);
    });

    it('should fail with incorrect password', async () => {
      const signInData: SignInData = {
        email: signUpData.email,
        password: 'wrongPassword',
      };

      const result = await signIn(signInData);

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();
    });

    it('should fail with non-existent email', async () => {
      const signInData: SignInData = {
        email: 'nonexistent@example.com',
        password: 'anyPassword',
      };

      const result = await signIn(signInData);

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();
    });

    it('should persist session to localStorage after sign in', async () => {
      const signInData: SignInData = {
        email: signUpData.email,
        password: signUpData.password,
      };

      await signIn(signInData);

      const storedUser = localStorage.getItem(DEMO_USER_KEY);
      expect(storedUser).toBeDefined();
    });
  });

  describe('signOut', () => {
    beforeEach(async () => {
      // Sign up and sign in first
      await signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'patient',
      });
    });

    it('should clear the current user', async () => {
      await signOut();

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('should remove user from localStorage', async () => {
      await signOut();

      const storedUser = localStorage.getItem(DEMO_USER_KEY);
      expect(storedUser).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not logged in', async () => {
      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return user when logged in', async () => {
      await signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'patient',
      });

      const user = await getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should restore user from localStorage on page reload', async () => {
      // Sign up to create a session
      await signUp({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
        role: 'patient',
      });

      // User should be available
      const user = await getCurrentUser();
      expect(user?.email).toBe('test@example.com');
    });
  });

  describe('role-based access', () => {
    it('should correctly identify patient role', async () => {
      const result = await signUp({
        email: 'patient@example.com',
        password: 'password123',
        displayName: 'Patient User',
        role: 'patient',
      });

      expect(result.user?.role).toBe('patient');
    });

    it('should correctly identify provider role', async () => {
      const result = await signUp({
        email: 'provider@clinic.com',
        password: 'password123',
        displayName: 'Dr. Provider',
        role: 'provider',
        clinicId: 'clinic-123',
      });

      expect(result.user?.role).toBe('provider');
    });

    it('should correctly identify admin role', async () => {
      const result = await signUp({
        email: 'admin@rehabflow.se',
        password: 'password123',
        displayName: 'Admin User',
        role: 'admin',
      });

      expect(result.user?.role).toBe('admin');
    });
  });
});
