'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      // Allow access to login page even when not authenticated
      if (pathname === '/admin/login' || pathname === '/admin/setup') {
        return;
      }
      
      if (!user) {
        router.push('/admin/login');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isAdmin, loading, router, mounted, pathname]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Allow login page to render even when not authenticated
  if (pathname === '/admin/login'  || pathname === '/admin/setup') {
    return (
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    );
  }

  // Block other admin pages if not authenticated or not admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-15">
      {children}
    </div>
  );
}
