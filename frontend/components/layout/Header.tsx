'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { UserRole, SystemNotification } from '@/types';
import { getNotifications, notificationService, getEmergencies } from '@/services/apiClient';
import {
  Menu, Search, Bell, Sun, Moon, Globe,
  Shield, LogOut, Check, Siren, User as UserIcon,
  ChevronDown, ExternalLink
} from 'lucide-react';

export interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenCommandPalette,
}) => {
  const router = useRouter();
  const { user, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeEmergenciesCount, setActiveEmergenciesCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(getNotifications());
    const emgs = getEmergencies().filter((e) => e.status === 'ACTIVE' || e.status === 'RESPONDING');
    setActiveEmergenciesCount(emgs.length);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications(getNotifications());
  };

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setIsProfileOpen(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 transition-colors">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search bar trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-center sm:justify-start gap-2.5 w-9 sm:w-full max-w-sm h-9 p-0 sm:px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors group cursor-pointer shrink-0 sm:min-w-0"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
          <span className="truncate hidden sm:inline-block">Search health services, hospitals, doctors...</span>
          <kbd className="hidden sm:inline-flex shrink-0 items-center rounded bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono border border-slate-200 dark:border-slate-700 text-slate-500 ml-auto">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Emergency Indicator, Notifications, Language, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Active Emergency Alert Beacon */}
        {activeEmergenciesCount > 0 && (
          <Link
            href="/emergency"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors animate-pulse"
            title={`${activeEmergenciesCount} active emergency incidents`}
          >
            <Siren className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency</span>
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeEmergenciesCount}
            </span>
          </Link>
        )}

        {/* Language Selector */}
        <div className="relative hidden sm:block" ref={langRef}>
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium cursor-pointer"
            aria-label="Change language"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden md:inline uppercase">{language}</span>
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs z-50 animate-in fade-in zoom-in-95">
              {[
                { code: 'en', label: 'English' },
                { code: 'si', label: 'සිංහල (Sinhala)' },
                { code: 'ta', label: 'தமிழ் (Tamil)' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code as any);
                    setIsLangOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer',
                    language === l.code ? 'text-teal-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>{l.label}</span>
                  {language === l.code && <Check className="w-3.5 h-3.5 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 translate-x-1/4 -translate-y-1/4">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-teal-600 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-500">No notifications.</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        notificationService.markAsRead(n.id);
                        setNotifications(getNotifications());
                        if (n.actionUrl) {
                          router.push(n.actionUrl);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={cn(
                        'p-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs',
                        !n.read && 'bg-teal-50/50 dark:bg-teal-950/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {n.priority}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                >
                  View all notifications <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu with 1-Click Role Switcher */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                {user?.name || 'Guest'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-1">
                {user?.role ? user.role.replace('_', ' ') : 'Citizen'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
                <p className="text-[10px] text-teal-600 font-semibold mt-0.5">
                  {user?.organization || 'Ministry of Health'}
                </p>
              </div>

              {/* Instant Role Switcher for seamless reviewer testing */}
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Switch Active Role (Demo)
                </p>
                <div className="space-y-1">
                  {[
                    { role: UserRole.MINISTRY_ADMIN, label: 'Ministry Admin' },
                    { role: UserRole.HOSPITAL_ADMIN, label: 'Hospital Admin' },
                    { role: UserRole.DOCTOR, label: 'Doctor' },
                    { role: UserRole.CITIZEN, label: 'Citizen' },
                    { role: UserRole.SUPER_ADMIN, label: 'Super Admin' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleChange(r.role)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-colors cursor-pointer',
                        user?.role === r.role
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-teal-500" /> {r.label}
                      </span>
                      {user?.role === r.role && <Check className="w-3 h-3 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <UserIcon className="w-3.5 h-3.5" /> My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
