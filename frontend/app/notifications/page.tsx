'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCircle2, AlertCircle, AlertTriangle, Siren,
  Check, Trash2, Settings, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { getNotifications, notificationService } from '@/services/apiClient';
import { SystemNotification, NotificationPriority } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL'>('ALL');

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(getNotifications());
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications(getNotifications());
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    setNotifications([]);
    toast.info('Notification feed cleared');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    if (filter === 'CRITICAL') return n.priority === NotificationPriority.CRITICAL;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              National Health Notification & Dispatch Center
            </h1>
            {unreadCount > 0 && (
              <Badge variant="rose">{unreadCount} Unread Alerts</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time alerts spanning emergency trauma, medicine shortages, referrals, and clinical appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs"
            >
              <Check className="w-3.5 h-3.5" /> Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-slate-400 hover:text-rose-500 text-xs gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        {[
          { id: 'ALL', label: `All Alerts (${notifications.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'CRITICAL', label: 'Critical Emergencies' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filter === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Stream */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts in this category"
          description="Your notifications feed is currently clear."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const isCrit = n.priority === 'CRITICAL';
            const isHigh = n.priority === 'HIGH';

            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.read
                    ? 'bg-white dark:bg-slate-900 border-teal-500/50 shadow-xs ring-1 ring-teal-500/20'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCrit
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        : isHigh
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400'
                    }`}
                  >
                    {isCrit ? <Siren className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={isCrit ? 'rose' : isHigh ? 'amber' : 'teal'} size="sm">
                        {n.category}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {n.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!n.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs"
                    >
                      Mark Read
                    </Button>
                  )}
                  {n.actionUrl && (
                    <Link href={n.actionUrl}>
                      <Button variant="primary" size="sm" className="gap-1 text-xs">
                        View <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
