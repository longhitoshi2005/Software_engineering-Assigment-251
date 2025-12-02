"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, hasRole, UserInfo } from '@/lib/auth';
import { Role } from '@/lib/role';
import Swal from 'sweetalert2';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  redirectTo?: string;
}

/**
 * Component to protect routes that require authentication
 * Optionally checks for specific roles
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!isMounted) return;

        // Not authenticated
        if (!currentUser || !currentUser.is_active) {
          setIsAuthorized(false); // Set state immediately to stop loading screen
          await Swal.fire({
            title: 'Authentication Required',
            text: 'Please log in first to access this page.',
            icon: 'warning',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#1e3a8a',
            allowOutsideClick: false,
          });
          router.push(redirectTo);
          return;
        }

        // Check roles if required
        if (requiredRoles.length > 0) {
          const authorized = hasRole(currentUser.roles, requiredRoles);
          if (!authorized) {
            setIsAuthorized(false); // Set state immediately to stop loading screen
            await Swal.fire({
              title: 'Access Denied',
              text: 'You do not have permission to access this page.',
              icon: 'error',
              confirmButtonText: 'Go Back',
              confirmButtonColor: '#1e3a8a',
              allowOutsideClick: false,
            });
            router.back();
            return;
          }
        }

        setUser(currentUser);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsAuthorized(false); // Set state immediately to stop loading screen
          await Swal.fire({
            title: 'Authentication Required',
            text: 'Please log in first to access this page.',
            icon: 'warning',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#1e3a8a',
            allowOutsideClick: false,
          });
          router.push(redirectTo);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Show loading state while checking auth
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  return isAuthorized ? <>{children}</> : null;
}
