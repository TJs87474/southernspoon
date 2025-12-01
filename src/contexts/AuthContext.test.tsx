import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { AuthProvider, useAuth } from './AuthContext';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('../firebase/config', () => ({
  auth: {},
  db: {},
}));

describe('Authentication System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock onAuthStateChanged to immediately call callback with null
    vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });
  });

  /**
   * Feature: southern-spoon, Property 1: Successful authentication grants access
   * Validates: Requirements 1.1, 1.2
   */
  it('property: successful authentication grants access for any valid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 6, maxLength: 20 }),
        async (email, password) => {
          // Mock successful authentication
          const mockUser = {
            uid: 'test-uid',
            email,
            emailVerified: false,
          };

          vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
            user: mockUser,
          } as any);

          vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
            user: mockUser,
          } as any);

          // Test registration
          const { result: registerResult } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          await waitFor(() => {
            expect(registerResult.current.loading).toBe(false);
          });

          const registerCredential = await registerResult.current.register(email, password);
          expect(registerCredential.user.email).toBe(email);

          // Test login
          const { result: loginResult } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          await waitFor(() => {
            expect(loginResult.current.loading).toBe(false);
          });

          const loginCredential = await loginResult.current.login(email, password);
          expect(loginCredential.user.email).toBe(email);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: southern-spoon, Property 2: Invalid credentials are rejected
   * Validates: Requirements 1.3
   */
  it('property: invalid credentials are rejected for any invalid input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.string({ maxLength: 5 }),
          fc.constant('invalid-email'),
          fc.constant('no@domain')
        ),
        fc.oneof(
          fc.constant(''),
          fc.string({ maxLength: 5 }),
          fc.constant('short')
        ),
        async (email, password) => {
          // Mock authentication failure
          vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
            code: 'auth/invalid-credential',
            message: 'Invalid credentials',
          });

          vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
            code: 'auth/invalid-email',
            message: 'Invalid email',
          });

          const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // Should reject invalid login
          await expect(result.current.login(email, password)).rejects.toThrow();

          // Should reject invalid registration
          await expect(result.current.register(email, password)).rejects.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: southern-spoon, Property 3: Session persistence until logout
   * Validates: Requirements 1.4
   */
  it('property: session persists until explicit logout for any authenticated user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 6, maxLength: 20 }),
        async (email, password) => {
          const mockUser = {
            uid: 'test-uid',
            email,
            emailVerified: false,
          };

          // Mock authenticated state
          vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            callback(mockUser as any);
            return vi.fn();
          });

          vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
            user: mockUser,
          } as any);

          vi.mocked(signOut).mockResolvedValue(undefined);

          const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          // Wait for auth state to load
          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          });

          // User should be authenticated
          await result.current.login(email, password);
          expect(result.current.currentUser).toBeTruthy();

          // Session should persist (currentUser remains set)
          expect(result.current.currentUser?.email).toBe(email);

          // After logout, session should end
          await result.current.logout();
          expect(signOut).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
