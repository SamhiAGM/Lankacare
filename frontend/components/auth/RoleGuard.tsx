'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole, Permission, UserScope } from '@/types';
import { hasPermission } from '@/lib/rbac';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: Permission;
  requiredScope?: Partial<UserScope>;
  fallbackUrl?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  requiredScope,
  fallbackUrl = '/403',
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If not authenticated, route to login
    if (!isAuthenticated || !user) {
      // Small delay to allow session hydration
      const timeout = setTimeout(() => {
        if (!isAuthenticated || !user) {
          router.replace('/login');
        }
      }, 300);
      return () => clearTimeout(timeout);
    }

    // Role check
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        setAuthorized(false);
        router.replace(fallbackUrl);
        return;
      }
    }

    // Permission check
    if (requiredPermission) {
      if (!hasPermission(user, requiredPermission, requiredScope)) {
        setAuthorized(false);
        router.replace(fallbackUrl);
        return;
      }
    }

    setAuthorized(true);
  }, [user, isAuthenticated, allowedRoles, requiredPermission, requiredScope, fallbackUrl, router]);

  if (authorized === null) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-xs font-medium tracking-wide uppercase">Verifying Authorization & Scopes...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Redirecting to Access Restricted (403)...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
