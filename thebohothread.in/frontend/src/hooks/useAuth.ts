'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi } from '@/lib/auth-api';

/**
 * useAuth – hydrates auth state from backend on mount
 * and provides helpers for checking auth status.
 */
export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authApi.me()
        .then((res) => { if (res.success && res.data) setAuth(res.data, token); })
        .catch(() => clearAuth());
    }
  }, [token]);

  return { user, token, isAuthenticated };
}

/**
 * useRequireAuth – redirect to login if not authenticated
 */
export function useRequireAuth(requiredRole?: string) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace('/');
    }
  }, [isAuthenticated, user, requiredRole]);

  return { user, isAuthenticated };
}
