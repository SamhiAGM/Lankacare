'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { getRoleHomeUrl } from '@/lib/rbac';
import {
  LayoutDashboard, Building2, UserCheck, Users, Calendar,
  GitPullRequest, Pill, ShieldAlert, Siren,
  Flag, FileBarChart2, Megaphone,
  Settings, ChevronLeft, ChevronRight, Activity, ShieldCheck,
  Compass, Bug, Database, MapPin, Layers, RefreshCw
} from 'lucide-react';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 SECTION 82 ROLE-SPECIFIC NAVIGATION MENUS
// ─────────────────────────────────────────────────────────────────────────────

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emergencyHighlight?: boolean;
}

const ROLE_NAV: Record<UserRole, NavItemDef[]> = {
  [UserRole.CITIZEN]: [
    { label: 'Citizen Home', href: '/citizen', icon: LayoutDashboard },
    { label: 'Find Care', href: '/find-care', icon: Compass },
    { label: 'Hospitals', href: '/hospitals', icon: Building2 },
    { label: 'Sri Lanka Map', href: '/map', icon: MapPin },
    { label: 'Appointments', href: '/citizen/appointments', icon: Calendar },
    { label: 'My Referrals', href: '/citizen/referrals', icon: GitPullRequest },
    { label: 'Health Info', href: '/citizen/health-information', icon: Bug },
    { label: 'Emergency 1990', href: '/emergency', icon: Siren, emergencyHighlight: true },
    { label: 'My Health Profile', href: '/citizen/profile', icon: UserCheck },
  ],
  [UserRole.DOCTOR]: [
    { label: 'Doctor Workspace', href: '/doctor', icon: LayoutDashboard },
    { label: 'My Patients', href: '/patients', icon: Users },
    { label: 'Admissions', href: '/patients/admissions', icon: Activity },
    { label: 'Discharges', href: '/doctor', icon: UserCheck },
    { label: 'Referrals', href: '/referrals', icon: GitPullRequest },
    { label: 'Duty Roster', href: '/staff/schedule', icon: Calendar },
    { label: 'Clinical Tasks', href: '/doctor', icon: Layers },
    { label: 'Notifications', href: '/notifications', icon: Megaphone },
  ],
  [UserRole.NURSE]: [
    { label: 'Staff Dashboard', href: '/staff', icon: LayoutDashboard },
    { label: 'Ward Patients', href: '/patients', icon: Users },
    { label: 'Ward Care', href: '/staff', icon: Building2 },
    { label: 'Nursing Tasks', href: '/staff', icon: Layers },
    { label: 'Duty Roster', href: '/staff/schedule', icon: Calendar },
    { label: 'Transfers', href: '/referrals', icon: GitPullRequest },
    { label: 'Notifications', href: '/notifications', icon: Megaphone },
  ],
  [UserRole.HEALTH_WORKER]: [
    { label: 'Staff Dashboard', href: '/staff', icon: LayoutDashboard },
    { label: 'Field Surveillance', href: '/surveillance', icon: ShieldAlert },
    { label: 'Dengue Reporting', href: '/dengue', icon: Bug },
    { label: 'Campaigns', href: '/campaigns', icon: Flag },
    { label: 'Duty Roster', href: '/staff/schedule', icon: Calendar },
    { label: 'Notifications', href: '/notifications', icon: Megaphone },
  ],
  [UserRole.PHARMACIST]: [
    { label: 'Pharmacy Dashboard', href: '/pharmacist', icon: LayoutDashboard },
    { label: 'Medicines', href: '/medicines', icon: Pill },
    { label: 'Inventory Depot', href: '/pharmacist', icon: Layers },
    { label: 'Expiry Monitor', href: '/pharmacist', icon: Calendar },
    { label: 'Stock Alerts', href: '/pharmacist', icon: ShieldAlert },
    { label: 'Stock Reports', href: '/reports', icon: FileBarChart2 },
  ],
  [UserRole.HOSPITAL_ADMIN]: [
    { label: 'Hospital Admin', href: '/hospital-admin', icon: LayoutDashboard },
    { label: 'Hospital Overview', href: '/hospitals/kinniya', icon: Building2 },
    { label: 'Bed Allocation', href: '/hospitals/kinniya/beds', icon: Activity },
    { label: 'Staff Directory', href: '/staff', icon: UserCheck },
    { label: 'Duty Roster', href: '/staff/schedule', icon: Calendar },
    { label: 'Medicines Depot', href: '/medicines', icon: Pill },
    { label: 'Admissions', href: '/patients/admissions', icon: Users },
    { label: 'Referral Flow', href: '/referrals', icon: GitPullRequest },
    { label: 'Facility Reports', href: '/reports', icon: FileBarChart2 },
  ],
  [UserRole.DISTRICT_ADMIN]: [
    { label: 'District Dashboard', href: '/district-officer', icon: LayoutDashboard },
    { label: 'District Health Map', href: '/district-officer/map', icon: MapPin },
    { label: 'District Hospitals', href: '/hospitals', icon: Building2 },
    { label: 'Dengue & PHI Units', href: '/dengue', icon: Bug },
    { label: 'District Referrals', href: '/referrals', icon: GitPullRequest },
    { label: 'Epidemiology Analytics', href: '/surveillance', icon: Activity },
    { label: 'Public Alerts', href: '/notifications', icon: Megaphone },
  ],
  [UserRole.PROVINCIAL_ADMIN]: [
    { label: 'Provincial Dashboard', href: '/provincial-officer', icon: LayoutDashboard },
    { label: 'Province Health Map', href: '/map', icon: MapPin },
    { label: 'Districts Comparison', href: '/provincial-officer', icon: Layers },
    { label: 'Provincial Hospitals', href: '/hospitals', icon: Building2 },
    { label: 'Public Health Stats', href: '/dengue', icon: Bug },
    { label: 'Surveillance Trends', href: '/surveillance', icon: Activity },
    { label: 'Provincial Reports', href: '/reports', icon: FileBarChart2 },
  ],
  [UserRole.MINISTRY_OFFICER]: [
    { label: 'National Dashboard', href: '/ministry', icon: LayoutDashboard },
    { label: 'National Health Map', href: '/map', icon: MapPin },
    { label: 'Hospital Network', href: '/hospitals', icon: Building2 },
    { label: 'Epidemiology & Dengue', href: '/dengue', icon: Bug },
    { label: 'Inter-Hospital Referrals', href: '/referrals', icon: GitPullRequest },
    { label: 'Essential Medicines', href: '/medicines', icon: Pill },
    { label: 'National Blood Bank', href: '/ministry', icon: Activity },
    { label: 'Workforce Deployment', href: '/staff', icon: UserCheck },
    { label: 'National Analytics', href: '/surveillance', icon: FileBarChart2 },
    { label: 'Data Quality Audits', href: '/admin/data-quality', icon: ShieldCheck },
  ],
  [UserRole.MINISTRY_ADMIN]: [
    { label: 'Ministry Admin', href: '/ministry-admin', icon: LayoutDashboard },
    { label: 'Institution Registry', href: '/hospitals', icon: Building2 },
    { label: 'User Roles & Scope', href: '/admin/permissions', icon: ShieldCheck },
    { label: 'Dataset Approvals', href: '/admin/data', icon: Database },
    { label: 'Policy Announcements', href: '/announcements', icon: Megaphone },
    { label: 'National Audit Logs', href: '/admin/permissions', icon: FileBarChart2 },
    { label: 'System Configuration', href: '/settings', icon: Settings },
  ],
  [UserRole.DATA_ADMIN]: [
    { label: 'Data Pipeline', href: '/data-admin', icon: Database },
    { label: 'Data Sources', href: '/data-admin', icon: Layers },
    { label: 'Validation & Deduplication', href: '/data-admin', icon: ShieldCheck },
    { label: 'Data Quality Metrics', href: '/admin/data-quality', icon: Activity },
    { label: 'Dataset Rollbacks', href: '/data-admin', icon: GitPullRequest },
    { label: 'Dataset Reports', href: '/reports', icon: FileBarChart2 },
  ],
  [UserRole.SUPER_ADMIN]: [
    { label: 'System Health', href: '/system-admin', icon: Activity },
    { label: 'User Roles & RBAC', href: '/admin/permissions', icon: ShieldCheck },
    { label: 'Security & Audit Logs', href: '/system-admin', icon: ShieldAlert },
    { label: 'Integrations & APIs', href: '/system-admin', icon: Layers },
    { label: 'Infrastructure Health', href: '/system-admin', icon: Database },
    { label: 'Platform Config', href: '/settings', icon: Settings },
  ],
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, switchRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const role = user?.role || UserRole.CITIZEN;
  const currentNav = ROLE_NAV[role] || ROLE_NAV[UserRole.CITIZEN];

  const roleColors: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'bg-purple-900/60 text-purple-300 border-purple-700',
    [UserRole.MINISTRY_ADMIN]: 'bg-teal-900/60 text-teal-300 border-teal-700',
    [UserRole.MINISTRY_OFFICER]: 'bg-cyan-900/60 text-cyan-300 border-cyan-700',
    [UserRole.DATA_ADMIN]: 'bg-blue-900/60 text-blue-300 border-blue-700',
    [UserRole.PROVINCIAL_ADMIN]: 'bg-sky-900/60 text-sky-300 border-sky-700',
    [UserRole.DISTRICT_ADMIN]: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
    [UserRole.HOSPITAL_ADMIN]: 'bg-blue-900/60 text-blue-300 border-blue-700',
    [UserRole.DOCTOR]: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    [UserRole.NURSE]: 'bg-emerald-900/40 text-emerald-200 border-emerald-800',
    [UserRole.HEALTH_WORKER]: 'bg-amber-900/60 text-amber-300 border-amber-700',
    [UserRole.PHARMACIST]: 'bg-orange-900/60 text-orange-300 border-orange-700',
    [UserRole.CITIZEN]: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleSwitcher(false);
    const dest = getRoleHomeUrl(newRole);
    router.push(dest);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-800 transition-all duration-300 select-none',
          collapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* LankaCare Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link href={getRoleHomeUrl(role)} className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-900/30">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold tracking-tight text-white truncate">
                  LankaCare
                </h1>
                <p className="text-[10px] text-teal-400 font-medium tracking-wide uppercase truncate">
                  Connected Health Portals
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Tag & Controlled Switcher (Section 87) */}
        {!collapsed && user && (
          <div className="mx-3 my-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 relative">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      'inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider',
                      roleColors[role]
                    )}
                  >
                    {role.replace('_', ' ')}
                  </span>
                  {user.scope?.district && (
                    <span className="text-[10px] text-slate-400 truncate">
                      • {user.scope.district}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="p-1 rounded-md text-slate-400 hover:text-teal-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                title="Switch Active Persona & Portal (Controlled Demo)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Role Switcher Panel */}
            {showRoleSwitcher && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-50 max-h-72 overflow-y-auto space-y-1">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider px-2 py-1">
                  Switch Role Persona:
                </p>
                {Object.values(UserRole).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSwitch(r)}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer',
                      role === r
                        ? 'bg-teal-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <span className="truncate">{r.replace('_', ' ')}</span>
                    {role === r && <ShieldCheck className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Role-Specific Nav Items List (Section 82) */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {currentNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 relative cursor-pointer',
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
                  item.emergencyHighlight && !isActive && 'text-rose-400 hover:text-rose-300'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : item.emergencyHighlight ? 'text-rose-400' : 'text-slate-400 group-hover:text-teal-400'
                  )}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {item.emergencyHighlight && !collapsed && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — Government Hotline */}
        {!collapsed && (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-white font-semibold">
              <span>National Emergency Hotline</span>
              <span className="text-teal-400 font-bold">1990</span>
            </div>
            <p className="text-[10px] text-slate-400">Suwa Seriya Pre-Hospital Ambulance Service</p>
          </div>
        )}
      </aside>
    </>
  );
};
