'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { user, token } = useAuthStore();

    useEffect(() => {
      if (!user || !token) {
        router.push('/login');
      }
    }, [user, token, router]);

    if (!user || !token) {
      return null;
    }

    return <Component {...props} />;
  };
}

export function withGuest<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function GuestComponent(props: P) {
    const router = useRouter();
    const { user, token } = useAuthStore();

    useEffect(() => {
      if (user && token) {
        router.push('/dashboard');
      }
    }, [user, token, router]);

    if (user && token) {
      return null;
    }

    return <Component {...props} />;
  };
}
