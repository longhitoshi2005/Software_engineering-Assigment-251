/**
 * Auth utility functions for client-side authentication
 */

import api from './api';
import { Role } from './role';

export interface UserInfo {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  roles: Role[];
  is_active: boolean;
}

/**
 * Fetch current user info from backend using cookie
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const user = await api.get('/users/me');
    return user;
  } catch (error) {
    // Expected case: user is not authenticated (401)
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return null;
    }
    // Log unexpected errors
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.is_active;
}

/**
 * Check if user has any of the required roles
 */
export function hasRole(userRoles: Role[], requiredRoles: Role[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
  }
}
