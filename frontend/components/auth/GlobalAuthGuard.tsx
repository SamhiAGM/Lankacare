'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const GlobalAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') || 
    pathname.startsWith('/verify-email');

  useEffect(() => {
    if (mounted && !isAuthenticated && !isAuthRoute) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, pathname, router, isAuthRoute]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!isAuthenticated && !isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-medium tracking-wide uppercase">Redirecting to Login...</p>
      </div>
    );
  }

  return <>{children}</>;
};
